import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Ip,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { eq, and, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import {
  CreateHoldDto,
  SendOtpDto,
  VerifyOtpDto,
  GetAvailableSlotsDto,
  CreateOnlineBookingDto,
  CancelOnlineBookingDto,
  OtpType,
  AvailableSlot,
  HoldResponse,
  BookingConfirmation,
} from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';
import { AppointmentHoldsService } from './appointment-holds.service';
import { OtpService } from './otp.service';
import { DepositsService } from './deposits.service';
import { ClientBookingRulesService } from './client-booking-rules.service';
import { ScheduledMessagesService } from '../notifications/scheduled-messages.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { randomUUID } from 'crypto';
import { ApiTags } from '@nestjs/swagger';

/**
 * Controller público para agendamento online
 * Não requer autenticação - acessível por clientes
 */
@ApiTags('PublicBooking')
@Public()
@Controller('public/booking')
export class PublicBookingController {
  private readonly logger = new Logger(PublicBookingController.name);

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly settingsService: OnlineBookingSettingsService,
    private readonly holdsService: AppointmentHoldsService,
    private readonly otpService: OtpService,
    private readonly depositsService: DepositsService,
    private readonly rulesService: ClientBookingRulesService,
    private readonly scheduledMessagesService: ScheduledMessagesService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  /**
   * Obtém informações do salão para booking
   */
  @Get(':salonSlug/info')
  async getSalonInfo(@Param('salonSlug') salonSlug: string) {
    const salon = await this.findSalonBySlug(salonSlug);
    const settings = await this.settingsService.getSettings(salon.id);

    if (!settings.enabled) {
      throw new BadRequestException('Agendamento online não está disponível');
    }

    return {
      salonId: salon.id,
      salonName: salon.name,
      welcomeMessage: settings.welcomeMessage,
      termsUrl: settings.termsUrl,
      requireTermsAcceptance: settings.requireTermsAcceptance,
      requirePhoneVerification: settings.requirePhoneVerification,
      minAdvanceHours: settings.minAdvanceHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      cancellationHours: settings.cancellationHours,
      allowRescheduling: settings.allowRescheduling,
    };
  }

  /**
   * Lista serviços disponíveis para agendamento online
   */
  @Get(':salonSlug/services')
  async getAvailableServices(@Param('salonSlug') salonSlug: string) {
    const salon = await this.findSalonBySlug(salonSlug);
    await this.checkBookingEnabled(salon.id);

    const services = await this.db
      .select({
        id: schema.services.id,
        name: schema.services.name,
        description: schema.services.description,
        category: schema.services.category,
        durationMinutes: schema.services.durationMinutes,
        basePrice: schema.services.basePrice,
      })
      .from(schema.services)
      .where(
        and(
          eq(schema.services.salonId, salon.id),
          eq(schema.services.active, true),
          eq(schema.services.allowOnlineBooking, true),
        ),
      )
      .orderBy(schema.services.name);

    return services;
  }

  /**
   * Lista profissionais disponíveis para um serviço
   */
  @Get(':salonSlug/professionals')
  async getAvailableProfessionals(
    @Param('salonSlug') salonSlug: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const salon = await this.findSalonBySlug(salonSlug);
    await this.checkBookingEnabled(salon.id);

    // Busca profissionais ativos (STYLIST ou isProfessional=true)
    const professionals = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.salonId, salon.id),
          eq(schema.users.active, true),
          or(
            eq(schema.users.role, 'STYLIST'),
            eq(schema.users.isProfessional, true),
          ),
        ),
      )
      .orderBy(schema.users.name);

    // Filtra por professional_services quando serviceId informado
    if (serviceId) {
      const sid = parseInt(serviceId, 10);
      if (!isNaN(sid)) {
        const enabledIds = await this.db
          .select({ professionalId: schema.professionalServices.professionalId })
          .from(schema.professionalServices)
          .innerJoin(schema.users, eq(schema.professionalServices.professionalId, schema.users.id))
          .where(
            and(
              eq(schema.professionalServices.serviceId, sid),
              eq(schema.professionalServices.enabledOnline, true),
              eq(schema.users.salonId, salon.id),
            ),
          );

        // Só filtra se existirem assignments (fallback legacy: sem filtro)
        if (enabledIds.length > 0) {
          const aptSet = new Set(enabledIds.map((r) => r.professionalId));
          return professionals.filter((p) => aptSet.has(p.id));
        }
      }
    }

    return professionals;
  }

  /**
   * Obtém horários disponíveis
   */
  @Get(':salonSlug/slots')
  async getAvailableSlots(
    @Param('salonSlug') salonSlug: string,
    @Query() query: GetAvailableSlotsDto,
  ): Promise<AvailableSlot[]> {
    const salon = await this.findSalonBySlug(salonSlug);
    await this.checkBookingEnabled(salon.id);

    const { professionalId, serviceId, startDate, endDate } = query;
    const finalEndDate = endDate || startDate;

    // Busca serviço
    let service: typeof schema.services.$inferSelect | null = null;
    if (serviceId) {
      const [svc] = await this.db
        .select()
        .from(schema.services)
        .where(
          and(
            eq(schema.services.id, serviceId),
            eq(schema.services.salonId, salon.id),
            eq(schema.services.active, true),
          ),
        )
        .limit(1);
      service = svc;
    }

    // Busca profissionais (STYLIST ou isProfessional=true)
    const professionalsConditions = [
      eq(schema.users.salonId, salon.id),
      eq(schema.users.active, true),
      or(
        eq(schema.users.role, 'STYLIST'),
        eq(schema.users.isProfessional, true),
      ),
    ];

    if (professionalId) {
      professionalsConditions.push(eq(schema.users.id, professionalId));
    }

    let professionals = await this.db
      .select()
      .from(schema.users)
      .where(and(...professionalsConditions));

    // Filtra por professional_services (enabledOnline) quando serviceId informado
    if (serviceId) {
      const enabledIds = await this.db
        .select({ professionalId: schema.professionalServices.professionalId })
        .from(schema.professionalServices)
        .innerJoin(schema.users, eq(schema.professionalServices.professionalId, schema.users.id))
        .where(
          and(
            eq(schema.professionalServices.serviceId, serviceId),
            eq(schema.professionalServices.enabledOnline, true),
            eq(schema.users.salonId, salon.id),
          ),
        );

      if (enabledIds.length > 0) {
        const aptSet = new Set(enabledIds.map((r) => r.professionalId));
        professionals = professionals.filter((p) => aptSet.has(p.id));
      }
    }

    const slots: AvailableSlot[] = [];

    // Para cada profissional, gera slots disponíveis
    for (const professional of professionals) {
      const professionalSlots = await this.generateSlotsForProfessional(
        salon.id,
        professional,
        service,
        startDate,
        finalEndDate,
      );
      slots.push(...professionalSlots);
    }

    return slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }

  /**
   * Verifica elegibilidade do cliente antes de criar hold
   */
  @Post(':salonSlug/check-eligibility')
  async checkClientEligibility(
    @Param('salonSlug') salonSlug: string,
    @Body() body: { clientPhone: string; serviceId?: number },
  ) {
    const salon = await this.findSalonBySlug(salonSlug);
    await this.checkBookingEnabled(salon.id);

    const eligibility = await this.rulesService.checkBookingEligibility(
      salon.id,
      body.clientPhone,
      body.serviceId,
    );

    // Busca configuracoes para calcular deposito
    const settings = await this.settingsService.getSettings(salon.id);
    let depositRequired = eligibility.requiresDeposit || false;
    let depositAmount: number | null = null;

    // Se cliente tem regra de deposito OU configuracao global exige
    if (eligibility.requiresDeposit || settings.depositType !== 'NONE') {
      depositRequired = true;

      // Busca servico para calcular valor
      if (body.serviceId) {
        const [service] = await this.db
          .select()
          .from(schema.services)
          .where(eq(schema.services.id, body.serviceId))
          .limit(1);

        if (service) {
          if (eligibility.requiresDeposit) {
            // Cliente com regra especifica: 20% do valor
            depositAmount = parseFloat(service.basePrice) * 0.2;
          } else {
            // Configuracao global
            depositAmount = await this.depositsService.calculateDepositAmount(
              salon.id,
              parseFloat(service.basePrice),
            );
          }
        }
      }
    }

    return {
      canBook: eligibility.canBook,
      reason: eligibility.reason,
      requiresDeposit: depositRequired,
      depositAmount,
      isClientBlocked: !eligibility.canBook && eligibility.reason?.includes('bloqueado'),
    };
  }

  /**
   * Cria uma reserva temporária (hold)
   */
  @Post(':salonSlug/hold')
  async createHold(
    @Param('salonSlug') salonSlug: string,
    @Body() dto: CreateHoldDto,
    @Ip() clientIp: string,
  ): Promise<HoldResponse> {
    const salon = await this.findSalonBySlug(salonSlug);
    await this.checkBookingEnabled(salon.id);

    // Verifica elegibilidade do cliente
    const eligibility = await this.rulesService.checkBookingEligibility(
      salon.id,
      dto.clientPhone,
      dto.serviceId,
    );

    if (!eligibility.canBook) {
      throw new BadRequestException(eligibility.reason);
    }

    return this.holdsService.createHold(salon.id, dto, clientIp);
  }

  /**
   * Estende o tempo de uma reserva
   */
  @Post(':salonSlug/hold/:holdId/extend')
  async extendHold(
    @Param('salonSlug') salonSlug: string,
    @Param('holdId') holdId: string,
  ): Promise<HoldResponse> {
    const salon = await this.findSalonBySlug(salonSlug);
    return this.holdsService.extendHold(salon.id, holdId);
  }

  /**
   * Libera uma reserva
   */
  @Post(':salonSlug/hold/:holdId/release')
  async releaseHold(
    @Param('salonSlug') salonSlug: string,
    @Param('holdId') holdId: string,
  ): Promise<{ message: string }> {
    const salon = await this.findSalonBySlug(salonSlug);
    await this.holdsService.releaseHold(salon.id, holdId);
    return { message: 'Reserva liberada com sucesso' };
  }

  /**
   * Envia código OTP para verificação de telefone
   */
  @Post(':salonSlug/otp/send')
  async sendOtp(
    @Param('salonSlug') salonSlug: string,
    @Body() dto: SendOtpDto,
    @Ip() clientIp: string,
  ) {
    const salon = await this.findSalonBySlug(salonSlug);
    return this.otpService.sendOtp(salon.id, dto, clientIp);
  }

  /**
   * Verifica código OTP
   */
  @Post(':salonSlug/otp/verify')
  async verifyOtp(
    @Param('salonSlug') salonSlug: string,
    @Body() dto: VerifyOtpDto,
  ) {
    const salon = await this.findSalonBySlug(salonSlug);
    return this.otpService.verifyOtp(salon.id, dto);
  }

  /**
   * Confirma agendamento (converte hold em appointment)
   */
  @Post(':salonSlug/confirm')
  async confirmBooking(
    @Param('salonSlug') salonSlug: string,
    @Body() dto: CreateOnlineBookingDto,
    @Ip() clientIp: string,
  ): Promise<BookingConfirmation> {
    const salon = await this.findSalonBySlug(salonSlug);
    const settings = await this.settingsService.getSettings(salon.id);

    if (!settings.enabled) {
      throw new BadRequestException('Agendamento online não está disponível');
    }

    // Verifica verificação de telefone
    if (settings.requirePhoneVerification) {
      // Verifica se o telefone foi verificado recentemente (últimas 24h)
      const phoneVerified = await this.otpService.isPhoneVerifiedRecently(
        salon.id,
        dto.clientPhone,
      );

      if (!phoneVerified) {
        throw new BadRequestException('Telefone não verificado. Por favor, solicite um novo código.');
      }
    }

    // Verifica elegibilidade
    const eligibility = await this.rulesService.checkBookingEligibility(
      salon.id,
      dto.clientPhone,
      dto.serviceId,
    );

    if (!eligibility.canBook) {
      throw new BadRequestException(eligibility.reason);
    }

    // Busca ou cria cliente
    let client = await this.findOrCreateClient(salon.id, dto);

    // Busca serviço
    const [service] = await this.db
      .select()
      .from(schema.services)
      .where(
        and(
          eq(schema.services.id, dto.serviceId),
          eq(schema.services.salonId, salon.id),
        ),
      )
      .limit(1);

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Busca profissional
    const [professional] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, dto.professionalId))
      .limit(1);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    // Verifica bloqueios profissionais (pilar 1)
    const endTime = this.addMinutes(dto.time, service.durationMinutes);
    const hasBlock = await this.holdsService.checkBlockConflict(
      salon.id, dto.professionalId, dto.date, dto.time, endTime,
    );
    if (hasBlock) {
      throw new BadRequestException('Profissional tem bloqueio neste horário');
    }

    // Verifica conflitos
    const hasConflict = await this.holdsService.checkAppointmentConflict(
      salon.id,
      dto.professionalId,
      dto.date,
      dto.time,
      endTime,
    );

    if (hasConflict) {
      throw new BadRequestException('Este horário não está mais disponível');
    }

    // Gera token de acesso do cliente
    const clientAccessToken = randomUUID();
    const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    // Cria o agendamento
    const [appointment] = await this.db
      .insert(schema.appointments)
      .values({
        salonId: salon.id,
        clientId: client.id,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        clientEmail: dto.clientEmail,
        professionalId: dto.professionalId,
        serviceId: dto.serviceId,
        service: service.name,
        date: dto.date,
        time: dto.time,
        startTime: dto.time,
        endTime,
        duration: service.durationMinutes,
        price: service.basePrice,
        status: 'PENDING_CONFIRMATION',
        confirmationStatus: 'PENDING',
        source: 'ONLINE',
        notes: dto.notes,
        verifiedPhone: settings.requirePhoneVerification,
        clientAccessToken,
        clientAccessTokenExpiresAt: tokenExpiration,
        bookedOnlineAt: new Date(),
        clientIp,
      })
      .returning();

    this.logger.log(`Agendamento online criado: ${appointment.id}`);

    // Verifica se precisa de depósito
    let depositData: { amount?: string; pixCode?: string } = {};
    const depositAmount = await this.depositsService.calculateDepositAmount(
      salon.id,
      parseFloat(service.basePrice),
    );

    if (depositAmount > 0 || eligibility.requiresDeposit) {
      const finalAmount = depositAmount > 0 ? depositAmount : parseFloat(service.basePrice) * 0.2;
      const deposit = await this.depositsService.createDeposit(salon.id, {
        appointmentId: appointment.id,
        clientId: client.id,
        amount: finalAmount,
      });

      const pixData = await this.depositsService.generatePixPayment(salon.id, deposit.id);

      // Atualiza agendamento com depositId
      await this.db
        .update(schema.appointments)
        .set({ depositId: deposit.id })
        .where(eq(schema.appointments.id, appointment.id));

      depositData = {
        amount: finalAmount.toString(),
        pixCode: pixData.pixCode,
      };
    }

    // Agenda notificações automáticas (confirmação, lembrete 24h, lembrete 1h30)
    await this.scheduledMessagesService.scheduleAllAppointmentNotifications({
      ...appointment,
      professionalName: professional.name,
    });

    return {
      appointmentId: appointment.id,
      date: appointment.date,
      time: appointment.time,
      professionalName: professional.name,
      serviceName: service.name,
      clientAccessToken,
      depositRequired: !!depositData.amount,
      depositAmount: depositData.amount,
      depositPixCode: depositData.pixCode,
    };
  }

  /**
   * Consulta status de um agendamento pelo token
   */
  @Get(':salonSlug/appointment/:appointmentId')
  async getAppointmentStatus(
    @Param('salonSlug') salonSlug: string,
    @Param('appointmentId') appointmentId: string,
    @Query('token') token?: string,
  ) {
    const salon = await this.findSalonBySlug(salonSlug);

    const [appointment] = await this.db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id, appointmentId),
          eq(schema.appointments.salonId, salon.id),
        ),
      )
      .limit(1);

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verifica token se fornecido
    if (token && appointment.clientAccessToken !== token) {
      throw new BadRequestException('Token inválido');
    }

    // Busca depósito se houver
    let deposit = null;
    if (appointment.depositId) {
      deposit = await this.depositsService.getDeposit(salon.id, appointment.depositId);
    }

    return {
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      status: appointment.status,
      confirmationStatus: appointment.confirmationStatus,
      deposit: deposit ? {
        status: deposit.status,
        amount: deposit.amount,
        paidAt: deposit.paidAt,
      } : null,
    };
  }

  /**
   * Cancela um agendamento
   */
  @Post(':salonSlug/cancel')
  async cancelBooking(
    @Param('salonSlug') salonSlug: string,
    @Body() dto: CancelOnlineBookingDto,
  ) {
    const salon = await this.findSalonBySlug(salonSlug);
    // Settings carregadas para futura validação de regras de cancelamento
    void this.settingsService.getSettings(salon.id);

    const [appointment] = await this.db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id, dto.appointmentId),
          eq(schema.appointments.salonId, salon.id),
        ),
      )
      .limit(1);

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verifica autorização (token ou OTP)
    if (dto.clientAccessToken) {
      if (appointment.clientAccessToken !== dto.clientAccessToken) {
        throw new BadRequestException('Token inválido');
      }
    } else if (dto.otpCode && appointment.clientPhone) {
      const otpResult = await this.otpService.verifyOtp(salon.id, {
        phone: appointment.clientPhone,
        code: dto.otpCode,
        type: OtpType.CANCEL_BOOKING,
      });
      if (!otpResult.valid) {
        throw new BadRequestException(otpResult.message);
      }
    } else {
      throw new BadRequestException('Autorização inválida');
    }

    // Verifica se pode cancelar
    if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
      throw new BadRequestException('Este agendamento não pode ser cancelado');
    }

    // Processa cancelamento
    await this.db
      .update(schema.appointments)
      .set({
        status: 'CANCELLED',
        cancellationReason: dto.reason || 'Cancelado pelo cliente via agendamento online',
        updatedAt: new Date(),
      })
      .where(eq(schema.appointments.id, dto.appointmentId));

    // Processa depósito (reembolso se elegível)
    if (appointment.depositId) {
      const isEligible = await this.depositsService.isEligibleForRefund(
        salon.id,
        appointment.id,
      );

      if (isEligible) {
        await this.depositsService.refundDeposit(
          salon.id,
          appointment.depositId,
          'Cancelamento dentro do prazo',
        );
      } else {
        await this.depositsService.forfeitDeposit(
          salon.id,
          appointment.depositId,
          'Cancelamento fora do prazo',
        );
      }
    }

    this.logger.log(`Agendamento ${dto.appointmentId} cancelado pelo cliente`);

    return { message: 'Agendamento cancelado com sucesso' };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Busca salão pelo slug
   */
  private async findSalonBySlug(slug: string): Promise<schema.Salon> {
    const [salon] = await this.db
      .select()
      .from(schema.salons)
      .where(eq(schema.salons.slug, slug))
      .limit(1);

    if (!salon) {
      throw new NotFoundException('Salão não encontrado');
    }

    return salon;
  }

  /**
   * Verifica se booking está habilitado
   */
  private async checkBookingEnabled(salonId: string): Promise<void> {
    const isEnabled = await this.settingsService.isEnabled(salonId);
    if (!isEnabled) {
      throw new BadRequestException('Agendamento online não está disponível');
    }
  }

  /**
   * Busca ou cria cliente
   */
  private async findOrCreateClient(
    salonId: string,
    dto: CreateOnlineBookingDto,
  ): Promise<schema.Client> {
    // Busca cliente existente
    let [client] = await this.db
      .select()
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.salonId, salonId),
          eq(schema.clients.phone, dto.clientPhone),
        ),
      )
      .limit(1);

    if (!client) {
      // Cria novo cliente
      [client] = await this.db
        .insert(schema.clients)
        .values({
          salonId,
          name: dto.clientName,
          phone: dto.clientPhone,
          email: dto.clientEmail,
        })
        .returning();

      this.logger.log(`Novo cliente criado via booking online: ${client.id}`);
    }

    return client;
  }

  /**
   * Gera slots disponíveis para um profissional usando lógica real de disponibilidade.
   * Respeita os 4 pilares:
   * 1. Bloqueios (professionalBlocks)
   * 2. "Estou no salão" (minAdvanceHours)
   * 3. Meus horários (professionalSchedules/professionalAvailabilities)
   * 4. Horário do salão (fallback)
   */
  private async generateSlotsForProfessional(
    salonId: string,
    professional: schema.User,
    service: typeof schema.services.$inferSelect | null,
    startDate: string,
    endDate: string,
  ): Promise<AvailableSlot[]> {
    const slots: AvailableSlot[] = [];
    const duration = service?.durationMinutes || 60;
    const serviceName = service?.name || 'Serviço';
    const serviceId = service?.id || 0;
    const price = service?.basePrice || '0';

    // Busca minAdvanceHours (pilar 2: "Estou no salão")
    const settings = await this.settingsService.getSettings(salonId);
    const minAdvanceHours = settings.minAdvanceHours || 0;

    // Gera datas no intervalo
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    const now = new Date();

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];

      // Usa AppointmentsService.getAvailableSlots que já implementa:
      // - Working hours do profissional (com fallback para horário do salão)
      // - Bloqueios
      // - Agendamentos existentes + buffers
      // - Breaks/intervalos
      const timeSlots = await this.appointmentsService.getAvailableSlots(
        professional.id,
        salonId,
        dateStr,
        serviceId || undefined,
        30, // intervalo de 30 minutos
      );

      for (const slot of timeSlots) {
        if (!slot.available) continue;

        // Pilar 2: Filtrar por minAdvanceHours
        const [slotH, slotM] = slot.time.split(':').map(Number);
        const slotDate = new Date(dateStr + 'T00:00:00');
        slotDate.setHours(slotH, slotM, 0, 0);

        const minBookingTime = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000);

        if (slotDate <= now) continue; // Slot no passado
        if (slotDate < minBookingTime) continue; // Dentro da janela de antecedência mínima

        const endTime = this.addMinutes(slot.time, duration);

        // Verifica holds ativos (mantém verificação existente)
        const hasHoldConflict = await this.holdsService.checkHoldConflict(
          salonId,
          professional.id,
          dateStr,
          slot.time,
          endTime,
        );

        if (!hasHoldConflict) {
          slots.push({
            date: dateStr,
            time: slot.time,
            endTime,
            professionalId: professional.id,
            professionalName: professional.name,
            serviceId,
            serviceName,
            duration,
            price,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  /**
   * Adiciona minutos a um horário
   */
  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
  Inject,
} from '@nestjs/common';
import { eq, and, or, gt, lt, ne, lte, gte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { CreateHoldDto, HoldResponse } from './dto';
import { OnlineBookingSettingsService } from './online-booking-settings.service';

@Injectable()
export class AppointmentHoldsService {
  private readonly logger = new Logger(AppointmentHoldsService.name);

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly settingsService: OnlineBookingSettingsService,
  ) {}

  /**
   * Cria um hold (reserva temporária) para um horário
   */
  async createHold(
    salonId: string,
    dto: CreateHoldDto,
    clientIp?: string,
  ): Promise<HoldResponse> {
    const { professionalId, serviceId, date, startTime, endTime, clientPhone, clientName, sessionId } = dto;

    // Busca configurações do salão
    const settings = await this.settingsService.getSettings(salonId);

    if (!settings.enabled) {
      throw new BadRequestException('Agendamento online não está habilitado para este salão');
    }

    // Verifica se o serviço existe e permite booking online
    const [service] = await this.db
      .select()
      .from(schema.services)
      .where(
        and(
          eq(schema.services.id, serviceId),
          eq(schema.services.salonId, salonId),
          eq(schema.services.active, true),
          eq(schema.services.allowOnlineBooking, true),
        ),
      )
      .limit(1);

    if (!service) {
      throw new NotFoundException('Serviço não encontrado ou não disponível para agendamento online');
    }

    // Verifica se o profissional existe
    const [professional] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.id, professionalId),
          eq(schema.users.salonId, salonId),
          eq(schema.users.active, true),
        ),
      )
      .limit(1);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    // Verifica bloqueios profissionais (pilar 1)
    const hasBlockConflict = await this.checkBlockConflict(
      salonId, professionalId, date, startTime, endTime,
    );
    if (hasBlockConflict) {
      throw new ConflictException('Profissional tem bloqueio neste horário');
    }

    // Verifica conflitos com holds ativos
    const conflictingHold = await this.checkHoldConflict(
      salonId,
      professionalId,
      date,
      startTime,
      endTime,
    );

    if (conflictingHold) {
      throw new ConflictException('Este horário já está reservado temporariamente');
    }

    // Verifica conflitos com agendamentos existentes
    const conflictingAppointment = await this.checkAppointmentConflict(
      salonId,
      professionalId,
      date,
      startTime,
      endTime,
    );

    if (conflictingAppointment) {
      throw new ConflictException('Este horário já possui um agendamento');
    }

    // Busca cliente existente pelo telefone
    const [existingClient] = await this.db
      .select()
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.salonId, salonId),
          eq(schema.clients.phone, clientPhone),
        ),
      )
      .limit(1);

    // Calcula expiração
    const expiresAt = new Date(Date.now() + settings.holdDurationMinutes * 60 * 1000);

    // Cria o hold
    const [hold] = await this.db
      .insert(schema.appointmentHolds)
      .values({
        salonId,
        professionalId,
        serviceId,
        date,
        startTime,
        endTime,
        clientPhone,
        clientName,
        clientId: existingClient?.id,
        status: 'ACTIVE',
        expiresAt,
        sessionId,
        clientIp,
      })
      .returning();

    this.logger.log(`Hold criado: ${hold.id} para ${date} ${startTime}-${endTime}`);

    return {
      id: hold.id,
      date: hold.date,
      startTime: hold.startTime,
      endTime: hold.endTime,
      professionalName: professional.name,
      serviceName: service.name,
      expiresAt: hold.expiresAt,
      expiresInSeconds: Math.ceil((hold.expiresAt.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Obtém um hold pelo ID
   */
  async getHold(salonId: string, holdId: string): Promise<schema.AppointmentHold | null> {
    const [hold] = await this.db
      .select()
      .from(schema.appointmentHolds)
      .where(
        and(
          eq(schema.appointmentHolds.id, holdId),
          eq(schema.appointmentHolds.salonId, salonId),
        ),
      )
      .limit(1);

    return hold || null;
  }

  /**
   * Obtém hold ativo pelo ID
   */
  async getActiveHold(salonId: string, holdId: string): Promise<schema.AppointmentHold> {
    const hold = await this.getHold(salonId, holdId);

    if (!hold) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (hold.status !== 'ACTIVE') {
      throw new BadRequestException('Esta reserva não está mais ativa');
    }

    if (hold.expiresAt < new Date()) {
      // Marca como expirado
      await this.expireHold(hold.id);
      throw new BadRequestException('Esta reserva expirou');
    }

    return hold;
  }

  /**
   * Converte um hold em agendamento
   */
  async convertToAppointment(
    salonId: string,
    holdId: string,
    appointmentId: string,
  ): Promise<void> {
    await this.db
      .update(schema.appointmentHolds)
      .set({
        status: 'CONVERTED',
        appointmentId,
        convertedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.appointmentHolds.id, holdId),
          eq(schema.appointmentHolds.salonId, salonId),
        ),
      );

    this.logger.log(`Hold ${holdId} convertido em agendamento ${appointmentId}`);
  }

  /**
   * Libera um hold manualmente
   */
  async releaseHold(salonId: string, holdId: string): Promise<void> {
    await this.db
      .update(schema.appointmentHolds)
      .set({
        status: 'RELEASED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.appointmentHolds.id, holdId),
          eq(schema.appointmentHolds.salonId, salonId),
          eq(schema.appointmentHolds.status, 'ACTIVE'),
        ),
      );

    this.logger.log(`Hold ${holdId} liberado`);
  }

  /**
   * Marca um hold como expirado
   */
  async expireHold(holdId: string): Promise<void> {
    await this.db
      .update(schema.appointmentHolds)
      .set({
        status: 'EXPIRED',
        updatedAt: new Date(),
      })
      .where(eq(schema.appointmentHolds.id, holdId));
  }

  /**
   * Verifica conflito com holds ativos
   */
  async checkHoldConflict(
    salonId: string,
    professionalId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeHoldId?: string,
  ): Promise<boolean> {
    const conditions = [
      eq(schema.appointmentHolds.salonId, salonId),
      eq(schema.appointmentHolds.professionalId, professionalId),
      eq(schema.appointmentHolds.date, date),
      eq(schema.appointmentHolds.status, 'ACTIVE'),
      gt(schema.appointmentHolds.expiresAt, new Date()),
    ];

    if (excludeHoldId) {
      conditions.push(ne(schema.appointmentHolds.id, excludeHoldId));
    }

    const holds = await this.db
      .select()
      .from(schema.appointmentHolds)
      .where(and(...conditions));

    // Verifica sobreposição de horários
    for (const hold of holds) {
      if (this.timesOverlap(startTime, endTime, hold.startTime, hold.endTime)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica conflito com agendamentos existentes
   */
  async checkAppointmentConflict(
    salonId: string,
    professionalId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const conditions = [
      eq(schema.appointments.salonId, salonId),
      eq(schema.appointments.professionalId, professionalId),
      eq(schema.appointments.date, date),
      or(
        eq(schema.appointments.status, 'SCHEDULED'),
        eq(schema.appointments.status, 'CONFIRMED'),
        eq(schema.appointments.status, 'PENDING_CONFIRMATION'),
      ),
    ];

    if (excludeAppointmentId) {
      conditions.push(ne(schema.appointments.id, excludeAppointmentId));
    }

    const appointments = await this.db
      .select()
      .from(schema.appointments)
      .where(and(...conditions));

    // Verifica sobreposição de horários
    for (const apt of appointments) {
      const aptStart = apt.startTime || apt.time;
      const aptEnd = apt.endTime || this.addMinutes(apt.time, apt.duration);
      if (this.timesOverlap(startTime, endTime, aptStart, aptEnd)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica conflito com bloqueios profissionais
   */
  async checkBlockConflict(
    salonId: string,
    professionalId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const blocks = await this.db
      .select()
      .from(schema.professionalBlocks)
      .where(and(
        eq(schema.professionalBlocks.salonId, salonId),
        eq(schema.professionalBlocks.professionalId, professionalId),
        eq(schema.professionalBlocks.status, 'APPROVED'),
        lte(schema.professionalBlocks.startDate, date),
        gte(schema.professionalBlocks.endDate, date),
      ));

    for (const block of blocks) {
      if (block.allDay) return true;
      if (block.startTime && block.endTime) {
        if (this.timesOverlap(startTime, endTime, block.startTime, block.endTime)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Limpa holds expirados (job de limpeza)
   */
  async cleanupExpiredHolds(): Promise<number> {
    await this.db
      .update(schema.appointmentHolds)
      .set({
        status: 'EXPIRED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.appointmentHolds.status, 'ACTIVE'),
          lt(schema.appointmentHolds.expiresAt, new Date()),
        ),
      );

    this.logger.log(`Holds expirados atualizados`);
    return 0;
  }

  /**
   * Obtém holds ativos por sessão
   */
  async getHoldsBySession(
    salonId: string,
    sessionId: string,
  ): Promise<schema.AppointmentHold[]> {
    return this.db
      .select()
      .from(schema.appointmentHolds)
      .where(
        and(
          eq(schema.appointmentHolds.salonId, salonId),
          eq(schema.appointmentHolds.sessionId, sessionId),
          eq(schema.appointmentHolds.status, 'ACTIVE'),
          gt(schema.appointmentHolds.expiresAt, new Date()),
        ),
      );
  }

  /**
   * Estende o tempo de um hold
   */
  async extendHold(salonId: string, holdId: string, extraMinutes: number = 5): Promise<HoldResponse> {
    const hold = await this.getActiveHold(salonId, holdId);
    const settings = await this.settingsService.getSettings(salonId);

    // Não permite estender além do máximo
    const maxExtension = settings.holdDurationMinutes * 1.5;
    const currentDuration = (hold.expiresAt.getTime() - new Date(hold.createdAt).getTime()) / 60000;

    if (currentDuration + extraMinutes > maxExtension) {
      throw new BadRequestException('Tempo máximo de reserva atingido');
    }

    const newExpiresAt = new Date(hold.expiresAt.getTime() + extraMinutes * 60 * 1000);

    await this.db
      .update(schema.appointmentHolds)
      .set({
        expiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.appointmentHolds.id, holdId));

    // Busca dados adicionais
    const [professional] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, hold.professionalId))
      .limit(1);

    const [service] = await this.db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, hold.serviceId))
      .limit(1);

    return {
      id: hold.id,
      date: hold.date,
      startTime: hold.startTime,
      endTime: hold.endTime,
      professionalName: professional?.name || 'Profissional',
      serviceName: service?.name || 'Serviço',
      expiresAt: newExpiresAt,
      expiresInSeconds: Math.ceil((newExpiresAt.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Verifica se dois períodos de tempo se sobrepõem
   */
  private timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    return s1 < e2 && s2 < e1;
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

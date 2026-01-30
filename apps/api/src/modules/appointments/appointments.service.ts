import { Injectable, Inject, BadRequestException, NotFoundException, Logger, forwardRef } from '@nestjs/common';
import { eq, and, desc, gte, lte, sql, or, ne } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  appointments,
  Appointment,
  NewAppointment,
  clients,
  users,
  services,
  commands,
  commandItems,
  professionalAvailabilities,
  professionalBlocks,
  clientNoShows,
  ProfessionalAvailability,
  ProfessionalBlock,
  NewProfessionalBlock,
} from '../../database';
import { UsersService } from '../users';
import { ScheduledMessagesService } from '../notifications';
import { TriageService } from '../triage/triage.service';
import { SchedulesService } from '../schedules/schedules.service';

// ==================== INTERFACES ====================

export interface AppointmentWithDetails extends Appointment {
  clientName: string | null;
  professionalName: string;
  serviceName: string;
  serviceDetails?: {
    id: number;
    name: string;
    duration: number;
    price: string;
    bufferBefore: number;
    bufferAfter: number;
  };
}

export interface DaySchedule {
  date: string;
  appointments: AppointmentWithDetails[];
  professionals: { id: string; name: string; color?: string }[];
  blocks: ProfessionalBlock[];
}

export interface WeekSchedule {
  startDate: string;
  endDate: string;
  days: DaySchedule[];
}

export interface MonthSchedule {
  year: number;
  month: number;
  days: {
    date: string;
    appointmentCount: number;
    hasBlocks: boolean;
    occupancyLevel: 'low' | 'medium' | 'high';
    appointments: AppointmentWithDetails[];
  }[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
  conflicts?: Appointment[];
  suggestedTimes?: string[];
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isActive: boolean;
}

export interface BlockWithProfessional extends ProfessionalBlock {
  professionalName: string;
}

// ==================== SERVICE ====================

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private usersService: UsersService,
    private scheduledMessagesService: ScheduledMessagesService,
    @Inject(forwardRef(() => TriageService))
    private triageService: TriageService,
    @Inject(forwardRef(() => SchedulesService))
    private schedulesService: SchedulesService,
  ) {}

  // ==================== APPOINTMENTS CRUD ====================

  /**
   * Lista todos os agendamentos do salão com filtros
   */
  async findAll(
    salonId: string,
    filters?: {
      date?: string;
      professionalId?: string;
      status?: string;
      clientId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<AppointmentWithDetails[]> {
    const conditions = [eq(appointments.salonId, salonId)];

    if (filters?.date) {
      conditions.push(eq(appointments.date, filters.date));
    }
    if (filters?.professionalId) {
      conditions.push(eq(appointments.professionalId, filters.professionalId));
    }
    if (filters?.status) {
      conditions.push(eq(appointments.status, filters.status as any));
    }
    if (filters?.clientId) {
      conditions.push(eq(appointments.clientId, filters.clientId));
    }
    if (filters?.startDate) {
      conditions.push(gte(appointments.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(appointments.date, filters.endDate));
    }

    const results = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(appointments.date, appointments.time);

    return this.enrichAppointments(results);
  }

  /**
   * Busca agendamento por ID
   */
  async findById(id: string, salonId: string): Promise<AppointmentWithDetails | null> {
    const result = await this.db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .limit(1);

    if (!result[0]) return null;
    const enriched = await this.enrichAppointments([result[0]]);
    return enriched[0];
  }

  /**
   * Busca agendamentos por data (dia específico)
   */
  async findByDay(salonId: string, date: string): Promise<DaySchedule> {
    const dayAppointments = await this.findAll(salonId, { date });

    // Get all active professionals
    const professionals = await this.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(and(eq(users.salonId, salonId), eq(users.role, 'STYLIST'), eq(users.active, true)));

    // Get blocks for this day
    const blocks = await this.getBlocksForDate(salonId, date);

    return {
      date,
      appointments: dayAppointments,
      professionals,
      blocks,
    };
  }

  /**
   * Busca agendamentos da semana
   */
  async findByWeek(salonId: string, startDate: string): Promise<WeekSchedule> {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    const weekAppointments = await this.findAll(salonId, { startDate, endDate });

    // Get professionals once
    const professionals = await this.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(and(eq(users.salonId, salonId), eq(users.role, 'STYLIST'), eq(users.active, true)));

    // Get all blocks for the week
    const allBlocks = await this.getBlocksForDateRange(salonId, startDate, endDate);

    // Group by day
    const days: DaySchedule[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);
      const dateStr = dayDate.toISOString().split('T')[0];

      const dayApts = weekAppointments.filter(a => a.date === dateStr);
      const dayBlocks = allBlocks.filter(b =>
        b.startDate <= dateStr && b.endDate >= dateStr
      );

      days.push({
        date: dateStr,
        appointments: dayApts,
        professionals,
        blocks: dayBlocks,
      });
    }

    return { startDate, endDate, days };
  }

  /**
   * Busca agendamentos do mês
   */
  async findByMonth(salonId: string, year: number, month: number): Promise<MonthSchedule> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const monthAppointments = await this.findAll(salonId, { startDate, endDate });
    const allBlocks = await this.getBlocksForDateRange(salonId, startDate, endDate);

    // Get max slots per day (based on professionals and working hours)
    const maxSlotsPerDay = 50; // Simplified - would calculate based on working hours

    // Group by day
    const days: { date: string; appointmentCount: number; hasBlocks: boolean; occupancyLevel: 'low' | 'medium' | 'high'; appointments: AppointmentWithDetails[] }[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayApts = monthAppointments.filter(a => a.date === dateStr);
      const hasBlocks = allBlocks.some(b => b.startDate <= dateStr && b.endDate >= dateStr);

      // Calculate occupancy level
      const occupancy = dayApts.length / maxSlotsPerDay;
      let occupancyLevel: 'low' | 'medium' | 'high' = 'low';
      if (occupancy > 0.7) occupancyLevel = 'high';
      else if (occupancy > 0.4) occupancyLevel = 'medium';

      days.push({
        date: dateStr,
        appointmentCount: dayApts.length,
        hasBlocks,
        occupancyLevel,
        appointments: dayApts,
      });
    }

    return { year, month, days };
  }

  /**
   * Cria um novo agendamento
   */
  async create(salonId: string, data: Partial<NewAppointment>, createdById: string): Promise<Appointment> {
    // Validate required fields
    if (!data.professionalId) {
      throw new BadRequestException('Profissional é obrigatório');
    }
    if (!data.date) {
      throw new BadRequestException('Data é obrigatória');
    }
    if (!data.time) {
      throw new BadRequestException('Horário é obrigatório');
    }
    if (!data.duration) {
      throw new BadRequestException('Duração é obrigatória');
    }
    if (!data.service) {
      throw new BadRequestException('Serviço é obrigatório');
    }

    // Validate client is not blocked
    if (data.clientId) {
      const isBlocked = await this.isClientBlocked(salonId, data.clientId);
      if (isBlocked) {
        throw new BadRequestException('Cliente está bloqueado devido a histórico de não comparecimentos');
      }
    }

    // Validate availability using SchedulesService (provides detailed error messages)
    const availability = await this.schedulesService.checkAvailability(
      salonId,
      data.professionalId,
      data.date,
      data.time,
      data.duration,
    );

    if (!availability.available) {
      const error: any = new BadRequestException(availability.message);
      error.response = {
        statusCode: 400,
        error: 'APPOINTMENT_NOT_AVAILABLE',
        reason: availability.reason,
        message: availability.message,
        details: availability.details,
        suggestedSlots: availability.suggestedSlots,
      };
      throw error;
    }

    // Validate professional
    const professional = await this.usersService.findById(data.professionalId);
    if (!professional) {
      throw new BadRequestException('Profissional não encontrado');
    }
    if (!professional.active) {
      throw new BadRequestException('Profissional está inativo');
    }

    // Check working hours
    const dayOfWeek = new Date(data.date).getDay();
    const workingHours = await this.getWorkingHours(data.professionalId, salonId);
    const daySchedule = workingHours.find(w => w.dayOfWeek === dayOfWeek && w.isActive);

    if (!daySchedule) {
      throw new BadRequestException('Profissional não trabalha neste dia');
    }

    // Check if within working hours
    if (data.time < daySchedule.startTime || data.time >= daySchedule.endTime) {
      throw new BadRequestException(`Horário fora do expediente (${daySchedule.startTime} - ${daySchedule.endTime})`);
    }

    // Check for breaks
    if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
      const endMinutes = this.timeToMinutes(data.time) + data.duration;
      const endTime = this.minutesToTime(endMinutes);

      if (
        (data.time >= daySchedule.breakStartTime && data.time < daySchedule.breakEndTime) ||
        (endTime > daySchedule.breakStartTime && endTime <= daySchedule.breakEndTime)
      ) {
        throw new BadRequestException('Horário conflita com intervalo de almoço');
      }
    }

    // Check for blocks
    const hasBlock = await this.hasBlockOnDate(data.professionalId, salonId, data.date, data.time, data.duration);
    if (hasBlock) {
      throw new BadRequestException('Profissional tem bloqueio neste horário');
    }

    // Check for conflicts with buffers
    const bufferBefore = data.bufferBefore || 0;
    const bufferAfter = data.bufferAfter || 0;
    const totalDuration = bufferBefore + data.duration + bufferAfter;

    const adjustedTime = this.minutesToTime(this.timeToMinutes(data.time) - bufferBefore);
    const hasConflict = await this.checkConflict(
      data.date,
      adjustedTime,
      totalDuration,
      data.professionalId,
    );

    if (hasConflict) {
      throw new BadRequestException('Profissional já tem agendamento neste horário');
    }

    // Calculate end time
    const endTime = this.calculateEndTime(data.time, data.duration);

    // Get client info
    let clientName = data.clientName;
    let clientPhone = data.clientPhone;
    let clientEmail = data.clientEmail;
    let noShowCount = 0;

    if (data.clientId) {
      const client = await this.db
        .select({ name: clients.name, phone: clients.phone, email: clients.email })
        .from(clients)
        .where(eq(clients.id, data.clientId))
        .limit(1);

      if (client[0]) {
        clientName = clientName || client[0].name;
        clientPhone = clientPhone || client[0].phone || undefined;
        clientEmail = clientEmail || client[0].email || undefined;
      }

      // Get no-show count
      const noShows = await this.db
        .select()
        .from(clientNoShows)
        .where(and(
          eq(clientNoShows.salonId, salonId),
          eq(clientNoShows.clientId, data.clientId),
        ));
      noShowCount = noShows.length;
    }

    const result = await this.db
      .insert(appointments)
      .values({
        salonId,
        clientId: data.clientId || null,
        clientName: clientName || null,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        professionalId: data.professionalId,
        serviceId: data.serviceId || null,
        service: data.service,
        date: data.date,
        time: data.time,
        startTime: data.time,
        endTime,
        duration: data.duration,
        bufferBefore: bufferBefore,
        bufferAfter: bufferAfter,
        locationType: data.locationType || 'SALON',
        address: data.address || null,
        status: 'SCHEDULED',
        confirmationStatus: 'PENDING',
        priority: data.priority || 'NORMAL',
        color: data.color || null,
        price: data.price || '0',
        notes: data.notes || null,
        internalNotes: data.internalNotes || null,
        noShowCount,
        source: data.source || 'MANUAL',
        createdById,
      })
      .returning();

    const appointment = result[0];

    // Verificar se serviço requer triagem e criar resposta
    let triageLink: string | null = null;

    try {
      if (data.serviceId) {
        const form = await this.triageService.getFormForService(salonId, data.serviceId);

        if (form) {
          const triageResponse = await this.triageService.createTriageResponse(
            salonId,
            appointment.id,
            form.id,
            data.clientId || undefined,
          );

          triageLink = triageResponse.publicLink;
          this.logger.log(`Triagem criada para agendamento ${appointment.id}, link: ${triageLink}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Erro ao criar triagem para agendamento ${appointment.id}: ${error}`);
    }

    // Agendar notificações WhatsApp automáticas
    try {
      await this.scheduledMessagesService.scheduleAllAppointmentNotifications(
        {
          ...appointment,
          salonId,
          professionalName: professional.name,
        },
        triageLink || undefined,
      );
    } catch (error) {
      // Log error but don't fail the appointment creation
      this.logger.error('Erro ao agendar notificações WhatsApp:', error);
    }

    return appointment;
  }

  /**
   * Atualiza um agendamento
   */
  async update(id: string, salonId: string, data: Partial<NewAppointment>, updatedById: string): Promise<Appointment | null> {
    const existing = await this.findById(id, salonId);
    if (!existing) return null;

    // If changing time/professional, validate again
    if (data.professionalId || data.date || data.time || data.duration) {
      const professionalId = data.professionalId || existing.professionalId;
      const date = data.date || existing.date;
      const time = data.time || existing.time;
      const duration = data.duration || existing.duration;

      // Check conflict excluding current appointment
      const hasConflict = await this.checkConflict(date, time, duration, professionalId, id);
      if (hasConflict) {
        throw new BadRequestException('Profissional já tem agendamento neste horário');
      }
    }

    // Recalculate end time if needed
    const updateData: any = { ...data, updatedById, updatedAt: new Date() };
    if (data.time || data.duration) {
      const t = data.time || existing.time;
      const d = data.duration || existing.duration;
      updateData.startTime = t;
      updateData.endTime = this.calculateEndTime(t, d);
    }

    const result = await this.db
      .update(appointments)
      .set(updateData)
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Cancela um agendamento
   */
  async cancel(id: string, salonId: string, cancelledById: string, reason?: string): Promise<Appointment | null> {
    const existing = await this.findById(id, salonId);

    const result = await this.db
      .update(appointments)
      .set({
        status: 'CANCELLED',
        cancelledById,
        cancellationReason: reason || null,
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    const appointment = result[0];

    if (appointment) {
      // Cancelar notificações pendentes e agendar notificação de cancelamento
      try {
        await this.scheduledMessagesService.cancelAppointmentNotifications(id);
        if (existing?.clientPhone) {
          await this.scheduledMessagesService.scheduleAppointmentCancellation({
            ...appointment,
            salonId,
            clientPhone: existing.clientPhone,
            clientName: existing.clientName,
          });
        }
      } catch (error) {
        console.error('Erro ao processar notificações de cancelamento:', error);
      }
    }

    return appointment || null;
  }

  // ==================== STATUS TRANSITIONS ====================

  /**
   * Confirma um agendamento
   */
  async confirm(id: string, salonId: string, via?: string): Promise<Appointment | null> {
    const result = await this.db
      .update(appointments)
      .set({
        status: 'CONFIRMED',
        confirmationStatus: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedVia: (via || 'MANUAL') as any,
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Inicia um atendimento
   */
  async start(id: string, salonId: string): Promise<Appointment | null> {
    const result = await this.db
      .update(appointments)
      .set({
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Finaliza um atendimento
   */
  async complete(id: string, salonId: string): Promise<Appointment | null> {
    const result = await this.db
      .update(appointments)
      .set({
        status: 'COMPLETED',
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Marca como não compareceu e registra no histórico
   */
  async noShow(id: string, salonId: string): Promise<Appointment | null> {
    const appointment = await this.findById(id, salonId);
    if (!appointment) return null;

    // Update appointment
    const result = await this.db
      .update(appointments)
      .set({
        status: 'NO_SHOW',
        noShowCount: (appointment.noShowCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    // Record no-show in history if client exists
    if (appointment.clientId) {
      await this.db.insert(clientNoShows).values({
        salonId,
        clientId: appointment.clientId,
        appointmentId: id,
        date: appointment.date,
        blocked: false,
      });

      // Check if should block client (3+ no-shows)
      const noShowCount = await this.db
        .select()
        .from(clientNoShows)
        .where(and(
          eq(clientNoShows.salonId, salonId),
          eq(clientNoShows.clientId, appointment.clientId),
        ));

      if (noShowCount.length >= 3) {
        const blockUntil = new Date();
        blockUntil.setDate(blockUntil.getDate() + 30);

        await this.db
          .update(clientNoShows)
          .set({
            blocked: true,
            blockedUntil: blockUntil.toISOString().split('T')[0],
          })
          .where(and(
            eq(clientNoShows.salonId, salonId),
            eq(clientNoShows.clientId, appointment.clientId),
          ));
      }
    }

    return result[0] || null;
  }

  /**
   * Reagenda um agendamento
   */
  async reschedule(
    id: string,
    salonId: string,
    newDate: string,
    newTime: string,
    newProfessionalId?: string,
    updatedById?: string,
  ): Promise<Appointment | null> {
    const existing = await this.findById(id, salonId);
    if (!existing) return null;

    const oldDate = existing.date;
    const oldTime = existing.time;

    const professionalId = newProfessionalId || existing.professionalId;

    // Check availability
    const hasConflict = await this.checkConflict(newDate, newTime, existing.duration, professionalId, id);
    if (hasConflict) {
      throw new BadRequestException('Horário não disponível');
    }

    const endTime = this.calculateEndTime(newTime, existing.duration);

    const result = await this.db
      .update(appointments)
      .set({
        date: newDate,
        time: newTime,
        startTime: newTime,
        endTime,
        professionalId,
        status: 'SCHEDULED',
        confirmationStatus: 'PENDING',
        confirmedAt: null,
        confirmedVia: null,
        updatedById: updatedById || null,
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)))
      .returning();

    const appointment = result[0];

    if (appointment && existing.clientPhone) {
      // Cancelar notificações antigas e reagendar novas
      try {
        await this.scheduledMessagesService.cancelAppointmentNotifications(id);
        await this.scheduledMessagesService.scheduleAppointmentRescheduled(
          { ...appointment, salonId, clientPhone: existing.clientPhone, clientName: existing.clientName },
          oldDate,
          oldTime,
        );
        // Reagendar lembretes para o novo horário
        await this.scheduledMessagesService.scheduleReminder24h({
          ...appointment,
          salonId,
          clientPhone: existing.clientPhone,
          clientName: existing.clientName,
        });
        await this.scheduledMessagesService.scheduleReminder1h30({
          ...appointment,
          salonId,
          clientPhone: existing.clientPhone,
          clientName: existing.clientName,
        });
      } catch (error) {
        console.error('Erro ao processar notificações de reagendamento:', error);
      }
    }

    return appointment || null;
  }

  // ==================== AVAILABILITY ====================

  /**
   * Retorna horários disponíveis para um profissional em uma data
   */
  async getAvailableSlots(
    professionalId: string,
    salonId: string,
    date: string,
    serviceId?: number,
    interval: number = 30,
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];

    // Get service duration
    let duration = 60;
    if (serviceId) {
      const service = await this.db
        .select()
        .from(services)
        .where(eq(services.id, serviceId))
        .limit(1);
      if (service[0]) {
        duration = service[0].durationMinutes;
      }
    }

    // Get working hours for this day
    const dayOfWeek = new Date(date).getDay();
    const workingHours = await this.getWorkingHours(professionalId, salonId);
    const daySchedule = workingHours.find(w => w.dayOfWeek === dayOfWeek && w.isActive);

    if (!daySchedule) {
      return []; // Professional doesn't work this day
    }

    // Get existing appointments
    const existingApts = await this.db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.salonId, salonId),
        eq(appointments.professionalId, professionalId),
        eq(appointments.date, date),
        ne(appointments.status, 'CANCELLED'),
        ne(appointments.status, 'NO_SHOW'),
      ));

    // Get blocks
    const blocks = await this.getBlocksForDate(salonId, date, professionalId);

    // Generate slots
    let currentTime = this.timeToMinutes(daySchedule.startTime);
    const endTime = this.timeToMinutes(daySchedule.endTime);
    const breakStart = daySchedule.breakStartTime ? this.timeToMinutes(daySchedule.breakStartTime) : null;
    const breakEnd = daySchedule.breakEndTime ? this.timeToMinutes(daySchedule.breakEndTime) : null;

    while (currentTime + duration <= endTime) {
      const timeStr = this.minutesToTime(currentTime);
      const slotEnd = currentTime + duration;

      // Check if in break
      let available = true;
      let reason: string | undefined;

      if (breakStart !== null && breakEnd !== null) {
        if (currentTime >= breakStart && currentTime < breakEnd) {
          available = false;
          reason = 'Intervalo de almoço';
        } else if (slotEnd > breakStart && slotEnd <= breakEnd) {
          available = false;
          reason = 'Conflita com intervalo';
        }
      }

      // Check blocks
      if (available) {
        for (const block of blocks) {
          if (block.allDay) {
            available = false;
            reason = block.title || 'Bloqueado';
            break;
          }
          if (block.startTime && block.endTime) {
            const blockStart = this.timeToMinutes(block.startTime);
            const blockEnd = this.timeToMinutes(block.endTime);
            if (currentTime < blockEnd && slotEnd > blockStart) {
              available = false;
              reason = block.title || 'Bloqueado';
              break;
            }
          }
        }
      }

      // Check existing appointments
      if (available) {
        for (const apt of existingApts) {
          const aptStart = this.timeToMinutes(apt.time);
          const aptEnd = aptStart + apt.duration + (apt.bufferAfter || 0);
          const aptStartWithBuffer = aptStart - (apt.bufferBefore || 0);

          if (currentTime < aptEnd && slotEnd > aptStartWithBuffer) {
            available = false;
            reason = 'Horário ocupado';
            break;
          }
        }
      }

      slots.push({ time: timeStr, available, reason });
      currentTime += interval;
    }

    return slots;
  }

  /**
   * Verifica disponibilidade completa
   */
  async checkAvailability(
    salonId: string,
    professionalId: string,
    date: string,
    startTime: string,
    duration: number,
  ): Promise<AvailabilityCheck> {
    // Check working hours
    const dayOfWeek = new Date(date).getDay();
    const workingHours = await this.getWorkingHours(professionalId, salonId);
    const daySchedule = workingHours.find(w => w.dayOfWeek === dayOfWeek && w.isActive);

    if (!daySchedule) {
      return { available: false, reason: 'Profissional não trabalha neste dia' };
    }

    if (startTime < daySchedule.startTime) {
      return { available: false, reason: 'Antes do horário de expediente' };
    }

    const endTime = this.calculateEndTime(startTime, duration);
    if (endTime > daySchedule.endTime) {
      return { available: false, reason: 'Após o horário de expediente' };
    }

    // Check blocks
    const hasBlock = await this.hasBlockOnDate(professionalId, salonId, date, startTime, duration);
    if (hasBlock) {
      return { available: false, reason: 'Profissional tem bloqueio neste horário' };
    }

    // Check conflicts
    const hasConflict = await this.checkConflict(date, startTime, duration, professionalId);
    if (hasConflict) {
      const conflicts = await this.getConflictingAppointments(date, startTime, duration, professionalId);
      const suggestedTimes = await this.findNextAvailableSlots(professionalId, salonId, date, duration, 3);
      return {
        available: false,
        reason: 'Horário já está ocupado',
        conflicts,
        suggestedTimes,
      };
    }

    return { available: true };
  }

  /**
   * Encontra próximo horário disponível
   */
  async findNextAvailable(
    serviceId: number,
    salonId: string,
    professionalId?: string,
  ): Promise<{ date: string; time: string; professionalId: string; professionalName: string } | null> {
    const service = await this.db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service[0]) return null;

    // Duration is fetched internally by getAvailableSlots using serviceId

    // Get professionals
    let professionals: { id: string; name: string }[];
    if (professionalId) {
      const prof = await this.db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, professionalId))
        .limit(1);
      professionals = prof;
    } else {
      professionals = await this.db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(and(
          eq(users.salonId, salonId),
          eq(users.role, 'STYLIST'),
          eq(users.active, true),
        ));
    }

    // Search next 14 days
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      for (const prof of professionals) {
        const slots = await this.getAvailableSlots(prof.id, salonId, dateStr, serviceId);
        const availableSlot = slots.find(s => s.available);

        if (availableSlot) {
          return {
            date: dateStr,
            time: availableSlot.time,
            professionalId: prof.id,
            professionalName: prof.name,
          };
        }
      }
    }

    return null;
  }

  // ==================== BLOCKS/FOLGAS ====================

  /**
   * Lista bloqueios
   */
  async getBlocks(
    salonId: string,
    filters?: { professionalId?: string; status?: string; startDate?: string; endDate?: string },
  ): Promise<BlockWithProfessional[]> {
    const conditions = [eq(professionalBlocks.salonId, salonId)];

    if (filters?.professionalId) {
      conditions.push(eq(professionalBlocks.professionalId, filters.professionalId));
    }
    if (filters?.status) {
      conditions.push(eq(professionalBlocks.status, filters.status as any));
    }
    if (filters?.startDate) {
      conditions.push(gte(professionalBlocks.startDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(professionalBlocks.endDate, filters.endDate));
    }

    const blocks = await this.db
      .select()
      .from(professionalBlocks)
      .where(and(...conditions))
      .orderBy(desc(professionalBlocks.startDate));

    // Enrich with professional name
    const enriched: BlockWithProfessional[] = [];
    for (const block of blocks) {
      const prof = await this.db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, block.professionalId))
        .limit(1);

      enriched.push({
        ...block,
        professionalName: prof[0]?.name || 'Profissional',
      });
    }

    return enriched;
  }

  /**
   * Busca bloqueio por ID
   */
  async getBlockById(id: string, salonId: string): Promise<ProfessionalBlock | null> {
    const result = await this.db
      .select()
      .from(professionalBlocks)
      .where(and(eq(professionalBlocks.id, id), eq(professionalBlocks.salonId, salonId)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria bloqueio
   */
  async createBlock(salonId: string, data: Partial<NewProfessionalBlock>, createdById: string): Promise<ProfessionalBlock> {
    // Check if there are appointments in the block period
    if (data.professionalId && data.startDate && data.endDate) {
      const conflictingApts = await this.db
        .select()
        .from(appointments)
        .where(and(
          eq(appointments.salonId, salonId),
          eq(appointments.professionalId, data.professionalId),
          gte(appointments.date, data.startDate),
          lte(appointments.date, data.endDate),
          ne(appointments.status, 'CANCELLED'),
          ne(appointments.status, 'NO_SHOW'),
        ));

      if (conflictingApts.length > 0) {
        throw new BadRequestException(`Existem ${conflictingApts.length} agendamento(s) neste período`);
      }
    }

    const result = await this.db
      .insert(professionalBlocks)
      .values({
        salonId,
        professionalId: data.professionalId!,
        type: data.type || 'DAY_OFF',
        title: data.title || 'Folga',
        description: data.description || null,
        startDate: data.startDate!,
        endDate: data.endDate!,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        allDay: data.allDay ?? true,
        recurring: data.recurring ?? false,
        recurringPattern: data.recurringPattern || null,
        recurringDays: data.recurringDays || null,
        recurringEndDate: data.recurringEndDate || null,
        status: data.requiresApproval ? 'PENDING' : 'APPROVED',
        requiresApproval: data.requiresApproval ?? false,
        createdById,
      })
      .returning();

    return result[0];
  }

  /**
   * Atualiza bloqueio
   */
  async updateBlock(id: string, salonId: string, data: Partial<NewProfessionalBlock>): Promise<ProfessionalBlock | null> {
    const result = await this.db
      .update(professionalBlocks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(professionalBlocks.id, id), eq(professionalBlocks.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Remove bloqueio
   */
  async deleteBlock(id: string, salonId: string): Promise<boolean> {
    const result = await this.db
      .delete(professionalBlocks)
      .where(and(eq(professionalBlocks.id, id), eq(professionalBlocks.salonId, salonId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Aprova bloqueio
   */
  async approveBlock(id: string, salonId: string, approvedById: string): Promise<ProfessionalBlock | null> {
    const result = await this.db
      .update(professionalBlocks)
      .set({
        status: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(professionalBlocks.id, id), eq(professionalBlocks.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Rejeita bloqueio
   */
  async rejectBlock(id: string, salonId: string, reason?: string): Promise<ProfessionalBlock | null> {
    const result = await this.db
      .update(professionalBlocks)
      .set({
        status: 'REJECTED',
        rejectionReason: reason || null,
        updatedAt: new Date(),
      })
      .where(and(eq(professionalBlocks.id, id), eq(professionalBlocks.salonId, salonId)))
      .returning();

    return result[0] || null;
  }

  // ==================== WORKING HOURS ====================

  /**
   * Retorna horários de trabalho de um profissional
   */
  async getWorkingHours(professionalId: string, salonId: string): Promise<WorkingHours[]> {
    const availability = await this.db
      .select()
      .from(professionalAvailabilities)
      .where(and(
        eq(professionalAvailabilities.salonId, salonId),
        eq(professionalAvailabilities.professionalId, professionalId),
      ))
      .orderBy(professionalAvailabilities.dayOfWeek);

    // If no custom hours, return default (Mon-Sat 9-18)
    if (availability.length === 0) {
      return [1, 2, 3, 4, 5, 6].map(day => ({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: day !== 0, // Sunday off
      }));
    }

    return availability.map(a => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      breakStartTime: a.breakStartTime,
      breakEndTime: a.breakEndTime,
      isActive: a.isActive,
    }));
  }

  /**
   * Define horários de trabalho
   */
  async setWorkingHours(
    professionalId: string,
    salonId: string,
    hours: WorkingHours[],
  ): Promise<ProfessionalAvailability[]> {
    // Delete existing hours
    await this.db
      .delete(professionalAvailabilities)
      .where(and(
        eq(professionalAvailabilities.salonId, salonId),
        eq(professionalAvailabilities.professionalId, professionalId),
      ));

    // Insert new hours
    const results: ProfessionalAvailability[] = [];
    for (const h of hours) {
      const result = await this.db
        .insert(professionalAvailabilities)
        .values({
          salonId,
          professionalId,
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
          breakStartTime: h.breakStartTime || null,
          breakEndTime: h.breakEndTime || null,
          isActive: h.isActive,
        })
        .returning();
      results.push(result[0]);
    }

    return results;
  }

  /**
   * Atualiza horário de trabalho específico
   */
  async updateWorkingHour(
    id: string,
    salonId: string,
    data: Partial<WorkingHours>,
  ): Promise<ProfessionalAvailability | null> {
    const result = await this.db
      .update(professionalAvailabilities)
      .set({
        startTime: data.startTime,
        endTime: data.endTime,
        breakStartTime: data.breakStartTime,
        breakEndTime: data.breakEndTime,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(and(
        eq(professionalAvailabilities.id, id),
        eq(professionalAvailabilities.salonId, salonId),
      ))
      .returning();

    return result[0] || null;
  }

  // ==================== CONVERT TO COMMAND ====================

  /**
   * Converte agendamento em comanda
   */
  async convertToCommand(id: string, salonId: string, userId: string): Promise<{ appointmentId: string; commandId: string }> {
    const appointment = await this.findById(id, salonId);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.commandId) {
      throw new BadRequestException('Agendamento já possui uma comanda');
    }

    // Create command with appointmentId link and IN_SERVICE status
    const cardNumber = await this.generateCardNumber(salonId);
    const [newCommand] = await this.db
      .insert(commands)
      .values({
        salonId,
        cardNumber,
        clientId: appointment.clientId,
        appointmentId: appointment.id, // P0: Link to source appointment
        status: 'IN_SERVICE', // P0: Start as IN_SERVICE since it already has a service item
        openedById: userId,
        openedAt: new Date(),
        totalGross: '0',
        totalDiscounts: '0',
        totalNet: '0',
      })
      .returning();

    // Add service as command item with referenceId from appointment.serviceId
    const price = parseFloat(appointment.price || '0');
    await this.db.insert(commandItems).values({
      commandId: newCommand.id,
      type: 'SERVICE',
      referenceId: appointment.serviceId ? String(appointment.serviceId) : null, // P0: Link to service
      description: appointment.service,
      quantity: '1',
      unitPrice: price.toFixed(2),
      discount: '0',
      totalPrice: price.toFixed(2),
      performerId: appointment.professionalId,
      addedById: userId,
    });

    // Update command totals
    await this.db
      .update(commands)
      .set({
        totalGross: price.toFixed(2),
        totalNet: price.toFixed(2),
      })
      .where(eq(commands.id, newCommand.id));

    // Link appointment to command and mark as in progress
    await this.db
      .update(appointments)
      .set({
        commandId: newCommand.id,
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    return { appointmentId: id, commandId: newCommand.id };
  }

  // ==================== SEARCH/QUERIES ====================

  /**
   * Lista agendamentos por profissional
   */
  async findByProfessional(professionalId: string, salonId: string, date?: string): Promise<AppointmentWithDetails[]> {
    const filters: any = { professionalId };
    if (date) filters.date = date;
    return this.findAll(salonId, filters);
  }

  /**
   * Lista agendamentos por cliente
   */
  async findByClient(clientId: string, salonId: string): Promise<AppointmentWithDetails[]> {
    return this.findAll(salonId, { clientId });
  }

  // ==================== KPIs ====================

  /**
   * Calcula KPIs do negócio
   */
  async calculateKPIs(salonId: string, startDate?: string, endDate?: string): Promise<{
    ticketMedio: number;
    taxaRetorno: number;
    totalFaturamento: number;
    totalAgendamentos: number;
    totalClientes: number;
    clientesRecorrentes: number;
    taxaNoShow: number;
    taxaConfirmacao: number;
    top3Servicos: { service: string; count: number; revenue: number }[];
  }> {
    const conditions = [eq(appointments.salonId, salonId)];
    if (startDate) conditions.push(gte(appointments.date, startDate));
    if (endDate) conditions.push(lte(appointments.date, endDate));

    const allAppointments = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions));

    const completedApts = allAppointments.filter(a => a.status === 'COMPLETED');
    const noShowApts = allAppointments.filter(a => a.status === 'NO_SHOW');
    const confirmedApts = allAppointments.filter(a => a.confirmationStatus === 'CONFIRMED');

    const totalFaturamento = completedApts.reduce((sum, apt) => sum + parseFloat(apt.price || '0'), 0);
    const uniqueClients = new Set(completedApts.filter(a => a.clientId).map(apt => apt.clientId));
    const totalClientes = uniqueClients.size;
    const ticketMedio = totalClientes > 0 ? totalFaturamento / completedApts.length : 0;

    const clientAppointmentCount: { [key: string]: number } = {};
    completedApts.forEach(apt => {
      if (apt.clientId) {
        clientAppointmentCount[apt.clientId] = (clientAppointmentCount[apt.clientId] || 0) + 1;
      }
    });
    const clientesRecorrentes = Object.values(clientAppointmentCount).filter(count => count > 1).length;
    const taxaRetorno = totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0;

    const totalAgendamentos = allAppointments.length;
    const taxaNoShow = totalAgendamentos > 0 ? (noShowApts.length / totalAgendamentos) * 100 : 0;
    const taxaConfirmacao = totalAgendamentos > 0 ? (confirmedApts.length / totalAgendamentos) * 100 : 0;

    const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
    completedApts.forEach(apt => {
      const svc = apt.service;
      if (!serviceStats[svc]) {
        serviceStats[svc] = { count: 0, revenue: 0 };
      }
      serviceStats[svc].count++;
      serviceStats[svc].revenue += parseFloat(apt.price || '0');
    });

    const top3Servicos = Object.entries(serviceStats)
      .map(([service, stats]) => ({ service, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    return {
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      taxaRetorno: Math.round(taxaRetorno * 100) / 100,
      totalFaturamento: Math.round(totalFaturamento * 100) / 100,
      totalAgendamentos,
      totalClientes,
      clientesRecorrentes,
      taxaNoShow: Math.round(taxaNoShow * 100) / 100,
      taxaConfirmacao: Math.round(taxaConfirmacao * 100) / 100,
      top3Servicos,
    };
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Verifica conflito de horário
   */
  private async checkConflict(
    date: string,
    time: string,
    duration: number,
    professionalId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existingAppointments = await this.db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.date, date),
        eq(appointments.professionalId, professionalId),
      ));

    const newStart = this.timeToMinutes(time);
    const newEnd = newStart + duration;

    for (const apt of existingAppointments) {
      if (excludeId && apt.id === excludeId) continue;
      if (apt.status === 'CANCELLED' || apt.status === 'NO_SHOW') continue;

      const aptStart = this.timeToMinutes(apt.time) - (apt.bufferBefore || 0);
      const aptEnd = this.timeToMinutes(apt.time) + apt.duration + (apt.bufferAfter || 0);

      if (newStart < aptEnd && newEnd > aptStart) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retorna agendamentos conflitantes
   */
  private async getConflictingAppointments(
    date: string,
    time: string,
    duration: number,
    professionalId: string,
  ): Promise<Appointment[]> {
    const existingAppointments = await this.db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.date, date),
        eq(appointments.professionalId, professionalId),
        ne(appointments.status, 'CANCELLED'),
        ne(appointments.status, 'NO_SHOW'),
      ));

    const newStart = this.timeToMinutes(time);
    const newEnd = newStart + duration;

    return existingAppointments.filter(apt => {
      const aptStart = this.timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.duration;
      return newStart < aptEnd && newEnd > aptStart;
    });
  }

  /**
   * Encontra próximos slots disponíveis
   */
  private async findNextAvailableSlots(
    professionalId: string,
    salonId: string,
    date: string,
    _duration: number,
    count: number,
  ): Promise<string[]> {
    const slots = await this.getAvailableSlots(professionalId, salonId, date);
    return slots.filter(s => s.available).slice(0, count).map(s => s.time);
  }

  /**
   * Busca bloqueios para uma data
   */
  private async getBlocksForDate(salonId: string, date: string, professionalId?: string): Promise<ProfessionalBlock[]> {
    const conditions = [
      eq(professionalBlocks.salonId, salonId),
      lte(professionalBlocks.startDate, date),
      gte(professionalBlocks.endDate, date),
      eq(professionalBlocks.status, 'APPROVED'),
    ];

    if (professionalId) {
      conditions.push(eq(professionalBlocks.professionalId, professionalId));
    }

    return this.db
      .select()
      .from(professionalBlocks)
      .where(and(...conditions));
  }

  /**
   * Busca bloqueios para um range de datas
   */
  private async getBlocksForDateRange(salonId: string, startDate: string, endDate: string): Promise<ProfessionalBlock[]> {
    return this.db
      .select()
      .from(professionalBlocks)
      .where(and(
        eq(professionalBlocks.salonId, salonId),
        eq(professionalBlocks.status, 'APPROVED'),
        or(
          and(gte(professionalBlocks.startDate, startDate), lte(professionalBlocks.startDate, endDate)),
          and(gte(professionalBlocks.endDate, startDate), lte(professionalBlocks.endDate, endDate)),
          and(lte(professionalBlocks.startDate, startDate), gte(professionalBlocks.endDate, endDate)),
        ),
      ));
  }

  /**
   * Verifica se há bloqueio em data/horário específico
   */
  private async hasBlockOnDate(
    professionalId: string,
    salonId: string,
    date: string,
    time: string,
    duration: number,
  ): Promise<boolean> {
    const blocks = await this.getBlocksForDate(salonId, date, professionalId);

    for (const block of blocks) {
      if (block.allDay) return true;

      if (block.startTime && block.endTime) {
        const blockStart = this.timeToMinutes(block.startTime);
        const blockEnd = this.timeToMinutes(block.endTime);
        const aptStart = this.timeToMinutes(time);
        const aptEnd = aptStart + duration;

        if (aptStart < blockEnd && aptEnd > blockStart) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Verifica se cliente está bloqueado
   */
  private async isClientBlocked(salonId: string, clientId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];

    const blocked = await this.db
      .select()
      .from(clientNoShows)
      .where(and(
        eq(clientNoShows.salonId, salonId),
        eq(clientNoShows.clientId, clientId),
        eq(clientNoShows.blocked, true),
        or(
          sql`${clientNoShows.blockedUntil} IS NULL`,
          gte(clientNoShows.blockedUntil, today),
        ),
      ))
      .limit(1);

    return blocked.length > 0;
  }

  /**
   * Enrich appointments with client/professional/service names
   */
  private async enrichAppointments(apts: Appointment[]): Promise<AppointmentWithDetails[]> {
    const enriched: AppointmentWithDetails[] = [];

    for (const apt of apts) {
      let clientNameResolved = apt.clientName;

      if (!clientNameResolved && apt.clientId) {
        const client = await this.db
          .select({ name: clients.name })
          .from(clients)
          .where(eq(clients.id, apt.clientId))
          .limit(1);
        clientNameResolved = client[0]?.name || null;
      }

      const professional = await this.db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, apt.professionalId))
        .limit(1);

      let serviceName = apt.service;
      let serviceDetails: AppointmentWithDetails['serviceDetails'];

      if (apt.serviceId) {
        const svc = await this.db
          .select()
          .from(services)
          .where(eq(services.id, apt.serviceId))
          .limit(1);
        if (svc[0]) {
          serviceName = svc[0].name;
          serviceDetails = {
            id: svc[0].id,
            name: svc[0].name,
            duration: svc[0].durationMinutes,
            price: svc[0].basePrice,
            bufferBefore: svc[0].bufferBefore,
            bufferAfter: svc[0].bufferAfter,
          };
        }
      }

      enriched.push({
        ...apt,
        clientName: clientNameResolved,
        professionalName: professional[0]?.name || 'Profissional',
        serviceName,
        serviceDetails,
      });
    }

    return enriched;
  }

  /**
   * Generate card number - Numeração sequencial simples (1, 2, 3...)
   */
  private async generateCardNumber(salonId: string): Promise<string> {
    // Busca todos os cardNumbers do salão
    const existingCommands = await this.db
      .select({ cardNumber: commands.cardNumber })
      .from(commands)
      .where(eq(commands.salonId, salonId));

    // Encontra o maior número existente (apenas números puros, ignora formato antigo)
    let maxNumber = 0;
    for (const cmd of existingCommands) {
      if (cmd.cardNumber && /^\d+$/.test(cmd.cardNumber)) {
        const num = parseInt(cmd.cardNumber, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    // Retorna o próximo número sequencial
    return String(maxNumber + 1);
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Calculate end time from start time and duration
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const startMinutes = this.timeToMinutes(startTime);
    return this.minutesToTime(startMinutes + duration);
  }
}

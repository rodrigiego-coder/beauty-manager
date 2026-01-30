import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { eq, and, gte, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

export type AvailabilityReason =
  | 'SALON_CLOSED'
  | 'PROFESSIONAL_NOT_WORKING'
  | 'PROFESSIONAL_BLOCKED'
  | 'EXCEEDS_CLOSING_TIME'
  | 'EXCEEDS_WORK_HOURS'
  | 'SLOT_OCCUPIED';

export interface AvailabilityResult {
  available: boolean;
  reason?: AvailabilityReason;
  message?: string;
  suggestedSlots?: string[];
  details?: {
    requestedTime?: string;
    serviceDuration?: number;
    serviceEndTime?: string;
    salonCloseTime?: string;
    professionalEndTime?: string;
  };
}

export interface SalonScheduleDto {
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ProfessionalScheduleDto {
  dayOfWeek: number;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CreateBlockDto {
  blockDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  blockType?: 'SINGLE' | 'VACATION';
}

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

@Injectable()
export class SchedulesService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // ==================== SALON SCHEDULES ====================

  async getSalonSchedule(salonId: string): Promise<schema.SalonSchedule[]> {
    const schedules = await this.db
      .select()
      .from(schema.salonSchedules)
      .where(eq(schema.salonSchedules.salonId, salonId))
      .orderBy(schema.salonSchedules.dayOfWeek);

    // Se não existir, criar horários padrão
    if (schedules.length === 0) {
      await this.initializeSalonSchedule(salonId);
      return this.getSalonSchedule(salonId);
    }

    return schedules;
  }

  async initializeSalonSchedule(salonId: string): Promise<void> {
    const defaultSchedules = [];
    for (let day = 0; day <= 6; day++) {
      defaultSchedules.push({
        salonId,
        dayOfWeek: day,
        isOpen: day !== 0, // Domingo fechado
        openTime: day !== 0 ? '08:00' : null,
        closeTime: day !== 0 ? '19:00' : null,
      });
    }

    await this.db.insert(schema.salonSchedules).values(defaultSchedules).onConflictDoNothing();
  }

  async updateSalonSchedule(
    salonId: string,
    dayOfWeek: number,
    data: Partial<SalonScheduleDto>,
  ): Promise<schema.SalonSchedule> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new BadRequestException('dayOfWeek deve ser entre 0 (domingo) e 6 (sábado)');
    }

    const [updated] = await this.db
      .update(schema.salonSchedules)
      .set({
        isOpen: data.isOpen,
        openTime: data.isOpen ? data.openTime : null,
        closeTime: data.isOpen ? data.closeTime : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.salonSchedules.salonId, salonId),
          eq(schema.salonSchedules.dayOfWeek, dayOfWeek),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException(`Horário não encontrado para ${DAYS_PT[dayOfWeek]}`);
    }

    return updated;
  }

  // ==================== PROFESSIONAL SCHEDULES ====================

  async getProfessionalSchedule(professionalId: string): Promise<schema.ProfessionalSchedule[]> {
    return this.db
      .select()
      .from(schema.professionalSchedules)
      .where(eq(schema.professionalSchedules.professionalId, professionalId))
      .orderBy(schema.professionalSchedules.dayOfWeek);
  }

  async initializeProfessionalSchedule(professionalId: string, salonId: string): Promise<void> {
    // Buscar horário do salão para usar como base
    const salonSchedule = await this.getSalonSchedule(salonId);

    const professionalSchedules = salonSchedule.map((s) => ({
      professionalId,
      salonId,
      dayOfWeek: s.dayOfWeek,
      isWorking: s.isOpen,
      startTime: s.openTime,
      endTime: s.closeTime,
    }));

    await this.db
      .insert(schema.professionalSchedules)
      .values(professionalSchedules)
      .onConflictDoNothing();
  }

  async updateProfessionalSchedule(
    professionalId: string,
    dayOfWeek: number,
    data: Partial<ProfessionalScheduleDto>,
  ): Promise<schema.ProfessionalSchedule> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new BadRequestException('dayOfWeek deve ser entre 0 (domingo) e 6 (sábado)');
    }

    const [updated] = await this.db
      .update(schema.professionalSchedules)
      .set({
        isWorking: data.isWorking,
        startTime: data.isWorking ? data.startTime : null,
        endTime: data.isWorking ? data.endTime : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.professionalSchedules.professionalId, professionalId),
          eq(schema.professionalSchedules.dayOfWeek, dayOfWeek),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException(`Horário não encontrado para ${DAYS_PT[dayOfWeek]}`);
    }

    return updated;
  }

  // ==================== PROFESSIONAL BLOCKS ====================

  async getProfessionalBlocks(
    professionalId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<schema.ProfessionalBlock[]> {
    let query = this.db
      .select()
      .from(schema.professionalBlocks)
      .where(eq(schema.professionalBlocks.professionalId, professionalId));

    if (startDate && endDate) {
      query = this.db
        .select()
        .from(schema.professionalBlocks)
        .where(
          and(
            eq(schema.professionalBlocks.professionalId, professionalId),
            gte(schema.professionalBlocks.startDate, startDate),
            lte(schema.professionalBlocks.endDate, endDate),
          ),
        );
    }

    return query;
  }

  async createProfessionalBlock(
    professionalId: string,
    salonId: string,
    createdById: string,
    data: CreateBlockDto,
  ): Promise<schema.ProfessionalBlock> {
    const [block] = await this.db
      .insert(schema.professionalBlocks)
      .values({
        professionalId,
        salonId,
        type: data.blockType === 'VACATION' ? 'VACATION' : 'PERSONAL',
        title: data.reason || 'Bloqueio',
        startDate: data.blockDate,
        endDate: data.blockDate,
        startTime: data.startTime,
        endTime: data.endTime,
        allDay: false,
        recurring: false,
        status: 'APPROVED',
        requiresApproval: false,
        createdById,
      })
      .returning();

    return block;
  }

  async deleteProfessionalBlock(blockId: string): Promise<void> {
    const result = await this.db
      .delete(schema.professionalBlocks)
      .where(eq(schema.professionalBlocks.id, blockId))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
  }

  // ==================== AVAILABILITY CHECK ====================

  async checkAvailability(
    salonId: string,
    professionalId: string,
    date: string,
    startTime: string,
    durationMinutes: number,
  ): Promise<AvailabilityResult> {
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Calcular horário de término do serviço
    const [startHour, startMin] = startTime.split(':').map(Number);
    const endMinutes = startHour * 60 + startMin + durationMinutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const serviceEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    // 1. Verificar se o salão está aberto nesse dia
    const salonSchedule = await this.db
      .select()
      .from(schema.salonSchedules)
      .where(
        and(
          eq(schema.salonSchedules.salonId, salonId),
          eq(schema.salonSchedules.dayOfWeek, dayOfWeek),
        ),
      )
      .limit(1);

    if (salonSchedule.length === 0 || !salonSchedule[0].isOpen) {
      const openDays = await this.getOpenDays(salonId);
      return {
        available: false,
        reason: 'SALON_CLOSED',
        message: `O salão está fechado ${DAYS_PT[dayOfWeek].toLowerCase()}. Funcionamos ${openDays}.`,
        details: { requestedTime: startTime },
      };
    }

    const salonCloseTime = salonSchedule[0].closeTime;
    const salonOpenTime = salonSchedule[0].openTime;

    // 2. Verificar se o horário está dentro do funcionamento do salão
    if (salonOpenTime && startTime < salonOpenTime) {
      return {
        available: false,
        reason: 'SALON_CLOSED',
        message: `O salão só abre às ${salonOpenTime}. Tente um horário a partir das ${salonOpenTime}.`,
        details: { requestedTime: startTime, salonCloseTime: salonCloseTime! },
      };
    }

    // 3. Verificar se o serviço termina antes do salão fechar
    if (salonCloseTime && serviceEndTime > salonCloseTime) {
      const suggestedSlots = this.calculateSuggestedSlots(
        salonOpenTime!,
        salonCloseTime,
        durationMinutes,
        startTime,
      );

      return {
        available: false,
        reason: 'EXCEEDS_CLOSING_TIME',
        message: `O serviço terminaria às ${serviceEndTime}, mas o salão fecha às ${salonCloseTime}.`,
        suggestedSlots,
        details: {
          requestedTime: startTime,
          serviceDuration: durationMinutes,
          serviceEndTime,
          salonCloseTime,
        },
      };
    }

    // 4. Verificar se o profissional trabalha nesse dia
    const profSchedule = await this.db
      .select()
      .from(schema.professionalSchedules)
      .where(
        and(
          eq(schema.professionalSchedules.professionalId, professionalId),
          eq(schema.professionalSchedules.dayOfWeek, dayOfWeek),
        ),
      )
      .limit(1);

    if (profSchedule.length > 0 && !profSchedule[0].isWorking) {
      const workDays = await this.getProfessionalWorkDays(professionalId);
      return {
        available: false,
        reason: 'PROFESSIONAL_NOT_WORKING',
        message: `O profissional não trabalha ${DAYS_PT[dayOfWeek].toLowerCase()}. Dias disponíveis: ${workDays}.`,
        details: { requestedTime: startTime },
      };
    }

    // 5. Verificar se está dentro do horário de trabalho do profissional
    if (profSchedule.length > 0) {
      const profStartTime = profSchedule[0].startTime;
      const profEndTime = profSchedule[0].endTime;

      if (profStartTime && startTime < profStartTime) {
        return {
          available: false,
          reason: 'PROFESSIONAL_NOT_WORKING',
          message: `O profissional começa a trabalhar às ${profStartTime}.`,
          details: { requestedTime: startTime, professionalEndTime: profEndTime! },
        };
      }

      if (profEndTime && serviceEndTime > profEndTime) {
        const suggestedSlots = this.calculateSuggestedSlots(
          profStartTime!,
          profEndTime,
          durationMinutes,
          startTime,
        );

        return {
          available: false,
          reason: 'EXCEEDS_WORK_HOURS',
          message: `O serviço terminaria às ${serviceEndTime}, mas o profissional encerra às ${profEndTime}.`,
          suggestedSlots,
          details: {
            requestedTime: startTime,
            serviceDuration: durationMinutes,
            serviceEndTime,
            professionalEndTime: profEndTime,
          },
        };
      }
    }

    // 6. Verificar bloqueios do profissional
    const blocks = await this.db
      .select()
      .from(schema.professionalBlocks)
      .where(
        and(
          eq(schema.professionalBlocks.professionalId, professionalId),
          eq(schema.professionalBlocks.startDate, date),
          eq(schema.professionalBlocks.status, 'APPROVED'),
        ),
      );

    for (const block of blocks) {
      // Verificar sobreposição de horários
      const blockStart = block.startTime || '00:00';
      const blockEnd = block.endTime || '23:59';

      if (this.timeOverlaps(startTime, serviceEndTime, blockStart, blockEnd)) {
        return {
          available: false,
          reason: 'PROFESSIONAL_BLOCKED',
          message: `O profissional tem um compromisso das ${blockStart} às ${blockEnd}${block.title ? ` (${block.title})` : ''}.`,
          details: { requestedTime: startTime },
        };
      }
    }

    // 7. Verificar conflito com outros agendamentos
    const existingAppointments = await this.db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.professionalId, professionalId),
          eq(schema.appointments.date, date),
        ),
      );

    for (const appt of existingAppointments) {
      if (
        appt.status !== 'CANCELLED' &&
        appt.status !== 'NO_SHOW' &&
        appt.startTime &&
        appt.endTime &&
        this.timeOverlaps(startTime, serviceEndTime, appt.startTime, appt.endTime)
      ) {
        const suggestedSlots = await this.findAvailableSlots(
          salonId,
          professionalId,
          date,
          durationMinutes,
        );

        return {
          available: false,
          reason: 'SLOT_OCCUPIED',
          message: `Já existe um agendamento das ${appt.startTime} às ${appt.endTime}.`,
          suggestedSlots,
          details: { requestedTime: startTime },
        };
      }
    }

    return { available: true };
  }

  // ==================== HELPER METHODS ====================

  private timeOverlaps(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  private calculateSuggestedSlots(
    dayStart: string,
    dayEnd: string,
    durationMinutes: number,
    aroundTime: string,
  ): string[] {
    const slots: string[] = [];
    const [startH, startM] = dayStart.split(':').map(Number);
    const [endH, endM] = dayEnd.split(':').map(Number);
    const [aroundH, aroundM] = aroundTime.split(':').map(Number);

    const dayStartMinutes = startH * 60 + startM;
    const dayEndMinutes = endH * 60 + endM;
    const aroundMinutes = aroundH * 60 + aroundM;

    // Procurar slots antes e depois do horário solicitado
    for (let m = aroundMinutes - 60; m <= aroundMinutes + 60; m += 30) {
      if (m >= dayStartMinutes && m + durationMinutes <= dayEndMinutes && m !== aroundMinutes) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }

    return slots.slice(0, 4);
  }

  private async getOpenDays(salonId: string): Promise<string> {
    const schedules = await this.db
      .select()
      .from(schema.salonSchedules)
      .where(
        and(eq(schema.salonSchedules.salonId, salonId), eq(schema.salonSchedules.isOpen, true)),
      );

    const days = schedules.map((s) => DAYS_PT[s.dayOfWeek].toLowerCase());
    return days.join(', ');
  }

  private async getProfessionalWorkDays(professionalId: string): Promise<string> {
    const schedules = await this.db
      .select()
      .from(schema.professionalSchedules)
      .where(
        and(
          eq(schema.professionalSchedules.professionalId, professionalId),
          eq(schema.professionalSchedules.isWorking, true),
        ),
      );

    const days = schedules.map((s) => DAYS_PT[s.dayOfWeek].toLowerCase());
    return days.join(', ');
  }

  private async findAvailableSlots(
    salonId: string,
    professionalId: string,
    date: string,
    durationMinutes: number,
  ): Promise<string[]> {
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Buscar horário do salão
    const salonSchedule = await this.db
      .select()
      .from(schema.salonSchedules)
      .where(
        and(
          eq(schema.salonSchedules.salonId, salonId),
          eq(schema.salonSchedules.dayOfWeek, dayOfWeek),
        ),
      )
      .limit(1);

    if (!salonSchedule[0]?.isOpen || !salonSchedule[0]?.openTime || !salonSchedule[0]?.closeTime) {
      return [];
    }

    const dayStart = salonSchedule[0].openTime;
    const dayEnd = salonSchedule[0].closeTime;

    // Buscar agendamentos existentes
    const appointments = await this.db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.professionalId, professionalId),
          eq(schema.appointments.date, date),
        ),
      );

    const occupiedSlots = appointments
      .filter((a) => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW' && a.startTime && a.endTime)
      .map((a) => ({ start: a.startTime!, end: a.endTime! }));

    // Gerar slots disponíveis
    const slots: string[] = [];
    const [startH, startM] = dayStart.split(':').map(Number);
    const [endH, endM] = dayEnd.split(':').map(Number);

    const dayStartMinutes = startH * 60 + startM;
    const dayEndMinutes = endH * 60 + endM;

    for (let m = dayStartMinutes; m + durationMinutes <= dayEndMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const slotStart = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      const slotEndMin = m + durationMinutes;
      const slotEndH = Math.floor(slotEndMin / 60);
      const slotEndM = slotEndMin % 60;
      const slotEnd = `${slotEndH.toString().padStart(2, '0')}:${slotEndM.toString().padStart(2, '0')}`;

      const isOccupied = occupiedSlots.some((occ) =>
        this.timeOverlaps(slotStart, slotEnd, occ.start, occ.end),
      );

      if (!isOccupied) {
        slots.push(slotStart);
      }
    }

    return slots.slice(0, 6);
  }
}

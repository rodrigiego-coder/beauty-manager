import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { db } from '../../database/connection';
import { appointments, services, users, clients, professionalServices } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { SchedulesService, AvailabilityResult } from '../schedules/schedules.service';

/**
 * =====================================================
 * ALEXIS SCHEDULER SERVICE
 * Gerenciamento de agendamentos via IA
 * =====================================================
 */

export interface AvailableSlot {
  time: string;
  professionalId: string;
  professionalName: string;
}

export interface CreateAppointmentData {
  salonId: string;
  clientPhone: string;
  clientName: string;
  serviceId: number;
  professionalId: string;
  date: Date;
  time: string;
}

export interface AppointmentResult {
  success: boolean;
  appointment?: any;
  error?: string;
}

@Injectable()
export class AlexisSchedulerService {
  private readonly logger = new Logger(AlexisSchedulerService.name);

  constructor(
    @Inject(forwardRef(() => SchedulesService))
    private readonly schedulesService: SchedulesService,
  ) {}

  /**
   * Busca horários disponíveis para um serviço
   */
  async getAvailableSlots(
    salonId: string,
    serviceId: number,
    date: Date,
    professionalId?: string,
  ): Promise<AvailableSlot[]> {
    try {
      // Busca serviço para saber duração
      const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);

      if (!service) {
        this.logger.warn(`Serviço ${serviceId} não encontrado`);
        return [];
      }

      // Busca profissionais ativos do salão
      const allProfessionals = await db
        .select()
        .from(users)
        .where(and(eq(users.salonId, salonId), eq(users.role, 'STYLIST'), eq(users.active, true)));

      // Filtra por professional_services (se houver assignments para o serviço)
      const enabledIds = await db
        .select({ professionalId: professionalServices.professionalId })
        .from(professionalServices)
        .innerJoin(users, eq(professionalServices.professionalId, users.id))
        .where(
          and(
            eq(professionalServices.serviceId, serviceId),
            eq(professionalServices.enabled, true),
            eq(users.salonId, salonId),
          ),
        );

      let filteredProfessionals = allProfessionals;
      if (enabledIds.length > 0) {
        const aptSet = new Set(enabledIds.map((r) => r.professionalId));
        filteredProfessionals = allProfessionals.filter((p) => aptSet.has(p.id));
      }

      const targetProfessionals = professionalId
        ? filteredProfessionals.filter((p) => p.id === professionalId)
        : filteredProfessionals;

      if (targetProfessionals.length === 0) {
        return [];
      }

      // Formato de data YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];

      // Busca agendamentos do dia
      const existingAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.salonId, salonId),
            eq(appointments.date, dateStr),
            eq(appointments.status, 'SCHEDULED'),
          ),
        );

      // Calcula slots disponíveis (8h às 20h, intervalos de 30min)
      const slots: AvailableSlot[] = [];
      const serviceDuration = service.durationMinutes;
      const now = new Date();

      for (const professional of targetProfessionals) {
        // Calcula cutoff considerando lead time do profissional
        const cutoffDate = new Date(now);
        const leadTimeEnabled = professional.leadTimeEnabled ?? false;
        const leadTimeMinutes = Math.max(0, professional.leadTimeMinutes ?? 0);

        if (leadTimeEnabled && leadTimeMinutes > 0) {
          cutoffDate.setMinutes(cutoffDate.getMinutes() + leadTimeMinutes);
          this.logger.debug({
            event: 'LEAD_TIME_APPLIED',
            professionalId: professional.id,
            salonId,
            leadTimeMinutes,
            now: now.toISOString(),
            cutoff: cutoffDate.toISOString(),
          });
        }

        for (let hour = 8; hour < 20; hour++) {
          for (const minute of [0, 30]) {
            const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const slotDate = new Date(date);
            slotDate.setHours(hour, minute, 0, 0);

            // Verifica se slot está antes do cutoff (now + lead time)
            if (slotDate < cutoffDate) {
              continue;
            }

            // Calcula o fim do slot baseado na duração do serviço
            const slotEndMinutes = hour * 60 + minute + serviceDuration;

            // Verifica se tem conflito com outro agendamento
            const hasConflict = existingAppointments.some((apt) => {
              if (apt.professionalId !== professional.id) return false;

              // Converte horário do agendamento existente para minutos
              const [aptHour, aptMin] = (apt.time || '00:00').split(':').map(Number);
              const aptStartMinutes = aptHour * 60 + aptMin;
              const aptEndMinutes = aptStartMinutes + apt.duration;

              // Verifica sobreposição
              const slotStartMinutes = hour * 60 + minute;
              return (
                (slotStartMinutes >= aptStartMinutes && slotStartMinutes < aptEndMinutes) ||
                (slotEndMinutes > aptStartMinutes && slotEndMinutes <= aptEndMinutes) ||
                (slotStartMinutes <= aptStartMinutes && slotEndMinutes >= aptEndMinutes)
              );
            });

            if (!hasConflict) {
              slots.push({
                time: slotTime,
                professionalId: professional.id,
                professionalName: professional.name || 'Profissional',
              });
            }
          }
        }
      }

      return slots;
    } catch (error: any) {
      this.logger.error('Erro ao buscar horários disponíveis:', error?.message || error);
      return [];
    }
  }

  /**
   * Cria um novo agendamento
   */
  async createAppointment(data: CreateAppointmentData): Promise<AppointmentResult> {
    try {
      // Busca ou cria cliente
      let [client] = await db
        .select()
        .from(clients)
        .where(and(eq(clients.salonId, data.salonId), eq(clients.phone, data.clientPhone)))
        .limit(1);

      if (!client) {
        const [newClient] = await db
          .insert(clients)
          .values({
            salonId: data.salonId,
            name: data.clientName || 'Cliente WhatsApp',
            phone: data.clientPhone,
          })
          .returning();
        client = newClient;
      }

      // Busca serviço
      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, data.serviceId))
        .limit(1);

      if (!service) {
        return { success: false, error: 'Serviço não encontrado' };
      }

      // Formata data como YYYY-MM-DD
      const dateStr = data.date.toISOString().split('T')[0];

      // Verifica disponibilidade usando SchedulesService (validação completa)
      const availability = await this.schedulesService.checkAvailability(
        data.salonId,
        data.professionalId,
        dateStr,
        data.time,
        service.durationMinutes,
      );

      if (!availability.available) {
        // Retorna mensagem amigável baseada no motivo
        const friendlyMessage = this.formatAvailabilityError(availability);
        return { success: false, error: friendlyMessage };
      }

      // Calcula o horário de fim
      const [hour, minute] = data.time.split(':').map(Number);
      const endMinutes = hour * 60 + minute + service.durationMinutes;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      // Cria o agendamento
      const [appointment] = await db
        .insert(appointments)
        .values({
          salonId: data.salonId,
          clientId: client.id,
          serviceId: data.serviceId,
          professionalId: data.professionalId,
          date: dateStr,
          time: data.time,
          startTime: data.time,
          endTime: endTime,
          duration: service.durationMinutes,
          service: service.name,
          status: 'SCHEDULED',
        })
        .returning();

      this.logger.log(`Agendamento criado via WhatsApp: ${appointment.id}`);

      return { success: true, appointment };
    } catch (error: any) {
      this.logger.error('Erro ao criar agendamento:', error?.message || error);
      return { success: false, error: 'Erro ao criar agendamento' };
    }
  }

  /**
   * Formata a lista de horários disponíveis para exibição
   */
  formatAvailableSlots(slots: AvailableSlot[], limit = 6): string {
    if (slots.length === 0) {
      return 'Não há horários disponíveis para esta data.';
    }

    const limitedSlots = slots.slice(0, limit);
    return limitedSlots.map((s) => `• ${s.time} - ${s.professionalName}`).join('\n');
  }

  /**
   * Formata erro de disponibilidade em mensagem amigável para WhatsApp
   */
  private formatAvailabilityError(availability: AvailabilityResult): string {
    const suggestions = availability.suggestedSlots?.length
      ? `\n\nHorários sugeridos: ${availability.suggestedSlots.join(', ')}`
      : '';

    switch (availability.reason) {
      case 'SALON_CLOSED':
        return `${availability.message}${suggestions}`;

      case 'EXCEEDS_CLOSING_TIME':
        return `Esse horário não dá porque o serviço terminaria às ${availability.details?.serviceEndTime}, ` +
          `mas o salão fecha às ${availability.details?.salonCloseTime?.substring(0, 5)}.${suggestions}`;

      case 'PROFESSIONAL_NOT_WORKING':
        return `${availability.message}${suggestions}`;

      case 'EXCEEDS_WORK_HOURS':
        return `Esse horário passa do expediente do profissional. ` +
          `O serviço terminaria às ${availability.details?.serviceEndTime}, ` +
          `mas ele encerra às ${availability.details?.professionalEndTime?.substring(0, 5)}.${suggestions}`;

      case 'PROFESSIONAL_BLOCKED':
        return `O profissional tem um compromisso nesse horário.${suggestions}`;

      case 'SLOT_OCCUPIED':
        return `Já existe um agendamento nesse horário.${suggestions}`;

      default:
        return availability.message || 'Horário não disponível. Tente outro horário.';
    }
  }
}

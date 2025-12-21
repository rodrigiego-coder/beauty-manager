import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, lte, inArray, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  appointmentNotifications,
  NewAppointmentNotification,
} from '../../database/schema';
import { addHours, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class ScheduledMessagesService {
  private readonly logger = new Logger(ScheduledMessagesService.name);

  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Agenda mensagem de confirmação ao criar agendamento
   */
  async scheduleAppointmentConfirmation(appointment: any, triageLink?: string): Promise<void> {
    if (!appointment.clientPhone) {
      this.logger.warn(`Agendamento ${appointment.id} sem telefone do cliente`);
      return;
    }

    const variables = this.buildTemplateVariables(appointment);

    // Adicionar link de triagem às variáveis se existir
    if (triageLink) {
      variables.triageLink = triageLink;
    }

    await this.createNotification({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_CONFIRMATION',
      templateKey: 'appointment_confirmation',
      templateVariables: variables,
      scheduledFor: new Date(), // Enviar imediatamente
    });

    this.logger.log(`Confirmação agendada para ${appointment.clientPhone}${triageLink ? ' com link de triagem' : ''}`);
  }

  /**
   * Agenda lembrete 24h antes do agendamento
   */
  async scheduleReminder24h(appointment: any, triageLink?: string): Promise<void> {
    if (!appointment.clientPhone) return;

    const appointmentDateTime = this.parseAppointmentDateTime(appointment);
    const reminderTime = addHours(appointmentDateTime, -24);

    // Só agenda se for no futuro
    if (reminderTime <= new Date()) {
      this.logger.debug(`Lembrete 24h já passou para agendamento ${appointment.id}`);
      return;
    }

    const variables = this.buildTemplateVariables(appointment);

    // Se tem triagem, adicionar link (será verificado se pendente no momento do envio)
    if (triageLink) {
      variables.triageLink = triageLink;
      variables.triagePending = 'true'; // Será verificado no momento do envio
    }

    await this.createNotification({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_REMINDER_24H',
      templateKey: 'appointment_reminder_24h',
      templateVariables: variables,
      scheduledFor: reminderTime,
    });

    this.logger.log(`Lembrete 24h agendado para ${format(reminderTime, 'dd/MM HH:mm')}`);
  }

  /**
   * Agenda lembrete 1h antes do agendamento
   */
  async scheduleReminder1h(appointment: any): Promise<void> {
    if (!appointment.clientPhone) return;

    const appointmentDateTime = this.parseAppointmentDateTime(appointment);
    const reminderTime = addHours(appointmentDateTime, -1);

    if (reminderTime <= new Date()) {
      this.logger.debug(`Lembrete 1h já passou para agendamento ${appointment.id}`);
      return;
    }

    const variables = this.buildTemplateVariables(appointment);

    await this.createNotification({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_REMINDER_1H',
      templateKey: 'appointment_reminder_1h',
      templateVariables: variables,
      scheduledFor: reminderTime,
    });

    this.logger.log(`Lembrete 1h agendado para ${format(reminderTime, 'dd/MM HH:mm')}`);
  }

  /**
   * Agenda notificação de cancelamento
   */
  async scheduleAppointmentCancellation(appointment: any): Promise<void> {
    if (!appointment.clientPhone) return;

    const variables = this.buildTemplateVariables(appointment);

    await this.createNotification({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_CANCELLED',
      templateKey: 'appointment_cancelled',
      templateVariables: variables,
      scheduledFor: new Date(), // Enviar imediatamente
    });

    this.logger.log(`Notificação de cancelamento agendada para ${appointment.clientPhone}`);
  }

  /**
   * Agenda notificação de reagendamento
   */
  async scheduleAppointmentRescheduled(
    appointment: any,
    oldDate: string,
    oldTime: string,
  ): Promise<void> {
    if (!appointment.clientPhone) return;

    const variables = {
      ...this.buildTemplateVariables(appointment),
      dataAnterior: oldDate,
      horarioAnterior: oldTime,
    };

    await this.createNotification({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_RESCHEDULED',
      templateKey: 'appointment_rescheduled',
      templateVariables: variables,
      scheduledFor: new Date(), // Enviar imediatamente
    });

    this.logger.log(`Notificação de reagendamento agendada para ${appointment.clientPhone}`);
  }

  /**
   * Agenda todas as notificações de um agendamento
   * @param appointment Dados do agendamento
   * @param triageLink Link opcional para pré-avaliação
   */
  async scheduleAllAppointmentNotifications(appointment: any, triageLink?: string): Promise<void> {
    try {
      await this.scheduleAppointmentConfirmation(appointment, triageLink);
      await this.scheduleReminder24h(appointment, triageLink);
      await this.scheduleReminder1h(appointment);
    } catch (error) {
      this.logger.error(`Erro ao agendar notificações para ${appointment.id}:`, error);
      // Não propaga o erro para não impedir a criação do agendamento
    }
  }

  /**
   * Cancela todas as notificações pendentes de um agendamento
   */
  async cancelAppointmentNotifications(appointmentId: string): Promise<void> {
    await this.db
      .update(appointmentNotifications)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(appointmentNotifications.appointmentId, appointmentId),
          inArray(appointmentNotifications.status, ['PENDING', 'SCHEDULED']),
        ),
      );

    this.logger.log(`Notificações canceladas para agendamento ${appointmentId}`);
  }

  /**
   * Busca mensagens pendentes para processamento
   */
  async getPendingMessages(limit: number = 50): Promise<any[]> {
    return this.db
      .select()
      .from(appointmentNotifications)
      .where(
        and(
          inArray(appointmentNotifications.status, ['PENDING', 'SCHEDULED']),
          lte(appointmentNotifications.scheduledFor, new Date()),
        ),
      )
      .limit(limit);
  }

  /**
   * Atualiza status da mensagem após envio
   */
  async updateMessageStatus(
    messageId: string,
    status: string,
    providerMessageId?: string,
    error?: string,
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
      lastAttemptAt: new Date(),
    };

    if (providerMessageId) {
      updateData.providerMessageId = providerMessageId;
    }

    if (status === 'SENT') {
      updateData.sentAt = new Date();
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    if (status === 'READ') {
      updateData.readAt = new Date();
    }

    if (error) {
      updateData.lastError = error;
    }

    // Incrementar attempts
    await this.db
      .update(appointmentNotifications)
      .set({
        ...updateData,
        attempts: sql`${appointmentNotifications.attempts} + 1`,
      })
      .where(eq(appointmentNotifications.id, messageId));
  }

  /**
   * Registra resposta do cliente (SIM/NÃO)
   */
  async registerClientResponse(appointmentId: string, response: string): Promise<void> {
    // Atualiza a mensagem de confirmação
    await this.db
      .update(appointmentNotifications)
      .set({
        clientResponse: response.toUpperCase(),
        clientRespondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(appointmentNotifications.appointmentId, appointmentId),
          eq(appointmentNotifications.notificationType, 'APPOINTMENT_CONFIRMATION'),
        ),
      );
  }

  /**
   * Busca estatísticas de mensagens por salão
   */
  async getMessageStats(salonId: string): Promise<any> {
    const result = await this.db
      .select({
        status: appointmentNotifications.status,
        count: sql<number>`count(*)::int`,
      })
      .from(appointmentNotifications)
      .where(eq(appointmentNotifications.salonId, salonId))
      .groupBy(appointmentNotifications.status);

    return result.reduce(
      (acc: any, row: any) => {
        acc[row.status.toLowerCase()] = row.count;
        return acc;
      },
      {
        pending: 0,
        scheduled: 0,
        sending: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        cancelled: 0,
      },
    );
  }

  /**
   * Cria mensagem agendada
   */
  private async createNotification(data: Partial<NewAppointmentNotification>): Promise<void> {
    const scheduledFor = data.scheduledFor || new Date();
    await this.db.insert(appointmentNotifications).values({
      ...data,
      status: scheduledFor <= new Date() ? 'PENDING' : 'SCHEDULED',
    });
  }

  /**
   * Monta variáveis do template
   */
  private buildTemplateVariables(appointment: any): Record<string, any> {
    const dateFormatted = format(new Date(appointment.date), "EEEE, dd 'de' MMMM", {
      locale: ptBR,
    });

    return {
      nome: appointment.clientName || 'Cliente',
      data: dateFormatted,
      horario: appointment.time || appointment.startTime,
      servico: appointment.service || '',
      profissional: appointment.professionalName || '',
    };
  }

  /**
   * Converte data + hora do agendamento em Date
   */
  private parseAppointmentDateTime(appointment: any): Date {
    const dateStr = appointment.date;
    const timeStr = appointment.time || appointment.startTime;
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  /**
   * Formata telefone para padrão internacional
   */
  private formatPhone(phone: string): string {
    // Remove tudo que não é número
    let cleaned = phone.replace(/\D/g, '');

    // Adiciona código do Brasil se não tiver
    if (cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }
}

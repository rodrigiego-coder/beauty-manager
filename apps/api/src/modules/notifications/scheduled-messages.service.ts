import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, lte, inArray, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  appointmentNotifications,
  NewAppointmentNotification,
  salons,
} from '../../database/schema';
import { addHours, addMinutes, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ID único do worker para identificação em logs
const WORKER_ID = `worker-${process.pid}-${Date.now().toString(36)}`;

@Injectable()
export class ScheduledMessagesService {
  private readonly logger = new Logger(ScheduledMessagesService.name);

  constructor(@Inject(DATABASE_CONNECTION) private db: any) {
    this.logger.log(`Worker ID: ${WORKER_ID}`);
  }

  // ==================== AGENDAMENTO DE NOTIFICAÇÕES ====================

  /**
   * Agenda mensagem de confirmação ao criar agendamento
   * IDEMPOTENTE: Usa dedupeKey para evitar duplicação
   */
  async scheduleAppointmentConfirmation(appointment: any, triageLink?: string): Promise<void> {
    if (!appointment.clientPhone) {
      this.logger.warn(`Agendamento ${appointment.id} sem telefone do cliente`);
      return;
    }

    // Busca dados do salão (endereço e localização)
    const salonInfo = await this.getSalonInfo(appointment.salonId);
    const variables = this.buildTemplateVariables(appointment, salonInfo);

    if (triageLink) {
      variables.triageLink = triageLink;
    }

    const dedupeKey = `${appointment.id}:APPOINTMENT_CONFIRMATION`;

    await this.createNotificationIdempotent({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_CONFIRMATION',
      templateKey: 'appointment_confirmation',
      templateVariables: variables,
      scheduledFor: new Date(),
      dedupeKey,
    });

    this.logger.log(
      `Confirmação agendada para ${appointment.clientPhone}${triageLink ? ' com link de triagem' : ''}`,
    );
  }

  /**
   * Agenda lembrete 24h antes do agendamento
   */
  async scheduleReminder24h(appointment: any, triageLink?: string): Promise<void> {
    if (!appointment.clientPhone) return;

    const appointmentDateTime = this.parseAppointmentDateTime(appointment);
    const reminderTime = addHours(appointmentDateTime, -24);

    if (reminderTime <= new Date()) {
      this.logger.debug(`Lembrete 24h já passou para agendamento ${appointment.id}`);
      return;
    }

    const variables = this.buildTemplateVariables(appointment);

    if (triageLink) {
      variables.triageLink = triageLink;
      variables.triagePending = 'true';
    }

    const dedupeKey = `${appointment.id}:APPOINTMENT_REMINDER_24H`;

    await this.createNotificationIdempotent({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_REMINDER_24H',
      templateKey: 'appointment_reminder_24h',
      templateVariables: variables,
      scheduledFor: reminderTime,
      dedupeKey,
    });

    this.logger.log(`Lembrete 24h agendado para ${format(reminderTime, 'dd/MM HH:mm')}`);
  }

  /**
   * Agenda lembrete 1h30 antes do agendamento
   */
  async scheduleReminder1h30(appointment: any): Promise<void> {
    if (!appointment.clientPhone) return;

    const appointmentDateTime = this.parseAppointmentDateTime(appointment);
    const reminderTime = addMinutes(appointmentDateTime, -90); // 1h30 = 90 minutos

    if (reminderTime <= new Date()) {
      this.logger.debug(`Lembrete 1h30 já passou para agendamento ${appointment.id}`);
      return;
    }

    const variables = this.buildTemplateVariables(appointment);
    const dedupeKey = `${appointment.id}:APPOINTMENT_REMINDER_1H30`;

    await this.createNotificationIdempotent({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_REMINDER_1H30',
      templateKey: 'appointment_reminder_1h30',
      templateVariables: variables,
      scheduledFor: reminderTime,
      dedupeKey,
    });

    this.logger.log(`Lembrete 1h30 agendado para ${format(reminderTime, 'dd/MM HH:mm')}`);
  }

  /**
   * Agenda notificação de cancelamento
   */
  async scheduleAppointmentCancellation(appointment: any): Promise<void> {
    if (!appointment.clientPhone) return;

    const variables = this.buildTemplateVariables(appointment);
    const dedupeKey = `${appointment.id}:APPOINTMENT_CANCELLED:${Date.now()}`;

    await this.createNotificationIdempotent({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_CANCELLED',
      templateKey: 'appointment_cancelled',
      templateVariables: variables,
      scheduledFor: new Date(),
      dedupeKey,
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

    const dedupeKey = `${appointment.id}:APPOINTMENT_RESCHEDULED:${Date.now()}`;

    await this.createNotificationIdempotent({
      salonId: appointment.salonId,
      appointmentId: appointment.id,
      recipientPhone: this.formatPhone(appointment.clientPhone),
      recipientName: appointment.clientName,
      notificationType: 'APPOINTMENT_RESCHEDULED',
      templateKey: 'appointment_rescheduled',
      templateVariables: variables,
      scheduledFor: new Date(),
      dedupeKey,
    });

    this.logger.log(`Notificação de reagendamento agendada para ${appointment.clientPhone}`);
  }

  /**
   * Agenda todas as notificações de um agendamento
   */
  async scheduleAllAppointmentNotifications(appointment: any, triageLink?: string): Promise<void> {
    try {
      await this.scheduleAppointmentConfirmation(appointment, triageLink);
      await this.scheduleReminder24h(appointment, triageLink);
      await this.scheduleReminder1h30(appointment);
    } catch (error) {
      this.logger.error(`Erro ao agendar notificações para ${appointment.id}:`, error);
      // Degradação graciosa: não propaga erro
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

  // ==================== PROCESSAMENTO COM SKIP LOCKED ====================

  /**
   * Busca mensagens pendentes para processamento usando SKIP LOCKED
   * CONCORRÊNCIA SEGURA: Evita que múltiplos workers processem a mesma mensagem
   */
  async getPendingMessagesWithLock(limit: number = 20): Promise<any[]> {
    try {
      this.logger.log(`[getPendingMessagesWithLock] Iniciando busca (limit=${limit})`);

      // Usa transaction com FOR UPDATE SKIP LOCKED
      const result = await this.db.transaction(async (tx: any) => {
        // 1. Seleciona mensagens pendentes com lock exclusivo
        const messages = await tx.execute(sql`
          SELECT *
          FROM appointment_notifications
          WHERE status IN ('PENDING', 'SCHEDULED')
            AND scheduled_for <= NOW()
            AND (processing_started_at IS NULL OR processing_started_at < NOW() - INTERVAL '5 minutes')
          ORDER BY scheduled_for ASC, created_at ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        `);

        // DEBUG: Log da estrutura retornada
        this.logger.log(`[getPendingMessagesWithLock] Resultado bruto: ${JSON.stringify({
          type: typeof messages,
          isArray: Array.isArray(messages),
          hasRows: !!messages?.rows,
          rowsLength: messages?.rows?.length,
          keys: messages ? Object.keys(messages) : [],
          firstItem: Array.isArray(messages) ? messages[0] : messages?.rows?.[0],
        })}`);

        // Drizzle pode retornar como array direto ou como { rows: [] }
        const rows = Array.isArray(messages) ? messages : (messages?.rows || []);

        if (!rows || rows.length === 0) {
          this.logger.log('[getPendingMessagesWithLock] Nenhuma mensagem encontrada após parse');
          return [];
        }

        const messageIds = rows.map((m: any) => m.id);
        this.logger.log(`[getPendingMessagesWithLock] Encontradas ${messageIds.length} mensagens: ${messageIds.join(', ')}`);

        // 2. Marca como em processamento usando IN com sql.join
        const idPlaceholders = sql.join(messageIds.map((id: string) => sql`${id}`), sql`, `);
        await tx.execute(sql`
          UPDATE appointment_notifications
          SET
            status = 'SENDING',
            processing_started_at = NOW(),
            processing_worker_id = ${WORKER_ID}
          WHERE id IN (${idPlaceholders})
        `);

        return rows;
      });

      // Garante que sempre retorna array
      const finalResult = result || [];
      this.logger.log(`[getPendingMessagesWithLock] Retornando ${finalResult.length} mensagens`);
      return finalResult;
    } catch (error: any) {
      this.logger.error(`[getPendingMessagesWithLock] ERRO: ${error.message || error}`);
      this.logger.error(`[getPendingMessagesWithLock] Stack: ${error.stack || 'N/A'}`);
      return []; // Degradação graciosa - retorna array vazio em caso de erro
    }
  }

  /**
   * Método legado para compatibilidade
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
   * COM RETRY e backoff exponencial
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
      processingStartedAt: null,
      processingWorkerId: null,
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

    await this.db
      .update(appointmentNotifications)
      .set({
        ...updateData,
        attempts: sql`${appointmentNotifications.attempts} + 1`,
      })
      .where(eq(appointmentNotifications.id, messageId));
  }

  /**
   * Marca mensagem para retry com backoff exponencial
   */
  async scheduleRetry(messageId: string, currentAttempts: number, error: string): Promise<void> {
    // Backoff: 2^attempts minutos (1, 2, 4, 8, 16...)
    const backoffMinutes = Math.pow(2, currentAttempts);
    const nextAttempt = addMinutes(new Date(), Math.min(backoffMinutes, 60));

    await this.db
      .update(appointmentNotifications)
      .set({
        status: 'PENDING',
        scheduledFor: nextAttempt,
        lastError: error,
        lastAttemptAt: new Date(),
        processingStartedAt: null,
        processingWorkerId: null,
        attempts: sql`${appointmentNotifications.attempts} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(appointmentNotifications.id, messageId));

    this.logger.debug(`Retry agendado para ${format(nextAttempt, 'HH:mm')} (tentativa ${currentAttempts + 1})`);
  }

  /**
   * Registra resposta do cliente
   */
  async registerClientResponse(appointmentId: string, response: string): Promise<void> {
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

  // ==================== UTILITÁRIOS PRIVADOS ====================

  /**
   * Cria notificação com idempotência
   * SEGURO: Se dedupeKey já existe, ignora silenciosamente
   */
  private async createNotificationIdempotent(
    data: Partial<NewAppointmentNotification> & { dedupeKey: string },
  ): Promise<void> {
    try {
      const scheduledFor = data.scheduledFor || new Date();

      await this.db.insert(appointmentNotifications).values({
        ...data,
        status: scheduledFor <= new Date() ? 'PENDING' : 'SCHEDULED',
      });
    } catch (error: any) {
      // Código 23505 = unique_violation (PostgreSQL)
      if (error.code === '23505' && error.constraint?.includes('dedupe')) {
        this.logger.debug(`Notificação já existe: ${data.dedupeKey} (idempotente)`);
        return; // Não é erro!
      }
      throw error;
    }
  }

  /**
   * Busca informações do salão (endereço e localização)
   */
  private async getSalonInfo(salonId: string): Promise<{ address?: string; locationUrl?: string; wazeUrl?: string }> {
    try {
      const [salon] = await this.db
        .select({
          address: salons.address,
          locationUrl: salons.locationUrl,
          wazeUrl: salons.wazeUrl,
        })
        .from(salons)
        .where(eq(salons.id, salonId))
        .limit(1);

      return salon || {};
    } catch (error) {
      this.logger.warn(`Erro ao buscar dados do salão ${salonId}: ${error}`);
      return {};
    }
  }

  /**
   * Monta variáveis do template
   */
  private buildTemplateVariables(
    appointment: any,
    salonInfo?: { address?: string; locationUrl?: string; wazeUrl?: string },
  ): Record<string, any> {
    const dateFormatted = format(new Date(appointment.date), "EEEE, dd 'de' MMMM", {
      locale: ptBR,
    });

    return {
      nome: appointment.clientName || 'Cliente',
      data: dateFormatted,
      horario: appointment.time || appointment.startTime,
      servico: appointment.service || '',
      profissional: appointment.professionalName || '',
      endereco: salonInfo?.address || '',
      localizacao: salonInfo?.locationUrl || '',
      waze: salonInfo?.wazeUrl || '',
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
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }
}

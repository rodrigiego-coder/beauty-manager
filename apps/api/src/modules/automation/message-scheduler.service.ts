import { Injectable, Logger } from '@nestjs/common';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { WhatsAppService } from './whatsapp.service';
import { SMSService } from './sms.service';
import { MessageChannel, TemplateVariables } from './dto';

/**
 * MessageSchedulerService
 * Handles scheduling and processing of automated messages
 */
@Injectable()
export class MessageSchedulerService {
  private readonly logger = new Logger(MessageSchedulerService.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly smsService: SMSService,
  ) {}

  /**
   * Agenda lembretes para um agendamento
   */
  async scheduleAppointmentReminders(
    appointmentId: string,
    salonId: string,
    clientId: string,
    scheduledDate: string,
    scheduledTime: string,
  ): Promise<void> {
    const settings = await this.getSettings(salonId);
    if (!settings || !settings.reminderEnabled) return;

    // Busca template de lembrete
    const template = await db.query.messageTemplates.findFirst({
      where: and(
        eq(schema.messageTemplates.salonId, salonId),
        eq(schema.messageTemplates.type, 'APPOINTMENT_REMINDER'),
        eq(schema.messageTemplates.isActive, true),
      ),
    });

    if (!template) return;

    // Calcula horário de envio
    const appointmentDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const scheduledFor = new Date(appointmentDateTime);
    scheduledFor.setHours(scheduledFor.getHours() - settings.reminderHoursBefore);

    // Só agenda se a data de envio ainda não passou
    if (scheduledFor <= new Date()) return;

    // Determina canal
    const channel = this.determineChannel(template.channel, settings);

    await db.insert(schema.scheduledMessages).values({
      salonId,
      templateId: template.id,
      clientId,
      appointmentId,
      channel,
      scheduledFor,
    });

    this.logger.log(`Lembrete agendado para ${scheduledFor.toISOString()}`);
  }

  /**
   * Agenda pedido de confirmação
   */
  async scheduleConfirmationRequest(
    appointmentId: string,
    salonId: string,
    clientId: string,
    scheduledDate: string,
    scheduledTime: string,
  ): Promise<void> {
    const settings = await this.getSettings(salonId);
    if (!settings || !settings.confirmationEnabled) return;

    const template = await db.query.messageTemplates.findFirst({
      where: and(
        eq(schema.messageTemplates.salonId, salonId),
        eq(schema.messageTemplates.type, 'APPOINTMENT_CONFIRMATION'),
        eq(schema.messageTemplates.isActive, true),
      ),
    });

    if (!template) return;

    const appointmentDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const scheduledFor = new Date(appointmentDateTime);
    scheduledFor.setHours(scheduledFor.getHours() - settings.confirmationHoursBefore);

    if (scheduledFor <= new Date()) return;

    const channel = this.determineChannel(template.channel, settings);

    await db.insert(schema.scheduledMessages).values({
      salonId,
      templateId: template.id,
      clientId,
      appointmentId,
      channel,
      scheduledFor,
    });

    this.logger.log(`Confirmação agendada para ${scheduledFor.toISOString()}`);
  }

  /**
   * Agenda mensagens de aniversário do dia
   */
  async scheduleBirthdayMessages(): Promise<number> {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Busca clientes aniversariantes
    const birthdayClients = await db.query.clients.findMany({
      where: sql`TO_CHAR(${schema.clients.birthDate}, 'MM-DD') = ${`${month}-${day}`}`,
    });

    this.logger.log(`Encontrados ${birthdayClients.length} aniversariantes`);

    let scheduled = 0;

    for (const client of birthdayClients) {
      if (!client.salonId) continue;

      const settings = await this.getSettings(client.salonId);
      if (!settings || !settings.birthdayEnabled) continue;

      const template = await db.query.messageTemplates.findFirst({
        where: and(
          eq(schema.messageTemplates.salonId, client.salonId),
          eq(schema.messageTemplates.type, 'BIRTHDAY'),
          eq(schema.messageTemplates.isActive, true),
        ),
      });

      if (!template) continue;

      // Verifica se já não foi agendada hoje
      const existing = await db.query.scheduledMessages.findFirst({
        where: and(
          eq(schema.scheduledMessages.clientId, client.id),
          eq(schema.scheduledMessages.templateId, template.id),
          gte(schema.scheduledMessages.scheduledFor, new Date(today.setHours(0, 0, 0, 0))),
        ),
      });

      if (existing) continue;

      // Agenda para o horário configurado
      const [hours, minutes] = settings.birthdayTime.split(':').map(Number);
      const scheduledFor = new Date();
      scheduledFor.setHours(hours, minutes, 0, 0);

      // Se o horário já passou hoje, não agenda
      if (scheduledFor <= new Date()) continue;

      const channel = this.determineChannel(template.channel, settings);

      await db.insert(schema.scheduledMessages).values({
        salonId: client.salonId,
        templateId: template.id,
        clientId: client.id,
        channel,
        scheduledFor,
      });

      scheduled++;
    }

    return scheduled;
  }

  /**
   * Processa mensagens agendadas pendentes
   */
  async processScheduledMessages(): Promise<{ processed: number; sent: number; failed: number }> {
    const now = new Date();

    const pendingMessages = await db.query.scheduledMessages.findMany({
      where: and(
        eq(schema.scheduledMessages.status, 'PENDING'),
        lte(schema.scheduledMessages.scheduledFor, now),
      ),
      limit: 50,
    });

    let sent = 0;
    let failed = 0;

    for (const scheduled of pendingMessages) {
      try {
        // Busca dados necessários
        const [template, client, appointment, salon] = await Promise.all([
          db.query.messageTemplates.findFirst({
            where: eq(schema.messageTemplates.id, scheduled.templateId),
          }),
          db.query.clients.findFirst({
            where: eq(schema.clients.id, scheduled.clientId),
          }),
          scheduled.appointmentId
            ? db.query.appointments.findFirst({
                where: eq(schema.appointments.id, scheduled.appointmentId),
              })
            : null,
          db.query.salons.findFirst({
            where: eq(schema.salons.id, scheduled.salonId),
          }),
        ]);

        if (!template || !client || !client.phone) {
          await this.markAsFailed(scheduled.id, 'Dados incompletos');
          failed++;
          continue;
        }

        // Monta variáveis
        const variables: TemplateVariables = {
          nome: client.name || undefined,
          salonNome: salon?.name || undefined,
          salonTelefone: salon?.phone || undefined,
        };

        if (appointment) {
          variables.data = appointment.date;
          variables.horario = appointment.time;

          // Busca serviço e profissional
          const [service, professional] = await Promise.all([
            appointment.serviceId
              ? db.query.services.findFirst({
                  where: eq(schema.services.id, appointment.serviceId),
                })
              : null,
            appointment.professionalId
              ? db.query.users.findFirst({
                  where: eq(schema.users.id, appointment.professionalId),
                })
              : null,
          ]);

          variables.servico = service?.name;
          variables.profissional = professional?.name;
        }

        // Substitui variáveis no conteúdo
        const content = this.replaceVariables(template.content, variables);

        // Envia mensagem
        const result = await this.sendMessage(
          scheduled.salonId,
          client.phone,
          content,
          scheduled.channel as MessageChannel,
        );

        if (result.success) {
          // Registra log
          await db.insert(schema.messageLogs).values({
            salonId: scheduled.salonId,
            templateId: template.id,
            clientId: client.id,
            appointmentId: scheduled.appointmentId,
            channel: scheduled.channel,
            phoneNumber: client.phone,
            content,
            status: 'SENT',
            externalId: result.messageId,
            sentAt: new Date(),
          });

          // Marca como enviada
          await db
            .update(schema.scheduledMessages)
            .set({ status: 'SENT' })
            .where(eq(schema.scheduledMessages.id, scheduled.id));

          sent++;
        } else {
          await this.markAsFailed(scheduled.id, result.error || 'Erro desconhecido');

          await db.insert(schema.messageLogs).values({
            salonId: scheduled.salonId,
            templateId: template.id,
            clientId: client.id,
            appointmentId: scheduled.appointmentId,
            channel: scheduled.channel,
            phoneNumber: client.phone,
            content,
            status: 'FAILED',
            errorMessage: result.error,
          });

          failed++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        await this.markAsFailed(scheduled.id, errorMessage);
        failed++;
      }
    }

    return { processed: pendingMessages.length, sent, failed };
  }

  /**
   * Cancela mensagens de um agendamento
   */
  async cancelScheduledMessages(appointmentId: string, reason?: string): Promise<number> {
    const result = await db
      .update(schema.scheduledMessages)
      .set({
        status: 'CANCELLED',
        cancelledReason: reason || 'Agendamento cancelado',
      })
      .where(
        and(
          eq(schema.scheduledMessages.appointmentId, appointmentId),
          eq(schema.scheduledMessages.status, 'PENDING'),
        ),
      );

    return (result as unknown as { rowCount?: number }).rowCount || 0;
  }

  /**
   * Envia mensagem de boas-vindas para novo cliente
   */
  async sendWelcomeMessage(salonId: string, clientId: string): Promise<void> {
    const settings = await this.getSettings(salonId);
    if (!settings) return;

    const template = await db.query.messageTemplates.findFirst({
      where: and(
        eq(schema.messageTemplates.salonId, salonId),
        eq(schema.messageTemplates.type, 'WELCOME'),
        eq(schema.messageTemplates.isActive, true),
      ),
    });

    if (!template) return;

    const [client, salon] = await Promise.all([
      db.query.clients.findFirst({ where: eq(schema.clients.id, clientId) }),
      db.query.salons.findFirst({ where: eq(schema.salons.id, salonId) }),
    ]);

    if (!client || !client.phone) return;

    const content = this.replaceVariables(template.content, {
      nome: client.name || undefined,
      salonNome: salon?.name || undefined,
      salonTelefone: salon?.phone || undefined,
    });

    const channel = this.determineChannel(template.channel, settings);
    const result = await this.sendMessage(salonId, client.phone, content, channel as MessageChannel);

    await db.insert(schema.messageLogs).values({
      salonId,
      templateId: template.id,
      clientId,
      channel,
      phoneNumber: client.phone,
      content,
      status: result.success ? 'SENT' : 'FAILED',
      externalId: result.messageId,
      errorMessage: result.error,
      sentAt: result.success ? new Date() : null,
    });
  }

  // ==================== PRIVATE METHODS ====================

  private async getSettings(salonId: string) {
    return db.query.automationSettings.findFirst({
      where: eq(schema.automationSettings.salonId, salonId),
    });
  }

  private determineChannel(
    templateChannel: string,
    settings: schema.AutomationSetting,
  ): 'WHATSAPP' | 'SMS' {
    if (templateChannel === 'WHATSAPP' && settings.whatsappEnabled) {
      return 'WHATSAPP';
    }
    if (templateChannel === 'SMS' && settings.smsEnabled) {
      return 'SMS';
    }
    if (templateChannel === 'BOTH') {
      if (settings.whatsappEnabled) return 'WHATSAPP';
      if (settings.smsEnabled) return 'SMS';
    }
    return 'WHATSAPP';
  }

  private async sendMessage(
    salonId: string,
    phone: string,
    content: string,
    channel: MessageChannel,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (channel === 'WHATSAPP' || channel === 'BOTH') {
      const result = await this.whatsappService.sendMessage(salonId, phone, content);
      if (result.success) return result;

      // Fallback para SMS se WhatsApp falhar e canal for BOTH
      if (channel === 'BOTH') {
        return this.smsService.sendSMS(salonId, phone, content);
      }

      return result;
    }

    return this.smsService.sendSMS(salonId, phone, content);
  }

  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });

    // Remove variáveis não substituídas
    result = result.replace(/\{\{[^}]+\}\}/g, '');

    return result.trim();
  }

  private async markAsFailed(id: string, reason: string): Promise<void> {
    await db
      .update(schema.scheduledMessages)
      .set({
        status: 'CANCELLED',
        cancelledReason: `Falha: ${reason}`,
      })
      .where(eq(schema.scheduledMessages.id, id));
  }
}

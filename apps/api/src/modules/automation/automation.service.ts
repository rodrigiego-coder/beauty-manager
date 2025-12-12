import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { WhatsAppService } from './whatsapp.service';
import { SMSService } from './sms.service';
import {
  UpdateAutomationSettingsDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  SendMessageDto,
  MessageLogFiltersDto,
  AutomationSettingsResponse,
  MessageStats,
  MessageChannel,
} from './dto';

/**
 * AutomationService
 * Main service for automation settings and template management
 */
@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly smsService: SMSService,
  ) {}

  // ==================== SETTINGS ====================

  /**
   * Retorna configurações de automação do salão
   */
  async getSettings(salonId: string): Promise<AutomationSettingsResponse> {
    let settings = await db.query.automationSettings.findFirst({
      where: eq(schema.automationSettings.salonId, salonId),
    });

    if (!settings) {
      // Cria configurações padrão
      const result = await db
        .insert(schema.automationSettings)
        .values({ salonId })
        .returning();
      settings = result[0];
    }

    // Testa conexões
    const [whatsappConnection, smsConnection, smsBalance] = await Promise.all([
      settings.whatsappEnabled
        ? this.whatsappService.testConnection(salonId)
        : { connected: false },
      settings.smsEnabled ? this.smsService.testConnection(salonId) : { connected: false },
      settings.smsEnabled ? this.smsService.getBalance(salonId) : null,
    ]);

    return {
      id: settings.id,
      salonId: settings.salonId,
      whatsappEnabled: settings.whatsappEnabled,
      whatsappProvider: settings.whatsappProvider as AutomationSettingsResponse['whatsappProvider'],
      whatsappConnected: whatsappConnection.connected,
      smsEnabled: settings.smsEnabled,
      smsProvider: settings.smsProvider as AutomationSettingsResponse['smsProvider'],
      smsConnected: smsConnection.connected,
      smsBalance: smsBalance?.balance,
      reminderEnabled: settings.reminderEnabled,
      reminderHoursBefore: settings.reminderHoursBefore,
      confirmationEnabled: settings.confirmationEnabled,
      confirmationHoursBefore: settings.confirmationHoursBefore,
      birthdayEnabled: settings.birthdayEnabled,
      birthdayTime: settings.birthdayTime,
      birthdayDiscountPercent: settings.birthdayDiscountPercent ?? undefined,
      reviewRequestEnabled: settings.reviewRequestEnabled,
      reviewRequestHoursAfter: settings.reviewRequestHoursAfter,
    };
  }

  /**
   * Atualiza configurações de automação
   */
  async updateSettings(
    salonId: string,
    dto: UpdateAutomationSettingsDto,
  ): Promise<AutomationSettingsResponse> {
    const existing = await db.query.automationSettings.findFirst({
      where: eq(schema.automationSettings.salonId, salonId),
    });

    if (existing) {
      await db
        .update(schema.automationSettings)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(schema.automationSettings.salonId, salonId));
    } else {
      await db.insert(schema.automationSettings).values({ salonId, ...dto });
    }

    return this.getSettings(salonId);
  }

  // ==================== TEMPLATES ====================

  /**
   * Lista templates do salão
   */
  async getTemplates(salonId: string): Promise<schema.MessageTemplate[]> {
    return db.query.messageTemplates.findMany({
      where: eq(schema.messageTemplates.salonId, salonId),
      orderBy: [desc(schema.messageTemplates.createdAt)],
    });
  }

  /**
   * Busca template por ID
   */
  async getTemplateById(id: string, salonId: string): Promise<schema.MessageTemplate> {
    const template = await db.query.messageTemplates.findFirst({
      where: and(
        eq(schema.messageTemplates.id, id),
        eq(schema.messageTemplates.salonId, salonId),
      ),
    });

    if (!template) {
      throw new NotFoundException('Template não encontrado.');
    }

    return template;
  }

  /**
   * Cria novo template
   */
  async createTemplate(salonId: string, dto: CreateTemplateDto): Promise<schema.MessageTemplate> {
    // Se for default, desativa outros defaults do mesmo tipo
    if (dto.isDefault) {
      await db
        .update(schema.messageTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(schema.messageTemplates.salonId, salonId),
            eq(schema.messageTemplates.type, dto.type),
          ),
        );
    }

    const result = await db
      .insert(schema.messageTemplates)
      .values({
        salonId,
        ...dto,
      })
      .returning();

    this.logger.log(`Template criado: ${result[0].id}`);
    return result[0];
  }

  /**
   * Atualiza template
   */
  async updateTemplate(
    id: string,
    salonId: string,
    dto: UpdateTemplateDto,
  ): Promise<schema.MessageTemplate> {
    const template = await this.getTemplateById(id, salonId);

    // Se tornando default, desativa outros
    if (dto.isDefault && !template.isDefault) {
      const type = dto.type || template.type;
      await db
        .update(schema.messageTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(schema.messageTemplates.salonId, salonId),
            eq(schema.messageTemplates.type, type),
          ),
        );
    }

    const result = await db
      .update(schema.messageTemplates)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(schema.messageTemplates.id, id))
      .returning();

    return result[0];
  }

  /**
   * Remove template
   */
  async deleteTemplate(id: string, salonId: string): Promise<void> {
    // Verifica se o template existe
    await this.getTemplateById(id, salonId);

    // Verifica se tem mensagens agendadas
    const scheduled = await db.query.scheduledMessages.findFirst({
      where: and(
        eq(schema.scheduledMessages.templateId, id),
        eq(schema.scheduledMessages.status, 'PENDING'),
      ),
    });

    if (scheduled) {
      throw new BadRequestException(
        'Não é possível excluir template com mensagens agendadas pendentes.',
      );
    }

    await db
      .delete(schema.messageTemplates)
      .where(eq(schema.messageTemplates.id, id));

    this.logger.log(`Template excluído: ${id}`);
  }

  /**
   * Cria templates padrão para o salão
   */
  async createDefaultTemplates(salonId: string): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Lembrete de Agendamento',
        type: 'APPOINTMENT_REMINDER' as const,
        channel: 'WHATSAPP' as const,
        content:
          'Olá {{nome}}! Lembrete: você tem um agendamento amanhã, dia {{data}} às {{horario}} para {{servico}} com {{profissional}}. Confirme sua presença! {{salonNome}}',
        isDefault: true,
        triggerHoursBefore: 24,
      },
      {
        name: 'Confirmação de Presença',
        type: 'APPOINTMENT_CONFIRMATION' as const,
        channel: 'WHATSAPP' as const,
        content:
          'Olá {{nome}}! Confirme sua presença para o dia {{data}} às {{horario}}. Responda SIM para confirmar ou NÃO para cancelar. {{salonNome}}',
        isDefault: true,
        triggerHoursBefore: 48,
      },
      {
        name: 'Aniversário',
        type: 'BIRTHDAY' as const,
        channel: 'WHATSAPP' as const,
        content:
          'Feliz aniversário, {{nome}}! A equipe do {{salonNome}} deseja um dia incrível! Venha nos visitar e ganhe um desconto especial!',
        isDefault: true,
      },
      {
        name: 'Boas-vindas',
        type: 'WELCOME' as const,
        channel: 'WHATSAPP' as const,
        content:
          'Olá {{nome}}! Seja bem-vindo(a) ao {{salonNome}}! Estamos felizes em ter você conosco. Agende seu próximo horário pelo nosso app ou ligue: {{salonTelefone}}',
        isDefault: true,
      },
      {
        name: 'Avaliação',
        type: 'REVIEW_REQUEST' as const,
        channel: 'WHATSAPP' as const,
        content:
          'Olá {{nome}}! Como foi sua experiência conosco? Sua opinião é muito importante! Deixe sua avaliação: {{linkConfirmacao}}',
        isDefault: true,
      },
    ];

    for (const template of defaultTemplates) {
      const existing = await db.query.messageTemplates.findFirst({
        where: and(
          eq(schema.messageTemplates.salonId, salonId),
          eq(schema.messageTemplates.type, template.type),
        ),
      });

      if (!existing) {
        await db.insert(schema.messageTemplates).values({ salonId, ...template });
      }
    }
  }

  // ==================== MESSAGES ====================

  /**
   * Envia mensagem manual
   */
  async sendMessage(salonId: string, dto: SendMessageDto): Promise<schema.MessageLog> {
    const settings = await db.query.automationSettings.findFirst({
      where: eq(schema.automationSettings.salonId, salonId),
    });

    if (!settings) {
      throw new BadRequestException('Automação não configurada.');
    }

    // Valida template se informado
    if (dto.templateId) {
      await this.getTemplateById(dto.templateId, salonId);
    }

    // Envia mensagem
    let result: { success: boolean; messageId?: string; error?: string; cost?: number };

    if (dto.channel === 'WHATSAPP' || dto.channel === 'BOTH') {
      result = await this.whatsappService.sendMessage(salonId, dto.phoneNumber, dto.content);

      if (!result.success && dto.channel === 'BOTH') {
        result = await this.smsService.sendSMS(salonId, dto.phoneNumber, dto.content);
      }
    } else {
      result = await this.smsService.sendSMS(salonId, dto.phoneNumber, dto.content);
    }

    // Registra log
    const [log] = await db
      .insert(schema.messageLogs)
      .values({
        salonId,
        templateId: dto.templateId,
        clientId: dto.clientId,
        appointmentId: dto.appointmentId,
        channel: dto.channel === 'BOTH' ? (result.success ? 'WHATSAPP' : 'SMS') : dto.channel,
        phoneNumber: dto.phoneNumber,
        content: dto.content,
        status: result.success ? 'SENT' : 'FAILED',
        externalId: result.messageId,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : null,
        cost: result.cost?.toString(),
      })
      .returning();

    return log;
  }

  /**
   * Envia mensagem de teste
   */
  async sendTestMessage(
    salonId: string,
    channel: MessageChannel,
    phoneNumber: string,
  ): Promise<{ success: boolean; error?: string }> {
    const testContent =
      'Esta é uma mensagem de teste do Beauty Manager. Se você recebeu esta mensagem, a configuração está correta!';

    if (channel === 'WHATSAPP') {
      return this.whatsappService.sendMessage(salonId, phoneNumber, testContent);
    }

    return this.smsService.sendSMS(salonId, phoneNumber, testContent);
  }

  // ==================== LOGS & STATS ====================

  /**
   * Lista histórico de mensagens
   */
  async getMessageLogs(
    salonId: string,
    filters: MessageLogFiltersDto,
  ): Promise<{ logs: schema.MessageLog[]; total: number }> {
    const conditions = [eq(schema.messageLogs.salonId, salonId)];

    if (filters.status) {
      conditions.push(eq(schema.messageLogs.status, filters.status));
    }

    if (filters.channel) {
      conditions.push(eq(schema.messageLogs.channel, filters.channel));
    }

    if (filters.clientId) {
      conditions.push(eq(schema.messageLogs.clientId, filters.clientId));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.messageLogs.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.messageLogs.createdAt, new Date(filters.endDate)));
    }

    const [logs, countResult] = await Promise.all([
      db.query.messageLogs.findMany({
        where: and(...conditions),
        orderBy: [desc(schema.messageLogs.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.messageLogs)
        .where(and(...conditions)),
    ]);

    return {
      logs,
      total: countResult[0]?.count || 0,
    };
  }

  /**
   * Retorna estatísticas de mensagens
   */
  async getStats(salonId: string, days: number = 30): Promise<MessageStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db.query.messageLogs.findMany({
      where: and(
        eq(schema.messageLogs.salonId, salonId),
        gte(schema.messageLogs.createdAt, startDate),
      ),
    });

    const stats: MessageStats = {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalFailed: 0,
      deliveryRate: 0,
      readRate: 0,
      totalCost: 0,
      byChannel: {
        whatsapp: { sent: 0, delivered: 0, read: 0, failed: 0 },
        sms: { sent: 0, delivered: 0, cost: 0, failed: 0 },
      },
      byType: {
        reminder: 0,
        confirmation: 0,
        birthday: 0,
        custom: 0,
      },
    };

    for (const log of logs) {
      if (log.status === 'SENT' || log.status === 'DELIVERED' || log.status === 'READ') {
        stats.totalSent++;
        if (log.channel === 'WHATSAPP') {
          stats.byChannel.whatsapp.sent++;
        } else {
          stats.byChannel.sms.sent++;
        }
      }

      if (log.status === 'DELIVERED' || log.status === 'READ') {
        stats.totalDelivered++;
        if (log.channel === 'WHATSAPP') {
          stats.byChannel.whatsapp.delivered++;
        } else {
          stats.byChannel.sms.delivered++;
        }
      }

      if (log.status === 'READ') {
        stats.totalRead++;
        if (log.channel === 'WHATSAPP') {
          stats.byChannel.whatsapp.read++;
        }
      }

      if (log.status === 'FAILED') {
        stats.totalFailed++;
        if (log.channel === 'WHATSAPP') {
          stats.byChannel.whatsapp.failed++;
        } else {
          stats.byChannel.sms.failed++;
        }
      }

      if (log.cost) {
        const cost = parseFloat(log.cost);
        stats.totalCost += cost;
        if (log.channel === 'SMS') {
          stats.byChannel.sms.cost += cost;
        }
      }
    }

    // Calcula taxas
    if (stats.totalSent > 0) {
      stats.deliveryRate = (stats.totalDelivered / stats.totalSent) * 100;
      stats.readRate = (stats.totalRead / stats.totalSent) * 100;
    }

    // Busca contagem por tipo de template
    const templateIds = [...new Set(logs.filter((l) => l.templateId).map((l) => l.templateId!))];

    for (const templateId of templateIds) {
      const template = await db.query.messageTemplates.findFirst({
        where: eq(schema.messageTemplates.id, templateId),
      });

      if (template) {
        const count = logs.filter((l) => l.templateId === templateId).length;

        switch (template.type) {
          case 'APPOINTMENT_REMINDER':
            stats.byType.reminder += count;
            break;
          case 'APPOINTMENT_CONFIRMATION':
            stats.byType.confirmation += count;
            break;
          case 'BIRTHDAY':
            stats.byType.birthday += count;
            break;
          default:
            stats.byType.custom += count;
        }
      }
    }

    return stats;
  }

  // ==================== WEBHOOKS ====================

  /**
   * Processa webhook do WhatsApp
   */
  async processWhatsAppWebhook(body: {
    entry?: Array<{
      changes?: Array<{
        value?: {
          statuses?: Array<{
            id: string;
            status: string;
            timestamp: string;
          }>;
        };
      }>;
    }>;
  }): Promise<void> {
    const statuses = body.entry?.[0]?.changes?.[0]?.value?.statuses;

    if (!statuses) return;

    for (const status of statuses) {
      const log = await db.query.messageLogs.findFirst({
        where: eq(schema.messageLogs.externalId, status.id),
      });

      if (!log) continue;

      const updates: Partial<schema.MessageLog> = {};
      const timestamp = new Date(parseInt(status.timestamp) * 1000);

      switch (status.status) {
        case 'sent':
          updates.status = 'SENT';
          updates.sentAt = timestamp;
          break;
        case 'delivered':
          updates.status = 'DELIVERED';
          updates.deliveredAt = timestamp;
          break;
        case 'read':
          updates.status = 'READ';
          updates.readAt = timestamp;
          break;
        case 'failed':
          updates.status = 'FAILED';
          break;
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(schema.messageLogs)
          .set(updates)
          .where(eq(schema.messageLogs.id, log.id));
      }
    }
  }

  /**
   * Processa webhook do Twilio
   */
  async processTwilioWebhook(body: {
    MessageSid?: string;
    MessageStatus?: string;
  }): Promise<void> {
    if (!body.MessageSid || !body.MessageStatus) return;

    const log = await db.query.messageLogs.findFirst({
      where: eq(schema.messageLogs.externalId, body.MessageSid),
    });

    if (!log) return;

    const statusMap: Record<string, string> = {
      queued: 'PENDING',
      sent: 'SENT',
      delivered: 'DELIVERED',
      failed: 'FAILED',
      undelivered: 'FAILED',
    };

    const newStatus = statusMap[body.MessageStatus.toLowerCase()];

    if (newStatus) {
      const updates: Partial<schema.MessageLog> = {
        status: newStatus as schema.MessageLog['status'],
      };

      if (newStatus === 'DELIVERED') {
        updates.deliveredAt = new Date();
      }

      await db
        .update(schema.messageLogs)
        .set(updates)
        .where(eq(schema.messageLogs.id, log.id));
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IS_JEST } from '../../common/is-jest';
import { MessageSchedulerService } from './message-scheduler.service';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';

/**
 * AutomationJobs
 * CRON jobs para processamento de mensagens automáticas
 */
@Injectable()
export class AutomationJobs {
  private readonly logger = new Logger(AutomationJobs.name);

  constructor(private readonly schedulerService: MessageSchedulerService) {}

  /**
   * Processa mensagens agendadas a cada 5 minutos
   * NOTA: Este job processa a tabela scheduled_messages (sistema legado de templates)
   * Para notificações de agendamento, use ScheduledMessagesProcessor que processa appointment_notifications
   */
  @Cron(CronExpression.EVERY_5_MINUTES, { disabled: IS_JEST })
  async processScheduledMessages() {
    this.logger.debug('[scheduled_messages] Processando mensagens do sistema legado...');

    try {
      const result = await this.schedulerService.processScheduledMessages();

      // Só loga se processou algo
      if (result.processed > 0) {
        this.logger.log(
          `[scheduled_messages] Processadas: ${result.processed}, enviadas: ${result.sent}, falhas: ${result.failed}`,
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`[scheduled_messages] Erro: ${errorMessage}`);
    }
  }

  /**
   * Agenda mensagens de aniversário diariamente às 06:00
   */
  @Cron('0 6 * * *', { disabled: IS_JEST })
  async scheduleBirthdayMessages() {
    this.logger.log('Agendando mensagens de aniversário...');

    try {
      const count = await this.schedulerService.scheduleBirthdayMessages();
      this.logger.log(`${count} mensagens de aniversário agendadas`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao agendar aniversários: ${errorMessage}`);
    }
  }

  /**
   * Limpa logs antigos mensalmente (primeiro dia às 03:00)
   */
  @Cron('0 3 1 * *', { disabled: IS_JEST })
  async cleanupOldLogs() {
    this.logger.log('Limpando logs de mensagens antigos...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Remove logs com mais de 30 dias
      await db
        .delete(schema.messageLogs)
        .where(lte(schema.messageLogs.createdAt, thirtyDaysAgo));

      this.logger.log(`Logs antigos removidos com sucesso`);

      // Remove mensagens agendadas processadas com mais de 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      await db
        .delete(schema.scheduledMessages)
        .where(
          and(
            lte(schema.scheduledMessages.createdAt, sevenDaysAgo),
            sql`${schema.scheduledMessages.status} != 'PENDING'`,
          ),
        );

      this.logger.log(`Mensagens agendadas antigas removidas com sucesso`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao limpar logs: ${errorMessage}`);
    }
  }

  /**
   * Verifica e reagenda mensagens falhas às 09:00
   */
  @Cron('0 9 * * *', { disabled: IS_JEST })
  async retryFailedMessages() {
    this.logger.log('Verificando mensagens falhas para reenvio...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Busca mensagens falhas das últimas 24h
      const failedMessages = await db.query.messageLogs.findMany({
        where: and(
          eq(schema.messageLogs.status, 'FAILED'),
          gte(schema.messageLogs.createdAt, yesterday),
        ),
        limit: 50,
      });

      this.logger.log(`${failedMessages.length} mensagens falhas encontradas`);

      // Para cada mensagem falha, cria uma nova tentativa
      let retried = 0;
      for (const log of failedMessages) {
        // Verifica se não é uma mensagem de teste ou manual
        if (!log.templateId || !log.clientId) continue;

        // Verifica se não existe retry pendente
        const existing = await db.query.scheduledMessages.findFirst({
          where: and(
            eq(schema.scheduledMessages.clientId, log.clientId),
            eq(schema.scheduledMessages.templateId, log.templateId),
            eq(schema.scheduledMessages.status, 'PENDING'),
          ),
        });

        if (existing) continue;

        // Agenda reenvio para daqui 1 hora
        const scheduledFor = new Date();
        scheduledFor.setHours(scheduledFor.getHours() + 1);

        await db.insert(schema.scheduledMessages).values({
          salonId: log.salonId,
          templateId: log.templateId,
          clientId: log.clientId,
          appointmentId: log.appointmentId,
          channel: log.channel,
          scheduledFor,
        });

        retried++;
      }

      this.logger.log(`${retried} mensagens reagendadas para reenvio`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao reagendar mensagens: ${errorMessage}`);
    }
  }

  /**
   * Gera relatório semanal de automação (Segunda às 08:00)
   */
  @Cron('0 8 * * 1', { disabled: IS_JEST })
  async generateWeeklyReport() {
    this.logger.log('Gerando relatório semanal de automação...');

    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Busca estatísticas da semana por salão
      const salons = await db.query.salons.findMany();

      for (const salon of salons) {
        const logs = await db.query.messageLogs.findMany({
          where: and(
            eq(schema.messageLogs.salonId, salon.id),
            gte(schema.messageLogs.createdAt, weekAgo),
          ),
        });

        if (logs.length === 0) continue;

        const sent = logs.filter(
          (l) => l.status === 'SENT' || l.status === 'DELIVERED' || l.status === 'READ',
        ).length;
        const delivered = logs.filter(
          (l) => l.status === 'DELIVERED' || l.status === 'READ',
        ).length;
        const failed = logs.filter((l) => l.status === 'FAILED').length;

        this.logger.log(
          `Salão ${salon.name}: ${sent} enviadas, ${delivered} entregues, ${failed} falhas`,
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao gerar relatório: ${errorMessage}`);
    }
  }
}

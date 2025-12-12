import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { LoyaltyService } from './loyalty.service';

@Injectable()
export class LoyaltyJobs {
  private readonly logger = new Logger(LoyaltyJobs.name);

  constructor(private readonly loyaltyService: LoyaltyService) {}

  /**
   * Processa pontos expirados diariamente às 2AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processExpiredPoints() {
    this.logger.log('Iniciando processamento de pontos expirados...');

    try {
      // Get all salons with active loyalty programs
      const programs = await db
        .select()
        .from(schema.loyaltyPrograms)
        .where(eq(schema.loyaltyPrograms.isActive, true));

      let totalExpired = 0;
      for (const program of programs) {
        const expired = await this.loyaltyService.processExpiredPoints(program.salonId);
        totalExpired += expired;
      }

      this.logger.log(`Processamento de pontos expirados concluído. Total: ${totalExpired} transações expiradas.`);
    } catch (error) {
      this.logger.error('Erro ao processar pontos expirados:', error);
    }
  }

  /**
   * Processa pontos de aniversário diariamente às 8AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async processBirthdayPoints() {
    this.logger.log('Iniciando processamento de pontos de aniversário...');

    try {
      // Get all salons with active loyalty programs
      const programs = await db
        .select()
        .from(schema.loyaltyPrograms)
        .where(eq(schema.loyaltyPrograms.isActive, true));

      let totalProcessed = 0;
      for (const program of programs) {
        const processed = await this.loyaltyService.processBirthdayPoints(program.salonId);
        totalProcessed += processed;
      }

      this.logger.log(`Processamento de aniversários concluído. Total: ${totalProcessed} clientes receberam pontos.`);
    } catch (error) {
      this.logger.error('Erro ao processar pontos de aniversário:', error);
    }
  }

  /**
   * Processa vouchers expirados diariamente às 3AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async processExpiredVouchers() {
    this.logger.log('Iniciando processamento de vouchers expirados...');

    try {
      // Update expired vouchers using raw SQL for complex WHERE
      await db.execute(sql`
        UPDATE loyalty_redemptions
        SET status = 'EXPIRED'
        WHERE status = 'PENDING' AND expires_at < NOW()
      `);

      this.logger.log('Processamento de vouchers expirados concluído.');
    } catch (error) {
      this.logger.error('Erro ao processar vouchers expirados:', error);
    }
  }

  /**
   * Gera relatório semanal (toda segunda às 7AM)
   */
  @Cron('0 7 * * 1')
  async generateWeeklyReport() {
    this.logger.log('Gerando relatório semanal de fidelidade...');

    try {
      // Get all salons with active loyalty programs
      const programs = await db
        .select()
        .from(schema.loyaltyPrograms)
        .where(eq(schema.loyaltyPrograms.isActive, true));

      for (const program of programs) {
        const stats = await this.loyaltyService.getStats(program.salonId);
        this.logger.log(`Relatório ${program.salonId}: ${stats.totalEnrolledClients} clientes, ${stats.pointsInCirculation} pontos em circulação`);
      }

      this.logger.log('Relatório semanal de fidelidade gerado.');
    } catch (error) {
      this.logger.error('Erro ao gerar relatório semanal:', error);
    }
  }
}

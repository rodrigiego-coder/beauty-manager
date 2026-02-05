import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IS_JEST } from '../common/is-jest';
import { PackageIntelligenceService } from '../modules/alexis/package-intelligence.service';

/**
 * =====================================================
 * PACKAGE MONITOR JOB
 * Scheduled tasks for package session alerts
 * =====================================================
 */

// Batch size para processamento (4GB RAM)
const BATCH_SIZE = 50;

@Injectable()
export class PackageMonitorJob {
  private readonly logger = new Logger(PackageMonitorJob.name);
  private isProcessing = false;

  constructor(
    private readonly packageIntelligence: PackageIntelligenceService,
  ) {
    this.logger.log('PackageMonitorJob initialized');
  }

  /**
   * Verifica sessões pendentes toda segunda-feira às 10h
   * Envia lembretes para clientes com sessões não agendadas
   */
  @Cron('0 10 * * 1', { disabled: IS_JEST }) // Monday 10:00 AM
  async checkPendingSessions(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug('Job already processing, skipping...');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting pending sessions check...');

    try {
      let processedCount = 0;
      let sentCount = 0;
      let errorCount = 0;

      // Processa em batches para controle de memória
      let hasMore = true;

      while (hasMore) {
        // Busca pacotes com sessões pendentes
        const packagesWithPending = await this.packageIntelligence.getPackagesWithPendingSessions(BATCH_SIZE);

        if (packagesWithPending.length === 0) {
          hasMore = false;
          continue;
        }

        this.logger.log(`Processing batch of ${packagesWithPending.length} packages`);

        for (const pkg of packagesWithPending) {
          try {
            // Verifica se tem telefone
            if (!pkg.clientPhone) {
              this.logger.debug(`Package ${pkg.id} has no phone, skipping`);
              continue;
            }

            const pendingSessions = pkg.remainingSessions - pkg.scheduledSessions;

            // Agenda alerta
            await this.packageIntelligence.schedulePendingSessionsAlert(
              pkg.salonId,
              pkg.id,
              pkg.clientPhone,
              pkg.clientName,
              pkg.packageName,
              pendingSessions,
              pkg.expirationDate,
            );

            sentCount++;
          } catch (error: any) {
            this.logger.error(`Error processing package ${pkg.id}: ${error.message}`);
            errorCount++;
          }

          processedCount++;
        }

        // Se retornou menos que o batch size, não há mais
        if (packagesWithPending.length < BATCH_SIZE) {
          hasMore = false;
        }

        // Cleanup: libera referências do batch anterior
        packagesWithPending.length = 0;
      }

      this.logger.log(
        `Pending sessions check completed: ${processedCount} processed, ${sentCount} sent, ${errorCount} errors`,
      );
    } catch (error) {
      this.logger.error('Pending sessions check failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Verifica pacotes expirando em 7 dias - toda quarta às 10h
   * Envia aviso de urgência para agendar
   */
  @Cron('0 10 * * 3', { disabled: IS_JEST }) // Wednesday 10:00 AM
  async checkExpiringPackages(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug('Job already processing, skipping...');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting expiring packages check...');

    try {
      // Implementação futura: alerta de pacotes expirando
      // Por ora, apenas log para monitoramento
      this.logger.log('Expiring packages check completed (placeholder)');
    } catch (error) {
      this.logger.error('Expiring packages check failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

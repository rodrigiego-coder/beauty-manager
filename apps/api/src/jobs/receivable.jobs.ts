import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IS_JEST } from '../common/is-jest';
import { AccountsReceivableService } from '../modules/accounts-receivable/accounts-receivable.service';

/**
 * ReceivableJobs
 * Scheduled tasks for accounts receivable management
 */
@Injectable()
export class ReceivableJobs {
  private readonly logger = new Logger(ReceivableJobs.name);

  constructor(private accountsReceivableService: AccountsReceivableService) {}

  /**
   * Mark overdue accounts daily at 6:00 AM
   * Checks accounts with status OPEN and due_date < today
   * Updates status to OVERDUE
   */
  @Cron('0 6 * * *', { disabled: IS_JEST }) // 6:00 AM daily
  async markOverdueAccounts(): Promise<void> {
    this.logger.log('Starting overdue accounts check...');

    try {
      const count = await this.accountsReceivableService.markOverdueAccounts();

      if (count > 0) {
        this.logger.log(`${count} contas marcadas como vencidas`);
      } else {
        this.logger.log('Nenhuma conta vencida encontrada');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to mark overdue accounts: ${errorMessage}`);
    }
  }
}

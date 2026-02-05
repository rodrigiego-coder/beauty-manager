import { Module } from '@nestjs/common';
import { SubscriptionJobs } from './subscription.jobs';
import { CalendarSyncJob } from './calendar.jobs';
import { PackageMonitorJob } from './package-monitor.jobs';
import { ReceivableJobs } from './receivable.jobs';
import { AiCostReportJobs } from './ai-cost-report.jobs';
import { GoogleCalendarModule } from '../modules/google-calendar';
import { AlexisModule } from '../modules/alexis/alexis.module';
import { AccountsReceivableModule } from '../modules/accounts-receivable/accounts-receivable.module';

@Module({
  imports: [GoogleCalendarModule, AlexisModule, AccountsReceivableModule],
  providers: [SubscriptionJobs, CalendarSyncJob, PackageMonitorJob, ReceivableJobs, AiCostReportJobs],
  exports: [SubscriptionJobs, CalendarSyncJob, PackageMonitorJob, ReceivableJobs, AiCostReportJobs],
})
export class JobsModule {}

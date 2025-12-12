import { Module } from '@nestjs/common';
import { SubscriptionJobs } from './subscription.jobs';
import { CalendarSyncJob } from './calendar.jobs';

@Module({
  providers: [SubscriptionJobs, CalendarSyncJob],
  exports: [SubscriptionJobs, CalendarSyncJob],
})
export class JobsModule {}

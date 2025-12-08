import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionGuard } from './subscription.guard';

@Module({
  imports: [DatabaseModule],
  providers: [SubscriptionsService, SubscriptionGuard],
  exports: [SubscriptionsService, SubscriptionGuard],
})
export class SubscriptionsModule {}
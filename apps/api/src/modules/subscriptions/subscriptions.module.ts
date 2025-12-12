import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SalonSubscriptionsService } from './salon-subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionGuard } from './subscription.guard';
import { PlansModule } from '../plans';

@Module({
  imports: [DatabaseModule, forwardRef(() => PlansModule)],
  controllers: [SubscriptionsController],
  providers: [SalonSubscriptionsService, SubscriptionGuard],
  exports: [SalonSubscriptionsService, SubscriptionGuard],
})
export class SubscriptionsModule {}

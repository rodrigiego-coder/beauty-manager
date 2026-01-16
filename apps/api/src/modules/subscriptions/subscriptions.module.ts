import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SalonSubscriptionsService } from './salon-subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionGuard } from './subscription.guard';
import { PlansModule } from '../plans';
import { AddonsService } from './addons.service';
import { AddonsController, CreditsController } from './addons.controller';

@Module({
  imports: [DatabaseModule, forwardRef(() => PlansModule)],
  controllers: [SubscriptionsController, AddonsController, CreditsController],
  providers: [SalonSubscriptionsService, SubscriptionGuard, AddonsService],
  exports: [SalonSubscriptionsService, SubscriptionGuard, AddonsService],
})
export class SubscriptionsModule {}

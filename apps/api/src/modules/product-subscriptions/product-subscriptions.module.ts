import { Module } from '@nestjs/common';
import { ProductSubscriptionsController } from './product-subscriptions.controller';
import { ProductSubscriptionsService } from './product-subscriptions.service';
import { ProductSubscriptionsJobs } from './product-subscriptions.jobs';

@Module({
  controllers: [ProductSubscriptionsController],
  providers: [ProductSubscriptionsService, ProductSubscriptionsJobs],
  exports: [ProductSubscriptionsService],
})
export class ProductSubscriptionsModule {}

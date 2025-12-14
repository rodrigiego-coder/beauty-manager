import { Module } from '@nestjs/common';
import { PaymentDestinationsController } from './payment-destinations.controller';
import { PaymentDestinationsService } from './payment-destinations.service';

@Module({
  controllers: [PaymentDestinationsController],
  providers: [PaymentDestinationsService],
  exports: [PaymentDestinationsService],
})
export class PaymentDestinationsModule {}

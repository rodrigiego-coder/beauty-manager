import { Module } from '@nestjs/common';
import { ServiceConsumptionsController } from './service-consumptions.controller';
import { ServiceConsumptionsService } from './service-consumptions.service';

@Module({
  controllers: [ServiceConsumptionsController],
  providers: [ServiceConsumptionsService],
  exports: [ServiceConsumptionsService],
})
export class ServiceConsumptionsModule {}

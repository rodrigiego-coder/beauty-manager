import { Module } from '@nestjs/common';
import { AiReceptionistService } from './ai-receptionist.service';
import { AiReceptionistController } from './ai-receptionist.controller';
import { ClientsModule } from '../clients';
import { ProductsModule } from '../products';
import { AppointmentsModule } from '../appointments';

@Module({
  imports: [ClientsModule, ProductsModule, AppointmentsModule],
  controllers: [AiReceptionistController],
  providers: [AiReceptionistService],
  exports: [AiReceptionistService],
})
export class AiReceptionistModule {}

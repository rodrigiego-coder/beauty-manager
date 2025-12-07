import { Module } from '@nestjs/common';
import { AiReceptionistService } from './ai-receptionist.service';
import { AiReceptionistController } from './ai-receptionist.controller';
import { ClientsModule } from '../clients';

@Module({
  imports: [ClientsModule],
  controllers: [AiReceptionistController],
  providers: [AiReceptionistService],
  exports: [AiReceptionistService],
})
export class AiReceptionistModule {}

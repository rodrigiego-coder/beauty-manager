import { Module, forwardRef } from '@nestjs/common';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => NotificationsModule), // Para notificar conclusão de triagem
  ],
  controllers: [TriageController],
  providers: [TriageService],
  exports: [TriageService],
})
export class TriageModule {}

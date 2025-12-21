import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users';
import { NotificationsModule } from '../notifications';
import { TriageModule } from '../triage/triage.module';

@Module({
  imports: [
    UsersModule,
    NotificationsModule, // Para notificações WhatsApp automáticas
    forwardRef(() => TriageModule), // Para verificar se serviço requer triagem
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

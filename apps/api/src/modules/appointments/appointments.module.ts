import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users';
import { NotificationsModule } from '../notifications';
import { TriageModule } from '../triage/triage.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { GoogleCalendarModule } from '../google-calendar';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => NotificationsModule), // Para notificações WhatsApp automáticas (forwardRef para evitar ciclo)
    forwardRef(() => TriageModule), // Para verificar se serviço requer triagem
    forwardRef(() => SchedulesModule), // Para validação de disponibilidade
    GoogleCalendarModule, // Para sincronização com Google Calendar
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

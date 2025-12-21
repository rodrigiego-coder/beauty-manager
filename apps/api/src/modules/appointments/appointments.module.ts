import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users';
import { NotificationsModule } from '../notifications';

@Module({
  imports: [
    UsersModule,
    NotificationsModule, // Para notificações WhatsApp automáticas
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

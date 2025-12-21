import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { AutomationModule } from '../automation/automation.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AutomationModule, // Para acessar WhatsAppService
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ScheduledMessagesService,
    ScheduledMessagesProcessor,
  ],
  exports: [
    NotificationsService,
    ScheduledMessagesService,
  ],
})
export class NotificationsModule {}

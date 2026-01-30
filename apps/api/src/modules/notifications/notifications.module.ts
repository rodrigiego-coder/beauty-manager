import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { AutomationModule } from '../automation/automation.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    // ScheduleModule já é importado globalmente em app.module.ts
    forwardRef(() => AutomationModule), // Para acessar WhatsAppService (forwardRef para evitar ciclo)
    SubscriptionsModule, // Para acessar AddonsService (consumo de quota)
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

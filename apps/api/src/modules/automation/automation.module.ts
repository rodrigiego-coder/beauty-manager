import { Module, forwardRef } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { ZapiWebhookController } from './zapi-webhook.controller';
import { AutomationService } from './automation.service';
import { WhatsAppService } from './whatsapp.service';
import { SMSService } from './sms.service';
import { MessageSchedulerService } from './message-scheduler.service';
import { AutomationJobs } from './automation.jobs';
import { AlexisModule } from '../alexis/alexis.module';

@Module({
  imports: [forwardRef(() => AlexisModule)],
  controllers: [AutomationController, ZapiWebhookController],
  providers: [
    AutomationService,
    WhatsAppService,
    SMSService,
    MessageSchedulerService,
    AutomationJobs,
  ],
  exports: [
    AutomationService,
    WhatsAppService,
    SMSService,
    MessageSchedulerService,
  ],
})
export class AutomationModule {}

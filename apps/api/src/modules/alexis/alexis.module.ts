import { Module, forwardRef } from '@nestjs/common';
import { AlexisController } from './alexis.controller';
import { AlexisService } from './alexis.service';
import { GeminiService } from './gemini.service';
import { ContentFilterService } from './content-filter.service';
import { IntentClassifierService } from './intent-classifier.service';
import { AlexisSchedulerService } from './scheduler.service';
import { DataCollectorService } from './data-collector.service';
import { AlexisCatalogService } from './alexis-catalog.service';
import { ResponseComposerService } from './response-composer.service';
import { ProductInfoService } from './product-info.service';
import { ConversationStateStore } from './conversation-state.store';
import { AppointmentsModule } from '../appointments/appointments.module';
import { OnlineBookingModule } from '../online-booking/online-booking.module';

/**
 * ==========================================
 * ALEXIS MODULE
 * IA Assistente para WhatsApp & Dashboard
 * Compliance: ANVISA + LGPD
 * ==========================================
 */
@Module({
  imports: [
    forwardRef(() => AppointmentsModule), // Para criar agendamento via FSM
    forwardRef(() => OnlineBookingModule), // Para gerar link de agendamento assistido
  ],
  controllers: [AlexisController],
  providers: [
    AlexisService,
    GeminiService,
    ContentFilterService,
    IntentClassifierService,
    AlexisSchedulerService,
    DataCollectorService,
    AlexisCatalogService,
    ResponseComposerService,
    ProductInfoService,
    ConversationStateStore,
  ],
  exports: [AlexisService, AlexisCatalogService, ProductInfoService],
})
export class AlexisModule {}

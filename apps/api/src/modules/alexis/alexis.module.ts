import { Module } from '@nestjs/common';
import { AlexisController } from './alexis.controller';
import { AlexisService } from './alexis.service';
import { GeminiService } from './gemini.service';
import { ContentFilterService } from './content-filter.service';
import { IntentClassifierService } from './intent-classifier.service';
import { AlexisSchedulerService } from './scheduler.service';
import { DataCollectorService } from './data-collector.service';
import { AlexisCatalogService } from './alexis-catalog.service';

/**
 * =====================================================
 * ALEXIS MODULE
 * IA Assistente para WhatsApp & Dashboard
 * Compliance: ANVISA + LGPD
 * =====================================================
 */

@Module({
  controllers: [AlexisController],
  providers: [
    AlexisService,
    GeminiService,
    ContentFilterService,
    IntentClassifierService,
    AlexisSchedulerService,
    DataCollectorService,
    AlexisCatalogService,
  ],
  exports: [AlexisService, AlexisCatalogService],
})
export class AlexisModule {}

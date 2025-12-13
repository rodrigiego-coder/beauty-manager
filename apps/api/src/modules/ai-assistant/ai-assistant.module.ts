import { Module } from '@nestjs/common';
import { AIAssistantController } from './ai-assistant.controller';
import { AIAssistantService } from './ai-assistant.service';
import { GeminiService } from './gemini.service';
import { AIDataCollectorService } from './ai-data-collector.service';

@Module({
  controllers: [AIAssistantController],
  providers: [AIAssistantService, GeminiService, AIDataCollectorService],
  exports: [AIAssistantService, GeminiService],
})
export class AIAssistantModule {}

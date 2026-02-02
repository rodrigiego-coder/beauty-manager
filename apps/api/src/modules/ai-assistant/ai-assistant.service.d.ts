import { GeminiService } from './gemini.service';
import { AIDataCollectorService } from './ai-data-collector.service';
import { BriefingResponse } from './dto';
export declare class AIAssistantService {
    private geminiService;
    private dataCollector;
    constructor(geminiService: GeminiService, dataCollector: AIDataCollectorService);
    generateBriefing(salonId: string, userId: string, userRole: string, userName: string): Promise<BriefingResponse>;
    private buildBriefingPrompt;
    private extractAlerts;
    chat(salonId: string, userId: string, userRole: string, message: string): Promise<string>;
    private getRecentHistory;
    private saveConversation;
    getClientInsight(salonId: string, clientId: string): Promise<string>;
    getInsights(salonId: string, userId: string): Promise<any[]>;
    dismissInsight(id: string): Promise<void>;
    private saveInsight;
    getSettings(salonId: string): Promise<any>;
    updateSettings(salonId: string, data: Partial<any>): Promise<any>;
    getChatHistory(salonId: string, userId: string): Promise<any[]>;
    clearChatHistory(salonId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=ai-assistant.service.d.ts.map
import { AIAssistantService } from './ai-assistant.service';
import { ChatMessageDto, UpdateAISettingsDto, CreateClientNoteDto } from './dto';
export declare class AIAssistantController {
    private readonly aiService;
    constructor(aiService: AIAssistantService);
    getBriefing(req: any): Promise<import("./dto").BriefingResponse>;
    chat(req: any, dto: ChatMessageDto): Promise<{
        response: string;
    }>;
    getChatHistory(req: any): Promise<any[]>;
    clearChatHistory(req: any): Promise<{
        success: boolean;
    }>;
    getClientInsight(req: any, clientId: string): Promise<{
        insight: string;
    }>;
    getClientNotes(req: any, clientId: string): Promise<{
        id: string;
        salonId: string;
        clientId: string;
        noteType: string;
        content: string;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createClientNote(req: any, dto: CreateClientNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        clientId: string;
        content: string;
        createdById: string | null;
        noteType: string;
    } | undefined>;
    deleteClientNote(req: any, noteId: string): Promise<{
        success: boolean;
    }>;
    getInsights(req: any): Promise<any[]>;
    dismissInsight(id: string): Promise<{
        success: boolean;
    }>;
    getSettings(req: any): Promise<any>;
    updateSettings(req: any, dto: UpdateAISettingsDto): Promise<any>;
    getStatus(): Promise<{
        isConfigured: boolean;
        model: string;
        assistantName: string;
    }>;
}
//# sourceMappingURL=ai-assistant.controller.d.ts.map
import { AlexisService } from './alexis.service';
/**
 * =====================================================
 * ALEXIS CONTROLLER
 * API para IA WhatsApp & Dashboard
 * =====================================================
 */
declare class ProcessMessageDto {
    salonId: string;
    clientPhone: string;
    message: string;
    clientName?: string;
    senderId?: string;
    senderType?: 'client' | 'agent';
}
declare class UpdateSettingsDto {
    isEnabled?: boolean;
    assistantName?: string;
    greetingMessage?: string;
    humanTakeoverMessage?: string;
    aiResumeMessage?: string;
    humanTakeoverCommand?: string;
    aiResumeCommand?: string;
    autoSchedulingEnabled?: boolean;
    workingHoursStart?: string;
    workingHoursEnd?: string;
}
declare class DashboardChatDto {
    message: string;
}
export declare class AlexisController {
    private readonly alexisService;
    constructor(alexisService: AlexisService);
    /**
     * Processa mensagem do WhatsApp (webhook ou chamada direta)
     * Pode ser do cliente ou do atendente
     */
    processMessage(dto: ProcessMessageDto): Promise<import("./alexis.service").ProcessMessageResult>;
    /**
     * Lista conversas do WhatsApp
     */
    getConversations(req: any, status?: string): Promise<{
        id: string;
        salonId: string;
        clientId: string | null;
        clientPhone: string;
        clientName: string | null;
        status: string;
        humanAgentId: string | null;
        humanTakeoverAt: Date | null;
        aiResumedAt: Date | null;
        lastMessageAt: Date | null;
        messagesCount: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * Busca mensagens de uma conversa
     */
    getMessages(id: string): Promise<{
        id: string;
        conversationId: string;
        role: string;
        content: string;
        intent: string | null;
        wasBlocked: boolean | null;
        blockReason: string | null;
        isCommand: boolean | null;
        metadata: {
            tokensUsed?: number;
            responseTimeMs?: number;
            confidenceScore?: number;
        } | null;
        createdAt: Date;
    }[]>;
    /**
     * Gera briefing para o usuário logado
     */
    getBriefing(req: any): Promise<string>;
    /**
     * Chat do dashboard com a Alexis
     */
    dashboardChat(req: any, dto: DashboardChatDto): Promise<import("./alexis.service").ProcessMessageResult>;
    /**
     * Obtém configurações da Alexis
     */
    getSettings(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        isEnabled: boolean | null;
        assistantName: string | null;
        greetingMessage: string | null;
        humanTakeoverMessage: string | null;
        aiResumeMessage: string | null;
        humanTakeoverCommand: string | null;
        aiResumeCommand: string | null;
        autoSchedulingEnabled: boolean | null;
        workingHoursStart: string | null;
        workingHoursEnd: string | null;
    } | undefined>;
    /**
     * Atualiza configurações da Alexis
     */
    updateSettings(req: any, dto: UpdateSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        isEnabled: boolean | null;
        assistantName: string | null;
        greetingMessage: string | null;
        humanTakeoverMessage: string | null;
        aiResumeMessage: string | null;
        humanTakeoverCommand: string | null;
        aiResumeCommand: string | null;
        autoSchedulingEnabled: boolean | null;
        workingHoursStart: string | null;
        workingHoursEnd: string | null;
    }[]>;
    /**
     * Obtém logs de interação
     */
    getLogs(req: any, limit?: string): Promise<{
        id: string;
        salonId: string;
        conversationId: string | null;
        clientPhone: string;
        messageIn: string;
        messageOut: string;
        intent: string | null;
        wasBlocked: boolean | null;
        blockReason: string | null;
        tokensUsed: number | null;
        responseTimeMs: number | null;
        createdAt: Date;
    }[]>;
    /**
     * Obtém logs de termos bloqueados
     */
    getBlockedLogs(req: any, limit?: string): Promise<{
        id: string;
        salonId: string;
        conversationId: string | null;
        originalMessage: string;
        blockedTerms: string[];
        layer: string;
        createdAt: Date;
    }[]>;
    /**
     * Verifica status da Alexis
     */
    getStatus(req: any): Promise<{
        isEnabled: boolean;
        isGeminiAvailable: boolean;
        assistantName: string;
        commands: {
            humanTakeover: string;
            aiResume: string;
        };
    }>;
    /**
     * Lista sessões de conversa
     */
    getSessions(req: any): Promise<{
        id: string;
        salonId: string;
        clientId: string | null;
        clientPhone: string;
        clientName: string | null;
        status: string;
        humanAgentId: string | null;
        humanTakeoverAt: Date | null;
        aiResumedAt: Date | null;
        lastMessageAt: Date | null;
        messagesCount: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * Obtém mensagens de uma sessão
     */
    getSessionMessages(req: any, sessionId: string): Promise<{
        id: string;
        conversationId: string;
        role: string;
        content: string;
        intent: string | null;
        wasBlocked: boolean | null;
        blockReason: string | null;
        isCommand: boolean | null;
        metadata: {
            tokensUsed?: number;
            responseTimeMs?: number;
            confidenceScore?: number;
        } | null;
        createdAt: Date;
    }[]>;
    /**
     * Encerra uma sessão
     */
    endSession(req: any, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Estatísticas de compliance ANVISA
     */
    getComplianceStats(req: any): Promise<{
        totalBlocked: number;
        totalInteractions: number;
        humanTakeovers: number;
        complianceRate: number;
    }>;
    /**
     * Métricas de uso da Alexis
     */
    getMetrics(req: any): Promise<{
        totalConversations: number;
        activeConversations: number;
        totalMessages: number;
        avgMessagesPerConversation: number;
    }>;
    /**
     * Atendente assume controle da conversa
     */
    takeover(req: any, dto: {
        sessionId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Alexis retoma controle da conversa
     */
    resume(req: any, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Envia mensagem como humano
     */
    sendHumanMessage(req: any, dto: {
        sessionId: string;
        message: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Deleta histórico do chat do dashboard
     */
    deleteChatHistory(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=alexis.controller.d.ts.map
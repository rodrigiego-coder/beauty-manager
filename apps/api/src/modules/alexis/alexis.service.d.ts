import { aiSettings } from '../../database/schema';
import { GeminiService } from './gemini.service';
import { ContentFilterService } from './content-filter.service';
import { IntentClassifierService } from './intent-classifier.service';
import { AlexisSchedulerService } from './scheduler.service';
import { DataCollectorService } from './data-collector.service';
import { AlexisCatalogService } from './alexis-catalog.service';
import { ProductInfoService } from './product-info.service';
import { ResponseComposerService } from './response-composer.service';
import { ConversationStateStore } from './conversation-state.store';
import { AppointmentsService } from '../appointments/appointments.service';
import { OnlineBookingSettingsService } from '../online-booking/online-booking-settings.service';
/**
 * =====================================================
 * ALEXIS SERVICE - PRINCIPAL
 * IA Assistente para WhatsApp & Dashboard
 * =====================================================
 */
export interface ProcessMessageResult {
    response: string | null;
    intent: string;
    blocked: boolean;
    shouldSend: boolean;
    statusChanged: boolean;
    newStatus?: string;
}
export declare class AlexisService {
    private readonly gemini;
    private readonly contentFilter;
    private readonly intentClassifier;
    private readonly scheduler;
    private readonly dataCollector;
    private readonly catalog;
    private readonly productInfo;
    private readonly composer;
    private readonly stateStore;
    private readonly appointmentsService;
    private readonly onlineBookingSettings;
    private readonly logger;
    /** Debounce in-memory: agrupa mensagens rápidas por conversa */
    private debounceMap;
    constructor(gemini: GeminiService, contentFilter: ContentFilterService, intentClassifier: IntentClassifierService, scheduler: AlexisSchedulerService, dataCollector: DataCollectorService, catalog: AlexisCatalogService, productInfo: ProductInfoService, composer: ResponseComposerService, stateStore: ConversationStateStore, appointmentsService: AppointmentsService, onlineBookingSettings: OnlineBookingSettingsService);
    /**
     * =====================================================
     * PROCESSAMENTO DE MENSAGEM WHATSAPP
     * Entrada principal para mensagens
     * =====================================================
     */
    processWhatsAppMessage(salonId: string, clientPhone: string, message: string, clientName?: string, senderId?: string, senderType?: 'client' | 'agent'): Promise<ProcessMessageResult>;
    /**
     * =====================================================
     * HANDLERS DE COMANDOS
     * =====================================================
     */
    private handleHumanTakeover;
    private handleAIResume;
    /**
     * =====================================================
     * DEBOUNCE — anti-atropelo (in-memory por conversa)
     * Se lock ativo: append no buffer e retorna DEFER
     * Se lock livre: OWNER, espera debounceMs, consolida
     * =====================================================
     */
    handleDebounce(conversationId: string, text: string): Promise<{
        deferred: boolean;
        mergedText?: string;
    }>;
    /**
     * =====================================================
     * FSM TURN — Processa turno dentro de skill ativa
     * =====================================================
     */
    private handleFSMTurn;
    /**
     * =====================================================
     * COMMIT SCHEDULING TRANSACTION (P0)
     * Cria appointment real no banco usando AppointmentsService
     * =====================================================
     */
    private commitSchedulingTransaction;
    /**
     * Busca informações do salão para mensagem de confirmação
     */
    private getSalonInfoForConfirmation;
    /**
     * Constrói SkillContext com profissionais + assignments para o salonId.
     */
    private buildSkillContext;
    /**
     * =====================================================
     * LEXICON SERVICE PRICE — Detecta dialeto de salão em perguntas de preço
     * Ex: "quanto custa a progressiva?" → preço de Alisamento (serviço)
     * =====================================================
     */
    private tryLexiconServicePrice;
    /**
     * Registra telemetria do lexicon (1 evento por turno, sem texto do usuário).
     */
    private logLexiconTelemetry;
    /**
     * =====================================================
     * INFO INTERRUPTION — Responde pergunta de info durante scheduling
     * Usa ProductInfo determinístico ou Gemini como fallback
     * =====================================================
     */
    private resolveInfoInterruption;
    /**
     * =====================================================
     * FSM START — Envia link de agendamento online
     * (Antes: iniciava scheduling skill via FSM)
     * =====================================================
     */
    private handleFSMStart;
    /**
     * =====================================================
     * GERA RESPOSTA COM LINK DE AGENDAMENTO ONLINE
     * =====================================================
     */
    private generateBookingLinkResponse;
    /**
     * =====================================================
     * CONTINUAÇÃO TRANSACIONAL DE AGENDAMENTO
     * Se a última mensagem do assistant foi um prompt de serviço,
     * interpreta a resposta do usuário como seleção de serviço.
     * =====================================================
     */
    private checkScheduleContinuation;
    /**
     * =====================================================
     * AGENDAMENTO VIA WHATSAPP
     * =====================================================
     */
    private handleSchedulingIntent;
    /**
     * =====================================================
     * PRODUTOS VIA WHATSAPP (ALFA.2)
     * =====================================================
     */
    private handleProductIntent;
    /**
     * =====================================================
     * CONFIRMAÇÃO DE AGENDAMENTO VIA WHATSAPP
     * =====================================================
     */
    private handleAppointmentConfirmation;
    /**
     * =====================================================
     * LIST_SERVICES — Lista serviços do salão via DB (P0.5)
     * =====================================================
     */
    private handleListServices;
    /**
     * =====================================================
     * GESTÃO DE CONVERSAS
     * =====================================================
     */
    /**
     * Carrega os últimos N turnos da conversa (client + ai) em ordem cronológica.
     * Reutiliza padrão Belle (ai-assistant.service.ts) adaptado para aiMessages.
     */
    private getRecentHistory;
    private getOrCreateConversation;
    private saveMessage;
    private logInteraction;
    /**
     * =====================================================
     * CONFIGURAÇÕES
     * =====================================================
     */
    getSettings(salonId: string): Promise<{
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
    updateSettings(salonId: string, updates: Partial<typeof aiSettings.$inferInsert>): Promise<{
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
     * =====================================================
     * LISTAGEM DE CONVERSAS E MENSAGENS
     * =====================================================
     */
    getConversations(salonId: string, status?: string): Promise<{
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
    getMessages(conversationId: string): Promise<{
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
     * =====================================================
     * BRIEFING DO DASHBOARD
     * =====================================================
     */
    generateBriefing(salonId: string, userId: string, userRole: string, userName: string): Promise<string>;
    /**
     * =====================================================
     * LOGS E AUDITORIA
     * =====================================================
     */
    getInteractionLogs(salonId: string, limit?: number): Promise<{
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
    getBlockedTermsLogs(salonId: string, limit?: number): Promise<{
        id: string;
        salonId: string;
        conversationId: string | null;
        originalMessage: string;
        blockedTerms: string[];
        layer: string;
        createdAt: Date;
    }[]>;
    /**
     * Verifica se o serviço está operacional
     */
    isEnabled(): boolean;
    /**
     * =====================================================
     * SESSIONS (Dashboard)
     * =====================================================
     */
    getSessions(salonId: string): Promise<{
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
    getSessionMessages(salonId: string, sessionId: string): Promise<{
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
    endSession(salonId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * =====================================================
     * COMPLIANCE & METRICS
     * =====================================================
     */
    getComplianceStats(salonId: string): Promise<{
        totalBlocked: number;
        totalInteractions: number;
        humanTakeovers: number;
        complianceRate: number;
    }>;
    getMetrics(salonId: string): Promise<{
        totalConversations: number;
        activeConversations: number;
        totalMessages: number;
        avgMessagesPerConversation: number;
    }>;
    /**
     * =====================================================
     * TAKEOVER & RESUME
     * =====================================================
     */
    humanTakeover(salonId: string, sessionId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    aiResume(salonId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendHumanMessage(salonId: string, sessionId: string, message: string, _userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Deleta histórico do chat do dashboard
     */
    deleteDashboardChatHistory(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=alexis.service.d.ts.map
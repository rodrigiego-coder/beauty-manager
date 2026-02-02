import { OnModuleInit } from '@nestjs/common';
/**
 * =====================================================
 * GEMINI SERVICE
 * Integração com Google Gemini API
 * =====================================================
 */
/** Turno de conversa para memória contextual */
export interface ConversationTurn {
    role: 'client' | 'ai';
    content: string;
}
/** Limite de turnos carregados (configurável sem .env) */
export declare const CONVERSATION_HISTORY_LIMIT = 8;
/** Tamanho máximo por mensagem no histórico (chars) */
export declare const MESSAGE_TRUNCATE_LENGTH = 600;
export declare class GeminiService implements OnModuleInit {
    private readonly logger;
    private genAI;
    private model;
    onModuleInit(): Promise<void>;
    /**
     * Verifica se o serviço está disponível
     */
    isAvailable(): boolean;
    /**
     * Gera resposta usando o Gemini
     * @param salonName Nome do salão para personalização
     * @param userMessage Mensagem do usuário
     * @param context Contexto do salão (serviços, produtos, etc)
     * @param history Turnos recentes da conversa (opcional)
     */
    generateResponse(salonName: string, userMessage: string, context: Record<string, any>, history?: ConversationTurn[]): Promise<string>;
    /**
     * Formata histórico de conversa para inclusão no prompt
     */
    formatHistory(history: ConversationTurn[]): string;
    /**
     * Gera briefing para o dashboard
     */
    generateBriefing(userName: string, userRole: string, data: Record<string, any>): Promise<string>;
    /**
     * Resposta de fallback premium quando a IA não está disponível.
     * P0.4: Nunca expor "instabilidade" ao cliente — sempre oferecer ajuda concreta.
     */
    getFallbackResponse(): string;
    /**
     * Briefing padrão quando a IA não está disponível
     */
    private getDefaultBriefing;
}
//# sourceMappingURL=gemini.service.d.ts.map
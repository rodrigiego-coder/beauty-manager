/**
 * =====================================================
 * CONTENT FILTER SERVICE
 * 3 Camadas de Proteção ANVISA/LGPD
 * =====================================================
 */
export interface FilterResult {
    allowed: boolean;
    blockedTerms: string[];
}
export interface OutputFilterResult {
    safe: boolean;
    filtered: string;
    blockedTerms: string[];
}
export interface CommandCheck {
    isCommand: boolean;
    command: 'HUMAN_TAKEOVER' | 'AI_RESUME' | null;
}
export declare class ContentFilterService {
    private readonly logger;
    /**
     * Verifica se a mensagem é um comando de controle (#eu ou #ia)
     * IMPORTANTE: Comandos NÃO são enviados ao cliente
     */
    isCommand(message: string): CommandCheck;
    /**
     * CAMADA 1: Filtro de ENTRADA
     * Executado ANTES de enviar para a IA
     * Bloqueia mensagens com termos proibidos
     */
    filterInput(message: string): FilterResult;
    /**
     * CAMADA 3: Filtro de SAÍDA
     * Executado DEPOIS de receber resposta da IA
     * Sanitiza ou bloqueia respostas com termos proibidos
     */
    filterOutput(response: string): OutputFilterResult;
    /**
     * Obtém a resposta padrão para mensagens bloqueadas
     */
    getBlockedResponse(): string;
}
//# sourceMappingURL=content-filter.service.d.ts.map
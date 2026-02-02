/**
 * =====================================================
 * RELATIVE DATE RESOLVER (P0.5)
 * Detecta perguntas de data relativa em pt-BR e responde
 * de forma determinística (sem IA) usando America/Sao_Paulo.
 * =====================================================
 */
export interface RelativeDateResult {
    matched: boolean;
    response?: string;
}
/**
 * Verifica se a mensagem é uma pergunta de data relativa e retorna resposta formatada.
 * Usa Intl.DateTimeFormat com timezone America/Sao_Paulo (sem dependência externa).
 */
export declare function resolveRelativeDate(message: string): RelativeDateResult;
//# sourceMappingURL=relative-date-resolver.d.ts.map
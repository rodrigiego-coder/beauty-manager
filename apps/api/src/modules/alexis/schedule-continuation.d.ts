/**
 * =====================================================
 * SCHEDULE CONTINUATION — PURE UTILITIES
 * Detecta continuação transacional de agendamento
 * (sem dependência de DB — testável em isolamento)
 * =====================================================
 */
/**
 * Verifica se a mensagem do assistant é um prompt de seleção de serviço.
 */
export declare function isSchedulePrompt(content: string): boolean;
/**
 * Remove acentos, converte para lowercase e faz trim.
 */
export declare function normalizeText(text: string): string;
/**
 * Tenta encontrar um serviço na mensagem do usuário via fuzzy match.
 *
 * Estratégia (em ordem):
 * 1. Match exato (normalizado) do nome do serviço
 * 2. Nome do serviço contido na mensagem do usuário
 * 3. Mensagem do usuário contida no nome do serviço (para respostas curtas)
 *
 * Retorna o serviço encontrado ou null.
 */
export declare function fuzzyMatchService<T extends {
    name: string;
}>(userMessage: string, services: T[]): T | null;
//# sourceMappingURL=schedule-continuation.d.ts.map
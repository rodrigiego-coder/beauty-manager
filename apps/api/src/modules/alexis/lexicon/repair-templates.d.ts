/**
 * =====================================================
 * REPAIR TEMPLATES — Respostas premium para o dialeto de salão
 * Normaliza termos coloquiais sem soar professoral.
 * Puro e testável (sem DB).
 * =====================================================
 */
import { LexiconEntry } from './salon-lexicon';
export interface RepairContext {
    entry: LexiconEntry;
    matchedTrigger: string;
    serviceName?: string;
    hasPrice?: boolean;
    price?: number;
}
export interface RepairResult {
    text: string;
    followUpQuestion?: string;
}
/**
 * Aplica o template de reparo adequado para a entrada do lexicon.
 */
export declare function applyRepairTemplate(ctx: RepairContext): RepairResult;
/**
 * Compoe a resposta final de reparo: texto + follow-up question.
 */
export declare function composeRepairResponse(result: RepairResult): string;
//# sourceMappingURL=repair-templates.d.ts.map
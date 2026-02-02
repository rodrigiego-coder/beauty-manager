/**
 * =====================================================
 * LEXICON TELEMETRY (P0.2.2)
 * Registra decisão do LexiconResolver nos logs.
 * Sem expor secrets ou texto completo do usuário.
 * =====================================================
 */
import { LexiconMatch } from './lexicon-resolver';
export type LexiconDecision = 'ASSUME' | 'ASK_CONFIRM' | 'IGNORE';
export interface LexiconTelemetryEvent {
    lexiconEnabled: boolean;
    entryId: string | null;
    canonical: string | null;
    matchedTrigger: string | null;
    confidence: number | null;
    decision: LexiconDecision;
    reason: string;
}
/**
 * Cria evento de telemetria a partir do resultado do LexiconResolver.
 * Puro — não faz I/O. O caller decide onde gravar.
 */
export declare function buildLexiconTelemetry(match: LexiconMatch | null, lexiconEnabled: boolean, overrideReason?: string): LexiconTelemetryEvent;
//# sourceMappingURL=lexicon-telemetry.d.ts.map
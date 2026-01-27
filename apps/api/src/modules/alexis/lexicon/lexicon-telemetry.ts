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
export function buildLexiconTelemetry(
  match: LexiconMatch | null,
  lexiconEnabled: boolean,
  overrideReason?: string,
): LexiconTelemetryEvent {
  if (!lexiconEnabled) {
    return {
      lexiconEnabled: false,
      entryId: null,
      canonical: null,
      matchedTrigger: null,
      confidence: null,
      decision: 'IGNORE',
      reason: overrideReason || 'feature_flag_off',
    };
  }

  if (!match) {
    return {
      lexiconEnabled: true,
      entryId: null,
      canonical: null,
      matchedTrigger: null,
      confidence: null,
      decision: 'IGNORE',
      reason: overrideReason || 'no_match',
    };
  }

  const decision: LexiconDecision = match.needsConfirmation
    ? 'ASK_CONFIRM'
    : 'ASSUME';

  const reason = match.entry.ambiguous
    ? 'ambiguous'
    : match.confidence < match.entry.confidenceMinToAssume
      ? 'low_confidence'
      : 'confident_match';

  return {
    lexiconEnabled: true,
    entryId: match.entry.id,
    canonical: match.entry.canonical,
    matchedTrigger: match.matchedTrigger,
    confidence: Math.round(match.confidence * 1000) / 1000,
    decision,
    reason: overrideReason || reason,
  };
}

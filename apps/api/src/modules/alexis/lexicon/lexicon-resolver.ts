/**
 * =====================================================
 * LEXICON RESOLVER — Resolve termos do dialeto de salão (P0.2.1)
 * Puro e testável (sem DB).
 * =====================================================
 */

import { SALON_LEXICON, LexiconEntry } from './salon-lexicon';
import { normalizeText } from '../schedule-continuation';

export interface LexiconMatch {
  entry: LexiconEntry;
  confidence: number;
  matchedTrigger: string;
  needsConfirmation: boolean;
}

/**
 * Busca o melhor match no lexicon para o texto do usuário.
 * Prioriza: trigger mais longo > maior confiança > primeiro encontrado.
 * Se ambíguo ou confiança < threshold → needsConfirmation = true.
 */
export function matchLexicon(text: string): LexiconMatch | null {
  const normalized = normalizeText(text);
  if (normalized.length < 3) return null;

  let bestMatch: LexiconMatch | null = null;

  for (const entry of SALON_LEXICON) {
    for (const trigger of entry.triggers) {
      const normalizedTrigger = normalizeText(trigger);

      // Verifica se o trigger aparece no texto (como palavra ou frase completa)
      if (!containsTrigger(normalized, normalizedTrigger)) continue;

      const confidence = computeConfidence(normalized, normalizedTrigger, entry);

      if (!bestMatch || isBetterMatch(confidence, normalizedTrigger, bestMatch)) {
        bestMatch = {
          entry,
          confidence,
          matchedTrigger: trigger,
          needsConfirmation: entry.ambiguous || confidence < entry.confidenceMinToAssume,
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Verifica se o trigger está no texto como palavra/frase (word boundary).
 * Para triggers multi-palavra, verifica sequência exata.
 * Para triggers single-word, verifica word boundary.
 */
function containsTrigger(normalizedText: string, normalizedTrigger: string): boolean {
  // Trigger multi-palavra: busca sequência exata
  if (normalizedTrigger.includes(' ')) {
    return normalizedText.includes(normalizedTrigger);
  }

  // Trigger single-word: word boundary check
  const regex = new RegExp(`\\b${escapeRegex(normalizedTrigger)}\\b`);
  return regex.test(normalizedText);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calcula confiança do match.
 * Triggers mais longos e mais específicos → maior confiança.
 */
function computeConfidence(
  normalizedText: string,
  normalizedTrigger: string,
  entry: LexiconEntry,
): number {
  // Base: proporção do trigger no texto
  const lengthRatio = normalizedTrigger.length / normalizedText.length;

  // Bonus: multi-word triggers são mais confiáveis
  const wordBonus = normalizedTrigger.includes(' ') ? 0.15 : 0;

  // Bonus: match exato (texto inteiro = trigger)
  const exactBonus = normalizedText === normalizedTrigger ? 0.2 : 0;

  // Penalty: ambiguous entries
  const ambiguousPenalty = entry.ambiguous ? -0.2 : 0;

  return Math.min(1, 0.6 + lengthRatio * 0.3 + wordBonus + exactBonus + ambiguousPenalty);
}

/**
 * Compara se um novo match é melhor que o atual.
 * Prioriza: trigger mais longo > maior confiança.
 */
function isBetterMatch(
  newConfidence: number,
  newTrigger: string,
  current: LexiconMatch,
): boolean {
  const currentTriggerLen = normalizeText(current.matchedTrigger).length;
  const newTriggerLen = normalizeText(newTrigger).length;

  // Trigger mais longo vence (mais específico)
  if (newTriggerLen > currentTriggerLen) return true;
  if (newTriggerLen < currentTriggerLen) return false;

  // Mesma length: maior confiança vence
  return newConfidence > current.confidence;
}

/**
 * Resolve termo do dialeto para nome de serviço, útil para fuzzyMatchService.
 * Se encontrar match no lexicon com suggestedServiceKey, retorna o canonical.
 */
export function resolveDialectToService(text: string): string | null {
  const match = matchLexicon(text);
  if (!match) return null;
  if (!match.entry.suggestedServiceKey) return null;
  return match.entry.canonical;
}

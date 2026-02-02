/**
 * =====================================================
 * LEXICON RESOLVER — Resolve termos do dialeto de salão (P0.2.1)
 * Puro e testável (sem DB).
 * =====================================================
 */
import { LexiconEntry } from './salon-lexicon';
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
export declare function matchLexicon(text: string): LexiconMatch | null;
/**
 * Resolve termo do dialeto para nome de serviço, útil para fuzzyMatchService.
 * Se encontrar match no lexicon com suggestedServiceKey, retorna o canonical.
 */
export declare function resolveDialectToService(text: string): string | null;
//# sourceMappingURL=lexicon-resolver.d.ts.map
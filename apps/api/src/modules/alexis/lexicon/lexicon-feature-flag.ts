/**
 * =====================================================
 * LEXICON FEATURE FLAG (P0.2.2)
 * Lê ALEXIS_LEXICON_ENABLED do env (default: true).
 * Puro e testável.
 * =====================================================
 */

/**
 * Retorna true se o lexicon está habilitado.
 * Aceita: 'true', '1', undefined (default true).
 * Retorna false para: 'false', '0'.
 */
export function getLexiconEnabled(): boolean {
  const raw = process.env.ALEXIS_LEXICON_ENABLED;
  if (raw === undefined || raw === '') return true;
  return raw !== 'false' && raw !== '0';
}

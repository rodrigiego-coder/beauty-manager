"use strict";
/**
 * =====================================================
 * LEXICON FEATURE FLAG (P0.2.2)
 * Lê ALEXIS_LEXICON_ENABLED do env (default: true).
 * Puro e testável.
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLexiconEnabled = getLexiconEnabled;
/**
 * Retorna true se o lexicon está habilitado.
 * Aceita: 'true', '1', undefined (default true).
 * Retorna false para: 'false', '0'.
 */
function getLexiconEnabled() {
    const raw = process.env.ALEXIS_LEXICON_ENABLED;
    if (raw === undefined || raw === '')
        return true;
    return raw !== 'false' && raw !== '0';
}
//# sourceMappingURL=lexicon-feature-flag.js.map
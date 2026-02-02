"use strict";
/**
 * =====================================================
 * CONVERSATION STATE — FSM para Alexis WhatsApp (P0.1)
 * Tipos puros + helpers sem dependência de DB
 * =====================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_DECLINES = exports.MAX_CONFUSION = exports.STATE_TTL_MINUTES = exports.DEBOUNCE_MS = void 0;
exports.defaultState = defaultState;
exports.nowIso = nowIso;
exports.isExpired = isExpired;
exports.bumpTTL = bumpTTL;
exports.mergeBufferTexts = mergeBufferTexts;
/** Debounce window (ms) */
exports.DEBOUNCE_MS = 2500;
/** TTL de state ativo (minutos) */
exports.STATE_TTL_MINUTES = 60;
/** Máximo de tentativas confusas antes de handover */
exports.MAX_CONFUSION = 3;
/** Máximo de recusas de horário antes de handover */
exports.MAX_DECLINES = 3;
function defaultState() {
    return {
        activeSkill: 'NONE',
        step: 'NONE',
        slots: {},
        userAlreadyGreeted: false,
        lastGreetingAt: null,
        confusionCount: 0,
        declineCount: 0,
        ttlExpiresAt: null,
    };
}
function nowIso() {
    return new Date().toISOString();
}
function isExpired(ttlExpiresAt) {
    if (!ttlExpiresAt)
        return false;
    return new Date(ttlExpiresAt) < new Date();
}
function bumpTTL(minutes = exports.STATE_TTL_MINUTES) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
}
function mergeBufferTexts(texts) {
    return texts.filter(Boolean).join('\n').trim();
}
//# sourceMappingURL=conversation-state.js.map
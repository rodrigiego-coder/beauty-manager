"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationStateStore = void 0;
exports.replySig = replySig;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const connection_1 = require("../../database/connection");
const drizzle_orm_1 = require("drizzle-orm");
const conversation_state_1 = require("./conversation-state");
/**
 * =====================================================
 * CONVERSATION STATE STORE
 * Leitura/escrita atômica de state via raw SQL
 * (usa coluna state_json em ai_conversations — JSONB)
 *
 * Se a coluna ainda não existir no DB, degrada
 * graciosamente para defaultState().
 *
 * Migração necessária (rodar no VPS antes do deploy):
 *   ALTER TABLE ai_conversations
 *     ADD COLUMN IF NOT EXISTS state_json JSONB DEFAULT NULL;
 * =====================================================
 */
let ConversationStateStore = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConversationStateStore = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConversationStateStore = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(ConversationStateStore.name);
        async getState(conversationId) {
            try {
                const result = await connection_1.db.execute((0, drizzle_orm_1.sql) `SELECT state_json FROM ai_conversations WHERE id = ${conversationId} LIMIT 1`);
                const row = result.rows?.[0] ?? result[0];
                const raw = row?.state_json;
                if (!raw)
                    return (0, conversation_state_1.defaultState)();
                const state = typeof raw === 'string' ? JSON.parse(raw) : raw;
                // TTL expirado: reseta skill mas mantém greeting info
                if (state.ttlExpiresAt && (0, conversation_state_1.isExpired)(state.ttlExpiresAt)) {
                    return {
                        ...(0, conversation_state_1.defaultState)(),
                        userAlreadyGreeted: state.userAlreadyGreeted ?? false,
                        lastGreetingAt: state.lastGreetingAt ?? null,
                    };
                }
                return { ...(0, conversation_state_1.defaultState)(), ...state };
            }
            catch (error) {
                this.logger.debug(`State read fallback: ${error?.message?.slice(0, 80)}`);
                return (0, conversation_state_1.defaultState)();
            }
        }
        async updateState(conversationId, partial) {
            try {
                const current = await this.getState(conversationId);
                const merged = { ...current, ...partial };
                const jsonStr = JSON.stringify(merged);
                await connection_1.db.execute((0, drizzle_orm_1.sql) `UPDATE ai_conversations
            SET state_json = ${jsonStr}::jsonb,
                updated_at = NOW()
            WHERE id = ${conversationId}`);
            }
            catch (error) {
                this.logger.debug(`State write fallback: ${error?.message?.slice(0, 80)}`);
            }
        }
        /**
         * =====================================================
         * REPLY DEDUP GATE — atômico via state_json
         * Grava lastReplySig + lastReplyAtMs no state_json.
         * Usa UPDATE … WHERE para garantir atomicidade:
         *   - Se sig diferente OU fora da janela → UPDATE seta novo sig → true (pode enviar)
         *   - Se sig igual E dentro da janela → UPDATE não afeta nenhuma row → false (suprimir)
         * =====================================================
         */
        async tryRegisterReply(conversationId, replyText, windowMs = 600_000) {
            try {
                const sig = replySig(replyText);
                const nowMs = Date.now();
                const cutoffMs = nowMs - windowMs;
                // Atomic UPDATE: only succeeds if sig is different OR outside window
                // Uses jsonb_set to patch lastReplySig and lastReplyAtMs into state_json
                const result = await connection_1.db.execute((0, drizzle_orm_1.sql) `UPDATE ai_conversations
            SET state_json = COALESCE(state_json, '{}'::jsonb)
                             || jsonb_build_object('lastReplySig', ${sig}, 'lastReplyAtMs', ${nowMs}),
                updated_at = NOW()
            WHERE id = ${conversationId}
              AND (
                COALESCE(state_json->>'lastReplySig', '') != ${sig}
                OR COALESCE((state_json->>'lastReplyAtMs')::bigint, 0) < ${cutoffMs}
              )`);
                // rowCount > 0 means the UPDATE matched → we are the first (can send)
                const rowCount = result.rowCount ?? result.rowsAffected ?? result.changes ?? 0;
                if (rowCount > 0)
                    return true;
                // UPDATE didn't match → duplicate within window → suppress
                this.logger.debug(`DedupGate: suppressed duplicate reply for conversation ${conversationId}`);
                return false;
            }
            catch (error) {
                this.logger.debug(`DedupGate fallback (allow): ${error?.message?.slice(0, 80)}`);
                return true; // fail-open: allow send on error
            }
        }
    };
    return ConversationStateStore = _classThis;
})();
exports.ConversationStateStore = ConversationStateStore;
/**
 * Gera signature leve de uma resposta (sha256 truncado a 16 chars).
 * Normaliza: trim + collapse whitespace.
 */
function replySig(text) {
    const normalized = text.trim().replace(/\s+/g, ' ');
    return (0, crypto_1.createHash)('sha256').update(normalized).digest('hex').slice(0, 16);
}
//# sourceMappingURL=conversation-state.store.js.map
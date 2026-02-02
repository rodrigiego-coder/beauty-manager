import { ConversationState } from './conversation-state';
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
export declare class ConversationStateStore {
    private readonly logger;
    getState(conversationId: string): Promise<ConversationState>;
    updateState(conversationId: string, partial: Partial<ConversationState>): Promise<void>;
    /**
     * =====================================================
     * REPLY DEDUP GATE — atômico via state_json
     * Grava lastReplySig + lastReplyAtMs no state_json.
     * Usa UPDATE … WHERE para garantir atomicidade:
     *   - Se sig diferente OU fora da janela → UPDATE seta novo sig → true (pode enviar)
     *   - Se sig igual E dentro da janela → UPDATE não afeta nenhuma row → false (suprimir)
     * =====================================================
     */
    tryRegisterReply(conversationId: string, replyText: string, windowMs?: number): Promise<boolean>;
}
/**
 * Gera signature leve de uma resposta (sha256 truncado a 16 chars).
 * Normaliza: trim + collapse whitespace.
 */
export declare function replySig(text: string): string;
//# sourceMappingURL=conversation-state.store.d.ts.map
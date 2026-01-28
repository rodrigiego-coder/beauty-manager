import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { db } from '../../database/connection';
import { sql } from 'drizzle-orm';
import { ConversationState, defaultState, isExpired } from './conversation-state';

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

@Injectable()
export class ConversationStateStore {
  private readonly logger = new Logger(ConversationStateStore.name);

  async getState(conversationId: string): Promise<ConversationState> {
    try {
      const result: any = await db.execute(
        sql`SELECT state_json FROM ai_conversations WHERE id = ${conversationId} LIMIT 1`,
      );
      const row = result.rows?.[0] ?? result[0];
      const raw = row?.state_json;

      if (!raw) return defaultState();

      const state: ConversationState =
        typeof raw === 'string' ? JSON.parse(raw) : raw;

      // TTL expirado: reseta skill mas mantém greeting info
      if (state.ttlExpiresAt && isExpired(state.ttlExpiresAt)) {
        return {
          ...defaultState(),
          userAlreadyGreeted: state.userAlreadyGreeted ?? false,
          lastGreetingAt: state.lastGreetingAt ?? null,
        };
      }

      return { ...defaultState(), ...state };
    } catch (error: any) {
      this.logger.debug(`State read fallback: ${error?.message?.slice(0, 80)}`);
      return defaultState();
    }
  }

  async updateState(
    conversationId: string,
    partial: Partial<ConversationState>,
  ): Promise<void> {
    try {
      const current = await this.getState(conversationId);
      const merged = { ...current, ...partial };
      const jsonStr = JSON.stringify(merged);

      await db.execute(
        sql`UPDATE ai_conversations
            SET state_json = ${jsonStr}::jsonb,
                updated_at = NOW()
            WHERE id = ${conversationId}`,
      );
    } catch (error: any) {
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
  async tryRegisterReply(
    conversationId: string,
    replyText: string,
    windowMs = 600_000,
  ): Promise<boolean> {
    try {
      const sig = replySig(replyText);
      const nowMs = Date.now();
      const cutoffMs = nowMs - windowMs;

      // Atomic UPDATE: only succeeds if sig is different OR outside window
      // Uses jsonb_set to patch lastReplySig and lastReplyAtMs into state_json
      const result: any = await db.execute(
        sql`UPDATE ai_conversations
            SET state_json = COALESCE(state_json, '{}'::jsonb)
                             || jsonb_build_object('lastReplySig', ${sig}, 'lastReplyAtMs', ${nowMs}),
                updated_at = NOW()
            WHERE id = ${conversationId}
              AND (
                COALESCE(state_json->>'lastReplySig', '') != ${sig}
                OR COALESCE((state_json->>'lastReplyAtMs')::bigint, 0) < ${cutoffMs}
              )`,
      );

      // rowCount > 0 means the UPDATE matched → we are the first (can send)
      const rowCount = result.rowCount ?? result.rowsAffected ?? result.changes ?? 0;
      if (rowCount > 0) return true;

      // UPDATE didn't match → duplicate within window → suppress
      this.logger.debug(`DedupGate: suppressed duplicate reply for conversation ${conversationId}`);
      return false;
    } catch (error: any) {
      this.logger.debug(`DedupGate fallback (allow): ${error?.message?.slice(0, 80)}`);
      return true; // fail-open: allow send on error
    }
  }
}

/**
 * Gera signature leve de uma resposta (sha256 truncado a 16 chars).
 * Normaliza: trim + collapse whitespace.
 */
export function replySig(text: string): string {
  const normalized = text.trim().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

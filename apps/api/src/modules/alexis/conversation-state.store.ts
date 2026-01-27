import { Injectable, Logger } from '@nestjs/common';
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
}

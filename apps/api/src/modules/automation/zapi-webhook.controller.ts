import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../database/connection';
import * as schema from '../../database/schema';
import { AlexisService } from '../alexis/alexis.service';
import { WhatsAppService } from './whatsapp.service';
import { AudioTranscriptionService } from '../alexis/audio-transcription.service';

// =====================================================
// TYPES
// =====================================================

export interface ZapiPayload {
  instanceId?: string;
  connectedPhone?: string;
  phone?: string;
  from?: string;
  chatName?: string;
  senderName?: string;
  pushName?: string;
  isGroup?: boolean;
  isNewsletter?: boolean;
  fromMe?: boolean;
  messageId?: string;
  type?: string;
  text?: {
    message?: string;
  };
  audio?: {
    audioUrl?: string;
    mimeType?: string;
    seconds?: number;
  };
  status?: string;
}

export interface PayloadSummary {
  instanceId: string | null;
  connectedPhone: string | null;
  phone: string | null;
  chatName: string | null;
  isGroup: boolean;
  isNewsletter: boolean;
  fromMe: boolean;
  hasText: boolean;
  messageId: string | null;
  type: string | null;
  messagePreview: string | null;
}

// =====================================================
// CONSTANTS (ALFA.3.1)
// =====================================================

/**
 * TTL for messageId dedupe cache (5 minutes in ms)
 * Z-API may retry webhooks within seconds, 5 min is safe margin
 */
const DEDUPE_TTL_MS = 5 * 60 * 1000;

/**
 * Max entries in dedupe cache before triggering cleanup
 */
const DEDUPE_MAX_ENTRIES = 5000;

// =====================================================
// PURE HELPER FUNCTIONS (ALFA.4)
// =====================================================

/**
 * UUID regex for validation (accepts any version, not just v4)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if string is a valid UUID (any version)
 */
export function isValidUuid(value: string | undefined): boolean {
  if (!value) return false;
  return UUID_REGEX.test(value);
}

/**
 * Summarizes payload for safe logging (no full message content)
 * ALFA.4: Privacy-safe logging
 */
export function summarizePayload(payload: ZapiPayload): PayloadSummary {
  const message = payload.text?.message || '';
  // Truncate message to 120 chars for preview (safe for logs)
  const messagePreview = message.length > 120
    ? message.slice(0, 120) + '...'
    : message || null;

  return {
    instanceId: payload.instanceId || null,
    connectedPhone: payload.connectedPhone || null,
    phone: payload.phone || payload.from || null,
    chatName: payload.chatName || null,
    isGroup: payload.isGroup === true,
    isNewsletter: payload.isNewsletter === true,
    fromMe: payload.fromMe === true,
    hasText: !!payload.text?.message,
    messageId: payload.messageId || null,
    type: payload.type || null,
    messagePreview,
  };
}

/**
 * Determines if payload should be ignored (group, newsletter, fromMe, no content)
 * ALFA.4: Filter noise before processing
 * Updated: Now accepts audio messages for transcription
 * Updated: Now accepts #eu/#ia commands from agent (fromMe=true)
 */
export function shouldIgnorePayload(payload: ZapiPayload): { ignore: boolean; reason: string | null; isAudio: boolean; isAgentCommand: boolean } {
  const message = payload.text?.message?.trim().toLowerCase() || '';

  // Sent by us - but allow #eu and #ia commands from agent
  if (payload.fromMe === true) {
    // Allow agent commands (#eu, #ia) to pass through
    if (message.startsWith('#eu') || message.startsWith('#ia')) {
      return { ignore: false, reason: null, isAudio: false, isAgentCommand: true };
    }
    return { ignore: true, reason: 'from_me', isAudio: false, isAgentCommand: false };
  }

  // Group message
  if (payload.isGroup === true) {
    return { ignore: true, reason: 'is_group', isAudio: false, isAgentCommand: false };
  }

  // Newsletter/broadcast
  if (payload.isNewsletter === true) {
    return { ignore: true, reason: 'is_newsletter', isAudio: false, isAgentCommand: false };
  }

  // Check for audio message
  const isAudio = payload.type === 'audio' || !!payload.audio?.audioUrl;
  if (isAudio) {
    return { ignore: false, reason: null, isAudio: true, isAgentCommand: false };
  }

  // No text message and not audio
  if (!payload.text?.message) {
    return { ignore: true, reason: 'no_text', isAudio: false, isAgentCommand: false };
  }

  return { ignore: false, reason: null, isAudio: false, isAgentCommand: false };
}

// =====================================================
// CONTROLLER
// =====================================================

/**
 * Webhook para receber mensagens do Z-API
 * Integrado com Alexis IA para processamento inteligente
 * ALFA.4: Hardened with filtering and safe logging
 */
@Public()
@Controller('webhook/zapi')
export class ZapiWebhookController {
  private readonly logger = new Logger(ZapiWebhookController.name);

  /**
   * ALFA.3.1: In-memory cache for deduplicating webhook retries
   * Key: messageId from Z-API, Value: timestamp when first processed
   */
  private readonly processedMessageIds = new Map<string, number>();

  constructor(
    private readonly alexisService: AlexisService,
    private readonly whatsappService: WhatsAppService,
    private readonly audioTranscription: AudioTranscriptionService,
  ) {}

  // =====================================================
  // DEDUPE HELPERS (ALFA.3.1)
  // =====================================================

  /**
   * Check if messageId was already processed (within TTL)
   * Returns true if duplicate, false if new message
   */
  private isMessageProcessed(messageId: string): boolean {
    const processedAt = this.processedMessageIds.get(messageId);
    if (!processedAt) {
      return false;
    }

    // Check if TTL expired
    if (Date.now() - processedAt > DEDUPE_TTL_MS) {
      this.processedMessageIds.delete(messageId);
      return false;
    }

    return true;
  }

  /**
   * Mark messageId as processed
   */
  private markMessageProcessed(messageId: string): void {
    this.processedMessageIds.set(messageId, Date.now());

    // Cleanup if cache grows too large
    if (this.processedMessageIds.size > DEDUPE_MAX_ENTRIES) {
      this.purgeExpiredMessages();
    }
  }

  /**
   * Remove expired entries from cache
   */
  private purgeExpiredMessages(): void {
    const now = Date.now();
    let purged = 0;

    for (const [messageId, timestamp] of this.processedMessageIds) {
      if (now - timestamp > DEDUPE_TTL_MS) {
        this.processedMessageIds.delete(messageId);
        purged++;
      }
    }

    if (purged > 0) {
      this.logger.debug(`Purged ${purged} expired messageIds from dedupe cache`);
    }
  }

  /**
   * Recebe mensagens do Z-API
   * Documentacao: https://developer.z-api.io/webhooks/on-message-received
   */
  @Post('messages')
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(@Body() payload: ZapiPayload) {
    // ALFA.4: Safe logging - summarize payload instead of full dump
    const summary = summarizePayload(payload);
    this.logger.log(`Webhook recebido: ${JSON.stringify(summary)}`);

    try {
      // ALFA.3.1: Dedupe by messageId (Z-API may retry webhooks)
      if (summary.messageId && this.isMessageProcessed(summary.messageId)) {
        this.logger.debug(`DEDUPED inbound messageId=${summary.messageId}`);
        return { received: true, deduped: true };
      }

      // ALFA.4: Check if should ignore (group, newsletter, fromMe, no content)
      const ignoreCheck = shouldIgnorePayload(payload);
      if (ignoreCheck.ignore) {
        this.logger.debug(`Ignorando payload: ${ignoreCheck.reason}`);
        return { received: true, ignored: ignoreCheck.reason };
      }

      const phone = this.extractPhone(payload.phone || payload.from || '');
      const clientName = payload.senderName || payload.pushName || undefined;

      // ========== PROCESSAMENTO DE ÁUDIO ==========
      let message: string;

      if (ignoreCheck.isAudio && payload.audio?.audioUrl) {
        this.logger.log(`Áudio recebido de ${phone}, iniciando transcrição...`);

        const transcription = await this.audioTranscription.transcribeFromUrl(payload.audio.audioUrl);

        if (!transcription.success || !transcription.text) {
          // Falha na transcrição - envia mensagem amigável
          this.logger.warn(`Falha ao transcrever áudio: ${transcription.error}`);

          const errorResponse = this.audioTranscription.getAudioErrorResponse();

          // Resolve salonId para enviar resposta
          const salonId = await this.resolveSalonId();
          if (salonId) {
            await this.whatsappService.sendDirectMessage(phone, errorResponse);
          }

          return { received: true, audioError: transcription.error };
        }

        message = transcription.text;
        this.logger.log(`Áudio transcrito de ${phone}: "${message.substring(0, 50)}..."`);
      } else {
        message = payload.text!.message!.trim();
      }

      this.logger.log(`Mensagem de ${phone} (${clientName || 'sem nome'}): "${message.substring(0, 50)}..."`);

      // ALFA.3.1: Mark messageId as processed BEFORE calling Alexis
      if (summary.messageId) {
        this.markMessageProcessed(summary.messageId);
      }

      // ALFA.4: Resolve salon with env vars and deterministic fallback
      const salonId = await this.resolveSalonId();

      if (!salonId) {
        this.logger.warn(`Nenhum salao encontrado para processar mensagem de ${phone}`);
        return { received: true };
      }

      // ========== CHECK HORÁRIO DE FUNCIONAMENTO ==========
      // Só restringe mensagens de clientes; comandos do agente (#eu/#ia) passam sempre
      if (!ignoreCheck.isAgentCommand) {
        const [aiConfig] = await db
          .select({
            workingHoursEnabled: schema.aiSettings.workingHoursEnabled,
            workingHoursStart: schema.aiSettings.workingHoursStart,
            workingHoursEnd: schema.aiSettings.workingHoursEnd,
          })
          .from(schema.aiSettings)
          .where(eq(schema.aiSettings.salonId, salonId))
          .limit(1);

        if (aiConfig?.workingHoursEnabled) {
          const now = new Date();
          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

          if (currentTime < (aiConfig.workingHoursStart || '08:00') || currentTime >= (aiConfig.workingHoursEnd || '20:00')) {
            this.logger.log(`Fora do horário de funcionamento (${currentTime}). Mensagem de ${phone} salva mas Alexia não responde.`);
            return { received: true, outsideWorkingHours: true };
          }
        }
      }

      // Processa mensagem com Alexis
      // Se é comando do agente (#eu/#ia), usa senderType 'agent'
      const senderType = ignoreCheck.isAgentCommand ? 'agent' : 'client';
      if (ignoreCheck.isAgentCommand) {
        this.logger.log(`Comando de agente detectado: ${message}`);
      }

      const result = await this.alexisService.processWhatsAppMessage(
        salonId,
        phone,
        message,
        clientName,
        undefined, // senderId
        senderType,
      );

      this.logger.log(`Alexis processou: intent=${result.intent}, shouldSend=${result.shouldSend}`);

      // Envia resposta se necessario
      if (result.shouldSend && result.response) {
        const sendResult = await this.whatsappService.sendDirectMessage(phone, result.response);

        if (sendResult.success) {
          this.logger.log(`Resposta enviada para ${phone}`);
        } else {
          this.logger.error(`Erro ao enviar resposta: ${sendResult.error}`);
        }
      }

      return { received: true, intent: result.intent };
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
      return { received: true, error: 'Internal error' };
    }
  }

  /**
   * Webhook alternativo para status de mensagens
   */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async handleMessageStatus(@Body() payload: ZapiPayload) {
    // ALFA.4: Safe logging for status webhook too
    this.logger.debug(`Status webhook: messageId=${payload.messageId}, status=${payload.status}`);

    // Atualiza status da mensagem (DELIVERED, READ, etc)
    if (payload.messageId && payload.status) {
      try {
        const statusMap: Record<string, string> = {
          'DELIVERY_ACK': 'DELIVERED',
          'READ': 'READ',
          'PLAYED': 'READ',
        };

        const newStatus = statusMap[payload.status];
        if (newStatus) {
          await db
            .update(schema.appointmentNotifications)
            .set({
              status: newStatus as any,
              deliveredAt: newStatus === 'DELIVERED' ? new Date() : undefined,
              readAt: newStatus === 'READ' ? new Date() : undefined,
              updatedAt: new Date(),
            })
            .where(eq(schema.appointmentNotifications.providerMessageId, payload.messageId));
        }
      } catch (error) {
        this.logger.error('Erro ao atualizar status:', error);
      }
    }

    return { received: true };
  }

  /**
   * ALFA.4: Resolve salonId with priority:
   * 1. ZAPI_DEFAULT_SALON_ID env (UUID)
   * 2. ZAPI_DEFAULT_SALON_SLUG env (string)
   * 3. Deterministic fallback: first salon by createdAt asc
   */
  private async resolveSalonId(): Promise<string | null> {
    // Priority 1: Direct UUID from env
    const envSalonId = process.env.ZAPI_DEFAULT_SALON_ID;
    if (envSalonId) {
      if (isValidUuid(envSalonId)) {
        this.logger.debug(`Usando ZAPI_DEFAULT_SALON_ID: ${envSalonId}`);
        return envSalonId;
      } else {
        this.logger.warn(`ZAPI_DEFAULT_SALON_ID invalido (nao e UUID): ${envSalonId}`);
      }
    }

    // Priority 2: Slug from env
    const envSalonSlug = process.env.ZAPI_DEFAULT_SALON_SLUG;
    if (envSalonSlug) {
      const [salon] = await db
        .select({ id: schema.salons.id })
        .from(schema.salons)
        .where(eq(schema.salons.slug, envSalonSlug))
        .limit(1);

      if (salon) {
        this.logger.debug(`Usando ZAPI_DEFAULT_SALON_SLUG: ${envSalonSlug} => ${salon.id}`);
        return salon.id;
      } else {
        this.logger.warn(`Salao nao encontrado para ZAPI_DEFAULT_SALON_SLUG: ${envSalonSlug}`);
      }
    }

    // Priority 3: Deterministic fallback - first salon by createdAt
    const [firstSalon] = await db
      .select({ id: schema.salons.id, name: schema.salons.name })
      .from(schema.salons)
      .where(eq(schema.salons.active, true))
      .orderBy(asc(schema.salons.createdAt))
      .limit(1);

    if (firstSalon) {
      this.logger.debug(`Fallback: usando primeiro salao ativo: ${firstSalon.name} (${firstSalon.id})`);
      return firstSalon.id;
    }

    return null;
  }

  /**
   * Extrai numero de telefone do payload
   */
  private extractPhone(phone: string): string {
    if (!phone) return '';
    // Remove @c.us e outros sufixos do WhatsApp
    return phone.replace(/@.*$/, '').replace(/\D/g, '');
  }
}

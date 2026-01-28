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
 * Determines if payload should be ignored (group, newsletter, fromMe, no text)
 * ALFA.4: Filter noise before processing
 */
export function shouldIgnorePayload(payload: ZapiPayload): { ignore: boolean; reason: string | null } {
  // No text message
  if (!payload.text?.message) {
    return { ignore: true, reason: 'no_text' };
  }

  // Sent by us
  if (payload.fromMe === true) {
    return { ignore: true, reason: 'from_me' };
  }

  // Group message
  if (payload.isGroup === true) {
    return { ignore: true, reason: 'is_group' };
  }

  // Newsletter/broadcast
  if (payload.isNewsletter === true) {
    return { ignore: true, reason: 'is_newsletter' };
  }

  return { ignore: false, reason: null };
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

  constructor(
    private readonly alexisService: AlexisService,
    private readonly whatsappService: WhatsAppService,
  ) {}

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
      // ALFA.4: Check if should ignore (group, newsletter, fromMe, no text)
      const ignoreCheck = shouldIgnorePayload(payload);
      if (ignoreCheck.ignore) {
        this.logger.debug(`Ignorando payload: ${ignoreCheck.reason}`);
        return { received: true, ignored: ignoreCheck.reason };
      }

      const phone = this.extractPhone(payload.phone || payload.from || '');
      const message = payload.text!.message!.trim();
      const clientName = payload.senderName || payload.pushName || undefined;

      this.logger.log(`Mensagem de ${phone} (${clientName || 'sem nome'}): "${summary.messagePreview}"`);

      // ALFA.4: Resolve salon with env vars and deterministic fallback
      const salonId = await this.resolveSalonId();

      if (!salonId) {
        this.logger.warn(`Nenhum salao encontrado para processar mensagem de ${phone}`);
        return { received: true };
      }

      // Processa mensagem com Alexis
      const result = await this.alexisService.processWhatsAppMessage(
        salonId,
        phone,
        message,
        clientName,
        undefined, // senderId
        'client',
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

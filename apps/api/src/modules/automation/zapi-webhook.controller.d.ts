import { AlexisService } from '../alexis/alexis.service';
import { WhatsAppService } from './whatsapp.service';
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
/**
 * Validates if string is a valid UUID (any version)
 */
export declare function isValidUuid(value: string | undefined): boolean;
/**
 * Summarizes payload for safe logging (no full message content)
 * ALFA.4: Privacy-safe logging
 */
export declare function summarizePayload(payload: ZapiPayload): PayloadSummary;
/**
 * Determines if payload should be ignored (group, newsletter, fromMe, no text)
 * ALFA.4: Filter noise before processing
 */
export declare function shouldIgnorePayload(payload: ZapiPayload): {
    ignore: boolean;
    reason: string | null;
};
/**
 * Webhook para receber mensagens do Z-API
 * Integrado com Alexis IA para processamento inteligente
 * ALFA.4: Hardened with filtering and safe logging
 */
export declare class ZapiWebhookController {
    private readonly alexisService;
    private readonly whatsappService;
    private readonly logger;
    /**
     * ALFA.3.1: In-memory cache for deduplicating webhook retries
     * Key: messageId from Z-API, Value: timestamp when first processed
     */
    private readonly processedMessageIds;
    constructor(alexisService: AlexisService, whatsappService: WhatsAppService);
    /**
     * Check if messageId was already processed (within TTL)
     * Returns true if duplicate, false if new message
     */
    private isMessageProcessed;
    /**
     * Mark messageId as processed
     */
    private markMessageProcessed;
    /**
     * Remove expired entries from cache
     */
    private purgeExpiredMessages;
    /**
     * Recebe mensagens do Z-API
     * Documentacao: https://developer.z-api.io/webhooks/on-message-received
     */
    handleIncomingMessage(payload: ZapiPayload): Promise<{
        received: boolean;
        deduped: boolean;
        ignored?: never;
        intent?: never;
        error?: never;
    } | {
        received: boolean;
        ignored: string | null;
        deduped?: never;
        intent?: never;
        error?: never;
    } | {
        received: boolean;
        deduped?: never;
        ignored?: never;
        intent?: never;
        error?: never;
    } | {
        received: boolean;
        intent: string;
        deduped?: never;
        ignored?: never;
        error?: never;
    } | {
        received: boolean;
        error: string;
        deduped?: never;
        ignored?: never;
        intent?: never;
    }>;
    /**
     * Webhook alternativo para status de mensagens
     */
    handleMessageStatus(payload: ZapiPayload): Promise<{
        received: boolean;
    }>;
    /**
     * ALFA.4: Resolve salonId with priority:
     * 1. ZAPI_DEFAULT_SALON_ID env (UUID)
     * 2. ZAPI_DEFAULT_SALON_SLUG env (string)
     * 3. Deterministic fallback: first salon by createdAt asc
     */
    private resolveSalonId;
    /**
     * Extrai numero de telefone do payload
     */
    private extractPhone;
}
//# sourceMappingURL=zapi-webhook.controller.d.ts.map
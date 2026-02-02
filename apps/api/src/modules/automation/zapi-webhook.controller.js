"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapiWebhookController = void 0;
exports.isValidUuid = isValidUuid;
exports.summarizePayload = summarizePayload;
exports.shouldIgnorePayload = shouldIgnorePayload;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
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
function isValidUuid(value) {
    if (!value)
        return false;
    return UUID_REGEX.test(value);
}
/**
 * Summarizes payload for safe logging (no full message content)
 * ALFA.4: Privacy-safe logging
 */
function summarizePayload(payload) {
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
function shouldIgnorePayload(payload) {
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
let ZapiWebhookController = (() => {
    let _classDecorators = [(0, public_decorator_1.Public)(), (0, common_1.Controller)('webhook/zapi')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _handleIncomingMessage_decorators;
    let _handleMessageStatus_decorators;
    var ZapiWebhookController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _handleIncomingMessage_decorators = [(0, common_1.Post)('messages'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _handleMessageStatus_decorators = [(0, common_1.Post)('status'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            __esDecorate(this, null, _handleIncomingMessage_decorators, { kind: "method", name: "handleIncomingMessage", static: false, private: false, access: { has: obj => "handleIncomingMessage" in obj, get: obj => obj.handleIncomingMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleMessageStatus_decorators, { kind: "method", name: "handleMessageStatus", static: false, private: false, access: { has: obj => "handleMessageStatus" in obj, get: obj => obj.handleMessageStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ZapiWebhookController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        alexisService = __runInitializers(this, _instanceExtraInitializers);
        whatsappService;
        logger = new common_1.Logger(ZapiWebhookController.name);
        /**
         * ALFA.3.1: In-memory cache for deduplicating webhook retries
         * Key: messageId from Z-API, Value: timestamp when first processed
         */
        processedMessageIds = new Map();
        constructor(alexisService, whatsappService) {
            this.alexisService = alexisService;
            this.whatsappService = whatsappService;
        }
        // =====================================================
        // DEDUPE HELPERS (ALFA.3.1)
        // =====================================================
        /**
         * Check if messageId was already processed (within TTL)
         * Returns true if duplicate, false if new message
         */
        isMessageProcessed(messageId) {
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
        markMessageProcessed(messageId) {
            this.processedMessageIds.set(messageId, Date.now());
            // Cleanup if cache grows too large
            if (this.processedMessageIds.size > DEDUPE_MAX_ENTRIES) {
                this.purgeExpiredMessages();
            }
        }
        /**
         * Remove expired entries from cache
         */
        purgeExpiredMessages() {
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
        async handleIncomingMessage(payload) {
            // ALFA.4: Safe logging - summarize payload instead of full dump
            const summary = summarizePayload(payload);
            this.logger.log(`Webhook recebido: ${JSON.stringify(summary)}`);
            try {
                // ALFA.3.1: Dedupe by messageId (Z-API may retry webhooks)
                if (summary.messageId && this.isMessageProcessed(summary.messageId)) {
                    this.logger.debug(`DEDUPED inbound messageId=${summary.messageId}`);
                    return { received: true, deduped: true };
                }
                // ALFA.4: Check if should ignore (group, newsletter, fromMe, no text)
                const ignoreCheck = shouldIgnorePayload(payload);
                if (ignoreCheck.ignore) {
                    this.logger.debug(`Ignorando payload: ${ignoreCheck.reason}`);
                    return { received: true, ignored: ignoreCheck.reason };
                }
                const phone = this.extractPhone(payload.phone || payload.from || '');
                const message = payload.text.message.trim();
                const clientName = payload.senderName || payload.pushName || undefined;
                this.logger.log(`Mensagem de ${phone} (${clientName || 'sem nome'}): "${summary.messagePreview}"`);
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
                // Processa mensagem com Alexis
                const result = await this.alexisService.processWhatsAppMessage(salonId, phone, message, clientName, undefined, // senderId
                'client');
                this.logger.log(`Alexis processou: intent=${result.intent}, shouldSend=${result.shouldSend}`);
                // Envia resposta se necessario
                if (result.shouldSend && result.response) {
                    const sendResult = await this.whatsappService.sendDirectMessage(phone, result.response);
                    if (sendResult.success) {
                        this.logger.log(`Resposta enviada para ${phone}`);
                    }
                    else {
                        this.logger.error(`Erro ao enviar resposta: ${sendResult.error}`);
                    }
                }
                return { received: true, intent: result.intent };
            }
            catch (error) {
                this.logger.error('Erro ao processar webhook:', error);
                return { received: true, error: 'Internal error' };
            }
        }
        /**
         * Webhook alternativo para status de mensagens
         */
        async handleMessageStatus(payload) {
            // ALFA.4: Safe logging for status webhook too
            this.logger.debug(`Status webhook: messageId=${payload.messageId}, status=${payload.status}`);
            // Atualiza status da mensagem (DELIVERED, READ, etc)
            if (payload.messageId && payload.status) {
                try {
                    const statusMap = {
                        'DELIVERY_ACK': 'DELIVERED',
                        'READ': 'READ',
                        'PLAYED': 'READ',
                    };
                    const newStatus = statusMap[payload.status];
                    if (newStatus) {
                        await connection_1.db
                            .update(schema.appointmentNotifications)
                            .set({
                            status: newStatus,
                            deliveredAt: newStatus === 'DELIVERED' ? new Date() : undefined,
                            readAt: newStatus === 'READ' ? new Date() : undefined,
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema.appointmentNotifications.providerMessageId, payload.messageId));
                    }
                }
                catch (error) {
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
        async resolveSalonId() {
            // Priority 1: Direct UUID from env
            const envSalonId = process.env.ZAPI_DEFAULT_SALON_ID;
            if (envSalonId) {
                if (isValidUuid(envSalonId)) {
                    this.logger.debug(`Usando ZAPI_DEFAULT_SALON_ID: ${envSalonId}`);
                    return envSalonId;
                }
                else {
                    this.logger.warn(`ZAPI_DEFAULT_SALON_ID invalido (nao e UUID): ${envSalonId}`);
                }
            }
            // Priority 2: Slug from env
            const envSalonSlug = process.env.ZAPI_DEFAULT_SALON_SLUG;
            if (envSalonSlug) {
                const [salon] = await connection_1.db
                    .select({ id: schema.salons.id })
                    .from(schema.salons)
                    .where((0, drizzle_orm_1.eq)(schema.salons.slug, envSalonSlug))
                    .limit(1);
                if (salon) {
                    this.logger.debug(`Usando ZAPI_DEFAULT_SALON_SLUG: ${envSalonSlug} => ${salon.id}`);
                    return salon.id;
                }
                else {
                    this.logger.warn(`Salao nao encontrado para ZAPI_DEFAULT_SALON_SLUG: ${envSalonSlug}`);
                }
            }
            // Priority 3: Deterministic fallback - first salon by createdAt
            const [firstSalon] = await connection_1.db
                .select({ id: schema.salons.id, name: schema.salons.name })
                .from(schema.salons)
                .where((0, drizzle_orm_1.eq)(schema.salons.active, true))
                .orderBy((0, drizzle_orm_1.asc)(schema.salons.createdAt))
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
        extractPhone(phone) {
            if (!phone)
                return '';
            // Remove @c.us e outros sufixos do WhatsApp
            return phone.replace(/@.*$/, '').replace(/\D/g, '');
        }
    };
    return ZapiWebhookController = _classThis;
})();
exports.ZapiWebhookController = ZapiWebhookController;
//# sourceMappingURL=zapi-webhook.controller.js.map
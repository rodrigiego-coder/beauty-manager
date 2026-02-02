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
exports.AlexisWhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AlexisWhatsAppService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AlexisWhatsAppService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisWhatsAppService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(AlexisWhatsAppService.name);
        /**
         * Processar webhook do WhatsApp
         */
        async processWebhook(payload) {
            try {
                const entry = payload.entry?.[0];
                const change = entry?.changes?.[0];
                const value = change?.value;
                if (!value?.messages?.length) {
                    // Pode ser um status update
                    if (value?.statuses?.length) {
                        await this.handleStatusUpdate(value.statuses[0]);
                    }
                    return null;
                }
                const message = value.messages[0];
                const contact = value.contacts?.[0];
                const phoneNumberId = value.metadata?.phone_number_id;
                // Buscar salão pelo phone_number_id
                const [settings] = await connection_1.db
                    .select()
                    .from(schema_1.alexisSettings)
                    .where((0, drizzle_orm_1.eq)(schema_1.alexisSettings.whatsappIntegrationId, phoneNumberId));
                if (!settings) {
                    this.logger.warn(`Salão não encontrado para phone_number_id: ${phoneNumberId}`);
                    return null;
                }
                // Extrair conteúdo da mensagem
                let messageContent = '';
                let messageType = message.type || 'text';
                switch (message.type) {
                    case 'text':
                        messageContent = message.text?.body || '';
                        break;
                    case 'audio':
                        messageContent = '[Áudio recebido]';
                        break;
                    case 'image':
                        messageContent = message.image?.caption || '[Imagem recebida]';
                        break;
                    case 'document':
                        messageContent = `[Documento: ${message.document?.filename || 'arquivo'}]`;
                        break;
                    case 'location':
                        messageContent = `[Localização: ${message.location?.name || 'enviada'}]`;
                        break;
                    case 'contact':
                        messageContent = `[Contato: ${message.contact?.name?.formatted_name || 'enviado'}]`;
                        break;
                    default:
                        messageContent = '[Mensagem não suportada]';
                }
                return {
                    salonId: settings.salonId,
                    clientPhone: message.from,
                    clientName: contact?.profile?.name,
                    message: messageContent,
                    messageType,
                    whatsappMessageId: message.id,
                };
            }
            catch (error) {
                this.logger.error('Erro ao processar webhook WhatsApp:', error);
                return null;
            }
        }
        /**
         * Enviar mensagem pelo WhatsApp
         */
        async sendMessage(salonId, to, message, messageType = 'text') {
            try {
                const [settings] = await connection_1.db
                    .select()
                    .from(schema_1.alexisSettings)
                    .where((0, drizzle_orm_1.eq)(schema_1.alexisSettings.salonId, salonId));
                if (!settings?.whatsappIntegrationId) {
                    return {
                        success: false,
                        error: 'WhatsApp não configurado para este salão',
                    };
                }
                const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
                if (!accessToken) {
                    this.logger.warn('WHATSAPP_ACCESS_TOKEN não configurado - modo simulado');
                    return { success: true, messageId: `sim_${Date.now()}` };
                }
                const url = `https://graph.facebook.com/v18.0/${settings.whatsappIntegrationId}/messages`;
                const body = {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to.replace(/\D/g, ''), // Remove caracteres não numéricos
                    type: messageType,
                    text: messageType === 'text' ? { body: message } : undefined,
                };
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                const result = await response.json();
                if (response.ok) {
                    return {
                        success: true,
                        messageId: result.messages?.[0]?.id,
                    };
                }
                else {
                    return {
                        success: false,
                        error: result.error?.message || 'Erro ao enviar mensagem',
                    };
                }
            }
            catch (error) {
                this.logger.error('Erro ao enviar mensagem WhatsApp:', error);
                return {
                    success: false,
                    error: error?.message || 'Erro desconhecido',
                };
            }
        }
        /**
         * Atualizar status da mensagem
         */
        async handleStatusUpdate(status) {
            const [message] = await connection_1.db
                .select()
                .from(schema_1.alexisMessages)
                .where((0, drizzle_orm_1.eq)(schema_1.alexisMessages.whatsappMessageId, status.id))
                .limit(1);
            if (!message)
                return;
            const updates = {};
            const timestamp = new Date(parseInt(status.timestamp) * 1000);
            if (status.status === 'delivered') {
                updates.deliveredAt = timestamp;
            }
            else if (status.status === 'read') {
                updates.readAt = timestamp;
            }
            if (Object.keys(updates).length > 0) {
                await connection_1.db
                    .update(schema_1.alexisMessages)
                    .set(updates)
                    .where((0, drizzle_orm_1.eq)(schema_1.alexisMessages.id, message.id));
            }
        }
        /**
         * Verificar se está dentro do horário de atendimento
         */
        async isWithinOperatingHours(salonId) {
            const [settings] = await connection_1.db
                .select()
                .from(schema_1.alexisSettings)
                .where((0, drizzle_orm_1.eq)(schema_1.alexisSettings.salonId, salonId));
            if (!settings?.operatingHoursEnabled) {
                return true; // Se não configurado, sempre disponível
            }
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const start = settings.operatingHoursStart || '08:00';
            const end = settings.operatingHoursEnd || '20:00';
            return currentTime >= start && currentTime <= end;
        }
        /**
         * Obter mensagem de fora do horário
         */
        async getOutOfHoursMessage(salonId) {
            const [settings] = await connection_1.db
                .select()
                .from(schema_1.alexisSettings)
                .where((0, drizzle_orm_1.eq)(schema_1.alexisSettings.salonId, salonId));
            return settings?.outOfHoursMessage || 'Estamos fora do horário de atendimento. Retornaremos em breve!';
        }
        /**
         * Validar webhook do WhatsApp (verificação inicial)
         */
        verifyWebhook(mode, token, challenge) {
            const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
            if (mode === 'subscribe' && token === verifyToken) {
                return challenge;
            }
            return null;
        }
    };
    return AlexisWhatsAppService = _classThis;
})();
exports.AlexisWhatsAppService = AlexisWhatsAppService;
//# sourceMappingURL=alexis-whatsapp.service.js.map
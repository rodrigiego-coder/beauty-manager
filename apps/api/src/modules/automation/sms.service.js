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
exports.SMSService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * SMSService
 * Handles SMS message sending via Twilio, Zenvia, or AWS SNS
 */
let SMSService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SMSService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SMSService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(SMSService.name);
        /**
         * Envia SMS
         */
        async sendSMS(salonId, phoneNumber, message) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.smsEnabled) {
                return { success: false, error: 'SMS não está habilitado.' };
            }
            if (!settings.smsApiKey) {
                return { success: false, error: 'Credenciais do SMS não configuradas.' };
            }
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            try {
                switch (settings.smsProvider) {
                    case 'TWILIO':
                        return await this.sendViaTwilio(settings, formattedPhone, message);
                    case 'ZENVIA':
                        return await this.sendViaZenvia(settings, formattedPhone, message);
                    case 'AWS_SNS':
                        return await this.sendViaAWS(settings, formattedPhone, message);
                    default:
                        return { success: false, error: 'Provedor não suportado.' };
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`SMS send error: ${errorMessage}`);
                return { success: false, error: errorMessage };
            }
        }
        /**
         * Verifica saldo disponível (Twilio)
         */
        async getBalance(salonId) {
            const settings = await this.getSettings(salonId);
            if (!settings || settings.smsProvider !== 'TWILIO') {
                return null;
            }
            try {
                const accountSid = settings.smsAccountSid;
                const authToken = settings.smsApiKey;
                if (!accountSid || !authToken) {
                    return null;
                }
                const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`, {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                    },
                });
                if (!response.ok) {
                    return null;
                }
                const data = (await response.json());
                return {
                    balance: parseFloat(data.balance),
                    currency: data.currency,
                };
            }
            catch {
                return null;
            }
        }
        /**
         * Testa conexão com provedor SMS
         */
        async testConnection(salonId) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.smsApiKey) {
                return { connected: false, error: 'Credenciais não configuradas.' };
            }
            try {
                if (settings.smsProvider === 'TWILIO') {
                    const accountSid = settings.smsAccountSid;
                    const authToken = settings.smsApiKey;
                    if (!accountSid) {
                        return { connected: false, error: 'Account SID não configurado.' };
                    }
                    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                        },
                    });
                    if (response.ok) {
                        return { connected: true };
                    }
                    return { connected: false, error: 'Credenciais inválidas.' };
                }
                // Para outros provedores
                return { connected: true };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
                return { connected: false, error: errorMessage };
            }
        }
        // ==================== PRIVATE METHODS ====================
        async getSettings(salonId) {
            return connection_1.db.query.automationSettings.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.automationSettings.salonId, salonId),
            });
        }
        formatPhoneNumber(phone) {
            // Remove tudo que não for número
            let cleaned = phone.replace(/\D/g, '');
            // Adiciona código do país se não tiver
            if (!cleaned.startsWith('55')) {
                cleaned = '55' + cleaned;
            }
            return '+' + cleaned;
        }
        async sendViaTwilio(settings, phone, message) {
            const accountSid = settings.smsAccountSid;
            const authToken = settings.smsApiKey;
            const fromNumber = settings.smsPhoneNumber;
            if (!accountSid || !authToken || !fromNumber) {
                return { success: false, error: 'Credenciais Twilio incompletas.' };
            }
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    From: fromNumber,
                    To: phone,
                    Body: message,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                this.logger.error(`Twilio SMS error: ${error}`);
                return { success: false, error: 'Erro ao enviar SMS via Twilio.' };
            }
            const data = (await response.json());
            return {
                success: true,
                messageId: data.sid,
                cost: data.price ? Math.abs(parseFloat(data.price)) : undefined,
            };
        }
        async sendViaZenvia(settings, phone, message) {
            const apiKey = settings.smsApiKey;
            const from = settings.smsPhoneNumber || 'BeautyManager';
            if (!apiKey) {
                return { success: false, error: 'API Key Zenvia não configurada.' };
            }
            const response = await fetch('https://api.zenvia.com/v2/channels/sms/messages', {
                method: 'POST',
                headers: {
                    'X-API-TOKEN': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from,
                    to: phone.replace('+', ''),
                    contents: [{ type: 'text', text: message }],
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                this.logger.error(`Zenvia SMS error: ${error}`);
                return { success: false, error: 'Erro ao enviar SMS via Zenvia.' };
            }
            const data = (await response.json());
            return {
                success: true,
                messageId: data.id,
            };
        }
        async sendViaAWS(settings, _phone, _message) {
            // AWS SNS requer AWS SDK - implementação simplificada
            // Na prática, usaria @aws-sdk/client-sns
            const accessKeyId = settings.smsAccountSid;
            const secretAccessKey = settings.smsApiKey;
            if (!accessKeyId || !secretAccessKey) {
                return { success: false, error: 'Credenciais AWS não configuradas.' };
            }
            this.logger.warn('AWS SNS não implementado completamente. Use Twilio ou Zenvia.');
            return {
                success: false,
                error: 'AWS SNS requer configuração adicional. Use Twilio ou Zenvia.',
            };
        }
    };
    return SMSService = _classThis;
})();
exports.SMSService = SMSService;
//# sourceMappingURL=sms.service.js.map
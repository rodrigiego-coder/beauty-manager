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
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
/**
 * WhatsAppService
 * Handles WhatsApp Business API message sending
 * Supports: META, TWILIO, ZENVIA, ZAPI
 */
let WhatsAppService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WhatsAppService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WhatsAppService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(WhatsAppService.name);
        // Z-API Configuration from environment
        zapiInstanceId = process.env.ZAPI_INSTANCE_ID;
        zapiToken = process.env.ZAPI_TOKEN;
        zapiBaseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io/instances';
        zapiClientToken = process.env.ZAPI_CLIENT_TOKEN;
        /**
         * Envia mensagem de texto via WhatsApp
         */
        async sendMessage(salonId, phoneNumber, message) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.whatsappEnabled) {
                return { success: false, error: 'WhatsApp não está habilitado.' };
            }
            if (!settings.whatsappApiKey) {
                return { success: false, error: 'Credenciais do WhatsApp não configuradas.' };
            }
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            try {
                switch (settings.whatsappProvider) {
                    case 'META':
                        return await this.sendViaMeta(settings, formattedPhone, message);
                    case 'TWILIO':
                        return await this.sendViaTwilio(settings, formattedPhone, message);
                    case 'ZENVIA':
                        return await this.sendViaZenvia(settings, formattedPhone, message);
                    case 'ZAPI':
                        return await this.sendViaZapi(formattedPhone, message);
                    default:
                        // Tenta Z-API como fallback se configurado
                        if (this.zapiInstanceId && this.zapiToken) {
                            return await this.sendViaZapi(formattedPhone, message);
                        }
                        return { success: false, error: 'Provedor não suportado.' };
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`WhatsApp send error: ${errorMessage}`);
                return { success: false, error: errorMessage };
            }
        }
        /**
         * Envia mensagem diretamente via Z-API (sem precisar de configurações do salão)
         * Útil para OTP e testes
         */
        async sendDirectMessage(phoneNumber, message) {
            this.logger.log(`[DIRECT] Telefone recebido: ${phoneNumber}`);
            if (!this.zapiInstanceId || !this.zapiToken) {
                this.logger.error('Z-API não configurado. Verifique ZAPI_INSTANCE_ID e ZAPI_TOKEN no .env');
                return { success: false, error: 'Z-API não configurado.' };
            }
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            this.logger.log(`[DIRECT] Telefone formatado: ${formattedPhone}`);
            return this.sendViaZapi(formattedPhone, message);
        }
        /**
         * Envia código OTP via WhatsApp
         */
        async sendOtpCode(phoneNumber, code, expirationMinutes = 10) {
            this.logger.log(`[OTP] Iniciando envio - Telefone: ${phoneNumber}, Código: ${code}`);
            this.logger.log(`[OTP] ZAPI_INSTANCE_ID: ${this.zapiInstanceId ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
            this.logger.log(`[OTP] ZAPI_TOKEN: ${this.zapiToken ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
            this.logger.log(`[OTP] ZAPI_CLIENT_TOKEN: ${this.zapiClientToken ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
            const message = `Seu codigo de verificacao Beauty Manager e: *${code}*\n\nValido por ${expirationMinutes} minutos.`;
            const result = await this.sendDirectMessage(phoneNumber, message);
            this.logger.log(`[OTP] Resultado do envio: ${JSON.stringify(result)}`);
            return result;
        }
        /**
         * Envia credenciais de acesso ao sistema para novo profissional
         */
        async sendWelcomeCredentials(phoneNumber, name, email, password) {
            this.logger.log(`[WELCOME] Enviando credenciais para ${name} (${phoneNumber})`);
            const message = `Ola ${name}! 👋

Seu acesso ao *Beauty Manager* foi criado!

🔗 *Acesse:* https://app.agendasalaopro.com.br/login
📧 *Email:* ${email}
🔑 *Senha:* ${password}

Recomendamos trocar sua senha no primeiro acesso.

Qualquer duvida, fale com a gente! 💜`;
            const result = await this.sendDirectMessage(phoneNumber, message);
            this.logger.log(`[WELCOME] Resultado: ${JSON.stringify(result)}`);
            return result;
        }
        /**
         * Retorna os headers necessários para chamadas Z-API
         */
        getZapiHeaders() {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.zapiClientToken) {
                headers['Client-Token'] = this.zapiClientToken;
            }
            return headers;
        }
        /**
         * Testa conexão com Z-API
         */
        async testZapiConnection() {
            if (!this.zapiInstanceId || !this.zapiToken) {
                return { connected: false, error: 'Z-API não configurado.' };
            }
            try {
                const url = `${this.zapiBaseUrl}/${this.zapiInstanceId}/token/${this.zapiToken}/status`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: this.getZapiHeaders(),
                });
                const responseText = await response.text();
                this.logger.debug(`Z-API status response: ${responseText}`);
                if (response.ok) {
                    const data = JSON.parse(responseText);
                    if (data.connected || data.smartphoneConnected) {
                        return { connected: true };
                    }
                    return { connected: false, error: 'WhatsApp não conectado na instância Z-API.' };
                }
                // Verifica se é erro de client-token
                if (responseText.includes('client-token')) {
                    return { connected: false, error: 'Client-Token não configurado. Configure ZAPI_CLIENT_TOKEN no .env' };
                }
                return { connected: false, error: `Erro ao verificar status: ${responseText}` };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
                return { connected: false, error: errorMessage };
            }
        }
        /**
         * Envia template pré-aprovado via WhatsApp (Meta)
         */
        async sendTemplateMessage(salonId, phoneNumber, templateName, variables) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.whatsappEnabled) {
                return { success: false, error: 'WhatsApp não está habilitado.' };
            }
            if (settings.whatsappProvider !== 'META') {
                // Para outros provedores, enviar como mensagem normal
                const message = this.replaceVariables(templateName, variables);
                return this.sendMessage(salonId, phoneNumber, message);
            }
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            try {
                const response = await fetch(`https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}/messages`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${settings.whatsappApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: formattedPhone,
                        type: 'template',
                        template: {
                            name: templateName,
                            language: { code: 'pt_BR' },
                            components: this.buildTemplateComponents(variables),
                        },
                    }),
                });
                if (!response.ok) {
                    const error = await response.text();
                    this.logger.error(`Meta API error: ${error}`);
                    return { success: false, error: 'Erro ao enviar template.' };
                }
                const data = (await response.json());
                return {
                    success: true,
                    messageId: data.messages?.[0]?.id,
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`Template send error: ${errorMessage}`);
                return { success: false, error: errorMessage };
            }
        }
        /**
         * Verifica status de uma mensagem
         */
        async getMessageStatus(salonId, messageId) {
            const settings = await this.getSettings(salonId);
            if (!settings || settings.whatsappProvider !== 'META') {
                return { status: 'UNKNOWN' };
            }
            try {
                const response = await fetch(`https://graph.facebook.com/v18.0/${messageId}`, {
                    headers: {
                        Authorization: `Bearer ${settings.whatsappApiKey}`,
                    },
                });
                if (!response.ok) {
                    return { status: 'UNKNOWN' };
                }
                const data = (await response.json());
                return {
                    status: data.status || 'UNKNOWN',
                    timestamp: data.timestamp,
                };
            }
            catch {
                return { status: 'UNKNOWN' };
            }
        }
        /**
         * Testa conexão com WhatsApp
         */
        async testConnection(salonId) {
            const settings = await this.getSettings(salonId);
            if (!settings || !settings.whatsappApiKey) {
                return { connected: false, error: 'Credenciais não configuradas.' };
            }
            try {
                if (settings.whatsappProvider === 'META') {
                    const response = await fetch(`https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}`, {
                        headers: {
                            Authorization: `Bearer ${settings.whatsappApiKey}`,
                        },
                    });
                    if (response.ok) {
                        return { connected: true };
                    }
                    return { connected: false, error: 'Token inválido ou expirado.' };
                }
                // Para outros provedores, fazer verificação básica
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
            return cleaned;
        }
        async sendViaMeta(settings, phone, message) {
            const response = await fetch(`https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${settings.whatsappApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone,
                    type: 'text',
                    text: { body: message },
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                this.logger.error(`Meta send error: ${error}`);
                return { success: false, error: 'Erro ao enviar mensagem.' };
            }
            const data = (await response.json());
            return {
                success: true,
                messageId: data.messages?.[0]?.id,
            };
        }
        async sendViaTwilio(settings, phone, message) {
            const accountSid = settings.smsAccountSid;
            const authToken = settings.whatsappApiKey;
            const fromNumber = settings.whatsappPhoneNumberId;
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
                    From: `whatsapp:+${fromNumber}`,
                    To: `whatsapp:+${phone}`,
                    Body: message,
                }),
            });
            if (!response.ok) {
                return { success: false, error: 'Erro ao enviar via Twilio.' };
            }
            const data = (await response.json());
            return {
                success: true,
                messageId: data.sid,
            };
        }
        async sendViaZenvia(settings, phone, message) {
            const apiKey = settings.whatsappApiKey;
            if (!apiKey) {
                return { success: false, error: 'API Key Zenvia não configurada.' };
            }
            const response = await fetch('https://api.zenvia.com/v2/channels/whatsapp/messages', {
                method: 'POST',
                headers: {
                    'X-API-TOKEN': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: settings.whatsappPhoneNumberId,
                    to: phone,
                    contents: [{ type: 'text', text: message }],
                }),
            });
            if (!response.ok) {
                return { success: false, error: 'Erro ao enviar via Zenvia.' };
            }
            const data = (await response.json());
            return {
                success: true,
                messageId: data.id,
            };
        }
        /**
         * Envia mensagem via Z-API
         */
        async sendViaZapi(phone, message) {
            if (!this.zapiInstanceId || !this.zapiToken) {
                return { success: false, error: 'Z-API não configurado.' };
            }
            const url = `${this.zapiBaseUrl}/${this.zapiInstanceId}/token/${this.zapiToken}/send-text`;
            try {
                this.logger.log(`Enviando mensagem Z-API para ${phone}`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: this.getZapiHeaders(),
                    body: JSON.stringify({
                        phone: phone,
                        message: message,
                    }),
                });
                const responseText = await response.text();
                this.logger.debug(`Z-API response: ${responseText}`);
                if (!response.ok) {
                    this.logger.error(`Z-API error (${response.status}): ${responseText}`);
                    // Verifica se é erro de client-token
                    if (responseText.includes('client-token')) {
                        return { success: false, error: 'Client-Token não configurado. Configure ZAPI_CLIENT_TOKEN no .env' };
                    }
                    return { success: false, error: `Erro Z-API: ${response.status} - ${responseText}` };
                }
                let data;
                try {
                    data = JSON.parse(responseText);
                }
                catch {
                    data = {};
                }
                this.logger.log(`Mensagem enviada com sucesso para ${phone}`);
                return {
                    success: true,
                    messageId: data.zapiMessageId || data.messageId,
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.logger.error(`Z-API send error: ${errorMessage}`);
                return { success: false, error: errorMessage };
            }
        }
        buildTemplateComponents(variables) {
            const params = [];
            if (variables.nome)
                params.push({ type: 'text', text: variables.nome });
            if (variables.data)
                params.push({ type: 'text', text: variables.data });
            if (variables.horario)
                params.push({ type: 'text', text: variables.horario });
            if (variables.servico)
                params.push({ type: 'text', text: variables.servico });
            if (variables.profissional)
                params.push({ type: 'text', text: variables.profissional });
            if (params.length === 0)
                return [];
            return [{ type: 'body', parameters: params }];
        }
        replaceVariables(template, variables) {
            let result = template;
            Object.entries(variables).forEach(([key, value]) => {
                if (value) {
                    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
                }
            });
            return result;
        }
    };
    return WhatsAppService = _classThis;
})();
exports.WhatsAppService = WhatsAppService;
//# sourceMappingURL=whatsapp.service.js.map
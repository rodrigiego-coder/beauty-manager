"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let AutomationController = (() => {
    let _classDecorators = [(0, common_1.Controller)('automation'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSettings_decorators;
    let _updateSettings_decorators;
    let _getTemplates_decorators;
    let _getTemplateById_decorators;
    let _createTemplate_decorators;
    let _updateTemplate_decorators;
    let _deleteTemplate_decorators;
    let _createDefaultTemplates_decorators;
    let _sendMessage_decorators;
    let _sendTestMessage_decorators;
    let _getMessageLogs_decorators;
    let _getStats_decorators;
    let _whatsappWebhook_decorators;
    let _whatsappWebhookVerify_decorators;
    let _twilioWebhook_decorators;
    let _getZapiStatus_decorators;
    let _sendZapiTestMessage_decorators;
    let _sendWelcomeCredentials_decorators;
    var AutomationController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getSettings_decorators = [(0, common_1.Get)('settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateSettings_decorators = [(0, common_1.Patch)('settings'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getTemplates_decorators = [(0, common_1.Get)('templates'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getTemplateById_decorators = [(0, common_1.Get)('templates/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _createTemplate_decorators = [(0, common_1.Post)('templates'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateTemplate_decorators = [(0, common_1.Patch)('templates/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteTemplate_decorators = [(0, common_1.Delete)('templates/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT)];
            _createDefaultTemplates_decorators = [(0, common_1.Post)('templates/defaults'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _sendMessage_decorators = [(0, common_1.Post)('send'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _sendTestMessage_decorators = [(0, common_1.Post)('send-test'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getMessageLogs_decorators = [(0, common_1.Get)('logs'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _whatsappWebhook_decorators = [(0, common_1.Post)('webhooks/whatsapp'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _whatsappWebhookVerify_decorators = [(0, common_1.Get)('webhooks/whatsapp')];
            _twilioWebhook_decorators = [(0, common_1.Post)('webhooks/twilio'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _getZapiStatus_decorators = [(0, common_1.Get)('zapi/status'), (0, public_decorator_1.Public)()];
            _sendZapiTestMessage_decorators = [(0, common_1.Post)('zapi/send-test'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _sendWelcomeCredentials_decorators = [(0, common_1.Post)('send-welcome-credentials'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            __esDecorate(this, null, _getSettings_decorators, { kind: "method", name: "getSettings", static: false, private: false, access: { has: obj => "getSettings" in obj, get: obj => obj.getSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSettings_decorators, { kind: "method", name: "updateSettings", static: false, private: false, access: { has: obj => "updateSettings" in obj, get: obj => obj.updateSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTemplates_decorators, { kind: "method", name: "getTemplates", static: false, private: false, access: { has: obj => "getTemplates" in obj, get: obj => obj.getTemplates }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTemplateById_decorators, { kind: "method", name: "getTemplateById", static: false, private: false, access: { has: obj => "getTemplateById" in obj, get: obj => obj.getTemplateById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTemplate_decorators, { kind: "method", name: "createTemplate", static: false, private: false, access: { has: obj => "createTemplate" in obj, get: obj => obj.createTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTemplate_decorators, { kind: "method", name: "updateTemplate", static: false, private: false, access: { has: obj => "updateTemplate" in obj, get: obj => obj.updateTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteTemplate_decorators, { kind: "method", name: "deleteTemplate", static: false, private: false, access: { has: obj => "deleteTemplate" in obj, get: obj => obj.deleteTemplate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createDefaultTemplates_decorators, { kind: "method", name: "createDefaultTemplates", static: false, private: false, access: { has: obj => "createDefaultTemplates" in obj, get: obj => obj.createDefaultTemplates }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: obj => "sendMessage" in obj, get: obj => obj.sendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendTestMessage_decorators, { kind: "method", name: "sendTestMessage", static: false, private: false, access: { has: obj => "sendTestMessage" in obj, get: obj => obj.sendTestMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMessageLogs_decorators, { kind: "method", name: "getMessageLogs", static: false, private: false, access: { has: obj => "getMessageLogs" in obj, get: obj => obj.getMessageLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _whatsappWebhook_decorators, { kind: "method", name: "whatsappWebhook", static: false, private: false, access: { has: obj => "whatsappWebhook" in obj, get: obj => obj.whatsappWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _whatsappWebhookVerify_decorators, { kind: "method", name: "whatsappWebhookVerify", static: false, private: false, access: { has: obj => "whatsappWebhookVerify" in obj, get: obj => obj.whatsappWebhookVerify }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _twilioWebhook_decorators, { kind: "method", name: "twilioWebhook", static: false, private: false, access: { has: obj => "twilioWebhook" in obj, get: obj => obj.twilioWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getZapiStatus_decorators, { kind: "method", name: "getZapiStatus", static: false, private: false, access: { has: obj => "getZapiStatus" in obj, get: obj => obj.getZapiStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendZapiTestMessage_decorators, { kind: "method", name: "sendZapiTestMessage", static: false, private: false, access: { has: obj => "sendZapiTestMessage" in obj, get: obj => obj.sendZapiTestMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendWelcomeCredentials_decorators, { kind: "method", name: "sendWelcomeCredentials", static: false, private: false, access: { has: obj => "sendWelcomeCredentials" in obj, get: obj => obj.sendWelcomeCredentials }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AutomationController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        automationService = __runInitializers(this, _instanceExtraInitializers);
        whatsAppService;
        constructor(automationService, whatsAppService) {
            this.automationService = automationService;
            this.whatsAppService = whatsAppService;
        }
        // ==================== SETTINGS ====================
        /**
         * GET /automation/settings
         * Retorna configurações de automação do salão
         */
        async getSettings(user) {
            return this.automationService.getSettings(user.salonId);
        }
        /**
         * PATCH /automation/settings
         * Atualiza configurações de automação
         */
        async updateSettings(user, dto) {
            return this.automationService.updateSettings(user.salonId, dto);
        }
        // ==================== TEMPLATES ====================
        /**
         * GET /automation/templates
         * Lista todos os templates do salão
         */
        async getTemplates(user) {
            return this.automationService.getTemplates(user.salonId);
        }
        /**
         * GET /automation/templates/:id
         * Busca template por ID
         */
        async getTemplateById(user, id) {
            return this.automationService.getTemplateById(id, user.salonId);
        }
        /**
         * POST /automation/templates
         * Cria novo template
         */
        async createTemplate(user, dto) {
            return this.automationService.createTemplate(user.salonId, dto);
        }
        /**
         * PATCH /automation/templates/:id
         * Atualiza template
         */
        async updateTemplate(user, id, dto) {
            return this.automationService.updateTemplate(id, user.salonId, dto);
        }
        /**
         * DELETE /automation/templates/:id
         * Remove template
         */
        async deleteTemplate(user, id) {
            await this.automationService.deleteTemplate(id, user.salonId);
        }
        /**
         * POST /automation/templates/defaults
         * Cria templates padrão
         */
        async createDefaultTemplates(user) {
            await this.automationService.createDefaultTemplates(user.salonId);
            return { message: 'Templates padrão criados com sucesso.' };
        }
        // ==================== MESSAGES ====================
        /**
         * POST /automation/send
         * Envia mensagem manual
         */
        async sendMessage(user, dto) {
            return this.automationService.sendMessage(user.salonId, dto);
        }
        /**
         * POST /automation/send-test
         * Envia mensagem de teste
         */
        async sendTestMessage(user, dto) {
            return this.automationService.sendTestMessage(user.salonId, dto.channel, dto.phoneNumber);
        }
        // ==================== LOGS & STATS ====================
        /**
         * GET /automation/logs
         * Lista histórico de mensagens
         */
        async getMessageLogs(user, filters) {
            return this.automationService.getMessageLogs(user.salonId, filters);
        }
        /**
         * GET /automation/stats
         * Retorna estatísticas de mensagens
         */
        async getStats(user, days) {
            return this.automationService.getStats(user.salonId, days ? parseInt(days) : 30);
        }
        // ==================== WEBHOOKS ====================
        /**
         * POST /automation/webhooks/whatsapp
         * Webhook para status do WhatsApp (Meta)
         */
        async whatsappWebhook(body) {
            await this.automationService.processWhatsAppWebhook(body);
            return { success: true };
        }
        /**
         * GET /automation/webhooks/whatsapp
         * Verificação do webhook (Meta)
         */
        whatsappWebhookVerify(mode, token, challenge) {
            const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'beauty_manager_verify';
            if (mode === 'subscribe' && token === verifyToken) {
                return challenge;
            }
            return 'Verification failed';
        }
        /**
         * POST /automation/webhooks/twilio
         * Webhook para status do Twilio
         */
        async twilioWebhook(body) {
            await this.automationService.processTwilioWebhook(body);
            return { success: true };
        }
        // ==================== Z-API TEST ====================
        /**
         * GET /automation/zapi/status
         * Verifica status da conexão Z-API
         */
        async getZapiStatus() {
            return this.whatsAppService.testZapiConnection();
        }
        /**
         * POST /automation/zapi/send-test
         * Envia mensagem de teste via Z-API (público para testes)
         */
        async sendZapiTestMessage(body) {
            if (!body.phone || !body.message) {
                return { success: false, error: 'phone e message são obrigatórios.' };
            }
            return this.whatsAppService.sendDirectMessage(body.phone, body.message);
        }
        /**
         * POST /automation/send-welcome-credentials
         * Envia credenciais de acesso via WhatsApp para novo profissional
         */
        async sendWelcomeCredentials(body) {
            if (!body.phone || !body.name || !body.email || !body.password) {
                return { success: false, error: 'phone, name, email e password são obrigatórios.' };
            }
            return this.whatsAppService.sendWelcomeCredentials(body.phone, body.name, body.email, body.password);
        }
    };
    return AutomationController = _classThis;
})();
exports.AutomationController = AutomationController;
//# sourceMappingURL=automation.controller.js.map
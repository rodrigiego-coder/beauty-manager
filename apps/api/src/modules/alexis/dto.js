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
exports.WhatsAppWebhookDto = exports.EndSessionDto = exports.UpdateResponseTemplateDto = exports.CreateResponseTemplateDto = exports.CreateBlockedKeywordDto = exports.UpdateAlexisSettingsDto = exports.TakeoverDto = exports.HumanMessageDto = exports.SendMessageDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * =====================================================
 * ALEXIS DTOs
 * =====================================================
 */
// ==================== MENSAGENS ====================
let SendMessageDto = (() => {
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    return class SendMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _message_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(4096)];
            _sessionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        message = __runInitializers(this, _message_initializers, void 0);
        sessionId = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
        clientPhone = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        clientName = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        constructor() {
            __runInitializers(this, _clientName_extraInitializers);
        }
    };
})();
exports.SendMessageDto = SendMessageDto;
let HumanMessageDto = (() => {
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    return class HumanMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _sessionId_decorators = [(0, class_validator_1.IsString)()];
            _message_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(4096)];
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        sessionId = __runInitializers(this, _sessionId_initializers, void 0);
        message = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _message_initializers, void 0));
        constructor() {
            __runInitializers(this, _message_extraInitializers);
        }
    };
})();
exports.HumanMessageDto = HumanMessageDto;
let TakeoverDto = (() => {
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    return class TakeoverDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _sessionId_decorators = [(0, class_validator_1.IsString)()];
            _reason_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        sessionId = __runInitializers(this, _sessionId_initializers, void 0);
        reason = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        constructor() {
            __runInitializers(this, _reason_extraInitializers);
        }
    };
})();
exports.TakeoverDto = TakeoverDto;
// ==================== CONFIGURAÇÕES ====================
let UpdateAlexisSettingsDto = (() => {
    let _isEnabled_decorators;
    let _isEnabled_initializers = [];
    let _isEnabled_extraInitializers = [];
    let _assistantName_decorators;
    let _assistantName_initializers = [];
    let _assistantName_extraInitializers = [];
    let _welcomeMessage_decorators;
    let _welcomeMessage_initializers = [];
    let _welcomeMessage_extraInitializers = [];
    let _personality_decorators;
    let _personality_initializers = [];
    let _personality_extraInitializers = [];
    let _language_decorators;
    let _language_initializers = [];
    let _language_extraInitializers = [];
    let _complianceLevel_decorators;
    let _complianceLevel_initializers = [];
    let _complianceLevel_extraInitializers = [];
    let _anvisaWarningsEnabled_decorators;
    let _anvisaWarningsEnabled_initializers = [];
    let _anvisaWarningsEnabled_extraInitializers = [];
    let _lgpdConsentRequired_decorators;
    let _lgpdConsentRequired_initializers = [];
    let _lgpdConsentRequired_extraInitializers = [];
    let _dataRetentionDays_decorators;
    let _dataRetentionDays_initializers = [];
    let _dataRetentionDays_extraInitializers = [];
    let _autoResponseEnabled_decorators;
    let _autoResponseEnabled_initializers = [];
    let _autoResponseEnabled_extraInitializers = [];
    let _maxResponsesPerMinute_decorators;
    let _maxResponsesPerMinute_initializers = [];
    let _maxResponsesPerMinute_extraInitializers = [];
    let _humanTakeoverKeywords_decorators;
    let _humanTakeoverKeywords_initializers = [];
    let _humanTakeoverKeywords_extraInitializers = [];
    let _aiResumeKeywords_decorators;
    let _aiResumeKeywords_initializers = [];
    let _aiResumeKeywords_extraInitializers = [];
    let _operatingHoursEnabled_decorators;
    let _operatingHoursEnabled_initializers = [];
    let _operatingHoursEnabled_extraInitializers = [];
    let _operatingHoursStart_decorators;
    let _operatingHoursStart_initializers = [];
    let _operatingHoursStart_extraInitializers = [];
    let _operatingHoursEnd_decorators;
    let _operatingHoursEnd_initializers = [];
    let _operatingHoursEnd_extraInitializers = [];
    let _outOfHoursMessage_decorators;
    let _outOfHoursMessage_initializers = [];
    let _outOfHoursMessage_extraInitializers = [];
    let _whatsappIntegrationId_decorators;
    let _whatsappIntegrationId_initializers = [];
    let _whatsappIntegrationId_extraInitializers = [];
    let _webhookUrl_decorators;
    let _webhookUrl_initializers = [];
    let _webhookUrl_extraInitializers = [];
    return class UpdateAlexisSettingsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _isEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _assistantName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(50)];
            _welcomeMessage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _personality_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _language_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _complianceLevel_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _anvisaWarningsEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _lgpdConsentRequired_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _dataRetentionDays_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _autoResponseEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _maxResponsesPerMinute_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _humanTakeoverKeywords_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _aiResumeKeywords_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _operatingHoursEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _operatingHoursStart_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _operatingHoursEnd_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _outOfHoursMessage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _whatsappIntegrationId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _webhookUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _isEnabled_decorators, { kind: "field", name: "isEnabled", static: false, private: false, access: { has: obj => "isEnabled" in obj, get: obj => obj.isEnabled, set: (obj, value) => { obj.isEnabled = value; } }, metadata: _metadata }, _isEnabled_initializers, _isEnabled_extraInitializers);
            __esDecorate(null, null, _assistantName_decorators, { kind: "field", name: "assistantName", static: false, private: false, access: { has: obj => "assistantName" in obj, get: obj => obj.assistantName, set: (obj, value) => { obj.assistantName = value; } }, metadata: _metadata }, _assistantName_initializers, _assistantName_extraInitializers);
            __esDecorate(null, null, _welcomeMessage_decorators, { kind: "field", name: "welcomeMessage", static: false, private: false, access: { has: obj => "welcomeMessage" in obj, get: obj => obj.welcomeMessage, set: (obj, value) => { obj.welcomeMessage = value; } }, metadata: _metadata }, _welcomeMessage_initializers, _welcomeMessage_extraInitializers);
            __esDecorate(null, null, _personality_decorators, { kind: "field", name: "personality", static: false, private: false, access: { has: obj => "personality" in obj, get: obj => obj.personality, set: (obj, value) => { obj.personality = value; } }, metadata: _metadata }, _personality_initializers, _personality_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: obj => "language" in obj, get: obj => obj.language, set: (obj, value) => { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            __esDecorate(null, null, _complianceLevel_decorators, { kind: "field", name: "complianceLevel", static: false, private: false, access: { has: obj => "complianceLevel" in obj, get: obj => obj.complianceLevel, set: (obj, value) => { obj.complianceLevel = value; } }, metadata: _metadata }, _complianceLevel_initializers, _complianceLevel_extraInitializers);
            __esDecorate(null, null, _anvisaWarningsEnabled_decorators, { kind: "field", name: "anvisaWarningsEnabled", static: false, private: false, access: { has: obj => "anvisaWarningsEnabled" in obj, get: obj => obj.anvisaWarningsEnabled, set: (obj, value) => { obj.anvisaWarningsEnabled = value; } }, metadata: _metadata }, _anvisaWarningsEnabled_initializers, _anvisaWarningsEnabled_extraInitializers);
            __esDecorate(null, null, _lgpdConsentRequired_decorators, { kind: "field", name: "lgpdConsentRequired", static: false, private: false, access: { has: obj => "lgpdConsentRequired" in obj, get: obj => obj.lgpdConsentRequired, set: (obj, value) => { obj.lgpdConsentRequired = value; } }, metadata: _metadata }, _lgpdConsentRequired_initializers, _lgpdConsentRequired_extraInitializers);
            __esDecorate(null, null, _dataRetentionDays_decorators, { kind: "field", name: "dataRetentionDays", static: false, private: false, access: { has: obj => "dataRetentionDays" in obj, get: obj => obj.dataRetentionDays, set: (obj, value) => { obj.dataRetentionDays = value; } }, metadata: _metadata }, _dataRetentionDays_initializers, _dataRetentionDays_extraInitializers);
            __esDecorate(null, null, _autoResponseEnabled_decorators, { kind: "field", name: "autoResponseEnabled", static: false, private: false, access: { has: obj => "autoResponseEnabled" in obj, get: obj => obj.autoResponseEnabled, set: (obj, value) => { obj.autoResponseEnabled = value; } }, metadata: _metadata }, _autoResponseEnabled_initializers, _autoResponseEnabled_extraInitializers);
            __esDecorate(null, null, _maxResponsesPerMinute_decorators, { kind: "field", name: "maxResponsesPerMinute", static: false, private: false, access: { has: obj => "maxResponsesPerMinute" in obj, get: obj => obj.maxResponsesPerMinute, set: (obj, value) => { obj.maxResponsesPerMinute = value; } }, metadata: _metadata }, _maxResponsesPerMinute_initializers, _maxResponsesPerMinute_extraInitializers);
            __esDecorate(null, null, _humanTakeoverKeywords_decorators, { kind: "field", name: "humanTakeoverKeywords", static: false, private: false, access: { has: obj => "humanTakeoverKeywords" in obj, get: obj => obj.humanTakeoverKeywords, set: (obj, value) => { obj.humanTakeoverKeywords = value; } }, metadata: _metadata }, _humanTakeoverKeywords_initializers, _humanTakeoverKeywords_extraInitializers);
            __esDecorate(null, null, _aiResumeKeywords_decorators, { kind: "field", name: "aiResumeKeywords", static: false, private: false, access: { has: obj => "aiResumeKeywords" in obj, get: obj => obj.aiResumeKeywords, set: (obj, value) => { obj.aiResumeKeywords = value; } }, metadata: _metadata }, _aiResumeKeywords_initializers, _aiResumeKeywords_extraInitializers);
            __esDecorate(null, null, _operatingHoursEnabled_decorators, { kind: "field", name: "operatingHoursEnabled", static: false, private: false, access: { has: obj => "operatingHoursEnabled" in obj, get: obj => obj.operatingHoursEnabled, set: (obj, value) => { obj.operatingHoursEnabled = value; } }, metadata: _metadata }, _operatingHoursEnabled_initializers, _operatingHoursEnabled_extraInitializers);
            __esDecorate(null, null, _operatingHoursStart_decorators, { kind: "field", name: "operatingHoursStart", static: false, private: false, access: { has: obj => "operatingHoursStart" in obj, get: obj => obj.operatingHoursStart, set: (obj, value) => { obj.operatingHoursStart = value; } }, metadata: _metadata }, _operatingHoursStart_initializers, _operatingHoursStart_extraInitializers);
            __esDecorate(null, null, _operatingHoursEnd_decorators, { kind: "field", name: "operatingHoursEnd", static: false, private: false, access: { has: obj => "operatingHoursEnd" in obj, get: obj => obj.operatingHoursEnd, set: (obj, value) => { obj.operatingHoursEnd = value; } }, metadata: _metadata }, _operatingHoursEnd_initializers, _operatingHoursEnd_extraInitializers);
            __esDecorate(null, null, _outOfHoursMessage_decorators, { kind: "field", name: "outOfHoursMessage", static: false, private: false, access: { has: obj => "outOfHoursMessage" in obj, get: obj => obj.outOfHoursMessage, set: (obj, value) => { obj.outOfHoursMessage = value; } }, metadata: _metadata }, _outOfHoursMessage_initializers, _outOfHoursMessage_extraInitializers);
            __esDecorate(null, null, _whatsappIntegrationId_decorators, { kind: "field", name: "whatsappIntegrationId", static: false, private: false, access: { has: obj => "whatsappIntegrationId" in obj, get: obj => obj.whatsappIntegrationId, set: (obj, value) => { obj.whatsappIntegrationId = value; } }, metadata: _metadata }, _whatsappIntegrationId_initializers, _whatsappIntegrationId_extraInitializers);
            __esDecorate(null, null, _webhookUrl_decorators, { kind: "field", name: "webhookUrl", static: false, private: false, access: { has: obj => "webhookUrl" in obj, get: obj => obj.webhookUrl, set: (obj, value) => { obj.webhookUrl = value; } }, metadata: _metadata }, _webhookUrl_initializers, _webhookUrl_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        isEnabled = __runInitializers(this, _isEnabled_initializers, void 0);
        assistantName = (__runInitializers(this, _isEnabled_extraInitializers), __runInitializers(this, _assistantName_initializers, void 0));
        welcomeMessage = (__runInitializers(this, _assistantName_extraInitializers), __runInitializers(this, _welcomeMessage_initializers, void 0));
        personality = (__runInitializers(this, _welcomeMessage_extraInitializers), __runInitializers(this, _personality_initializers, void 0));
        language = (__runInitializers(this, _personality_extraInitializers), __runInitializers(this, _language_initializers, void 0));
        // Compliance
        complianceLevel = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _complianceLevel_initializers, void 0));
        anvisaWarningsEnabled = (__runInitializers(this, _complianceLevel_extraInitializers), __runInitializers(this, _anvisaWarningsEnabled_initializers, void 0));
        lgpdConsentRequired = (__runInitializers(this, _anvisaWarningsEnabled_extraInitializers), __runInitializers(this, _lgpdConsentRequired_initializers, void 0));
        dataRetentionDays = (__runInitializers(this, _lgpdConsentRequired_extraInitializers), __runInitializers(this, _dataRetentionDays_initializers, void 0));
        // Controle de IA
        autoResponseEnabled = (__runInitializers(this, _dataRetentionDays_extraInitializers), __runInitializers(this, _autoResponseEnabled_initializers, void 0));
        maxResponsesPerMinute = (__runInitializers(this, _autoResponseEnabled_extraInitializers), __runInitializers(this, _maxResponsesPerMinute_initializers, void 0));
        humanTakeoverKeywords = (__runInitializers(this, _maxResponsesPerMinute_extraInitializers), __runInitializers(this, _humanTakeoverKeywords_initializers, void 0));
        aiResumeKeywords = (__runInitializers(this, _humanTakeoverKeywords_extraInitializers), __runInitializers(this, _aiResumeKeywords_initializers, void 0));
        // Horários
        operatingHoursEnabled = (__runInitializers(this, _aiResumeKeywords_extraInitializers), __runInitializers(this, _operatingHoursEnabled_initializers, void 0));
        operatingHoursStart = (__runInitializers(this, _operatingHoursEnabled_extraInitializers), __runInitializers(this, _operatingHoursStart_initializers, void 0));
        operatingHoursEnd = (__runInitializers(this, _operatingHoursStart_extraInitializers), __runInitializers(this, _operatingHoursEnd_initializers, void 0));
        outOfHoursMessage = (__runInitializers(this, _operatingHoursEnd_extraInitializers), __runInitializers(this, _outOfHoursMessage_initializers, void 0));
        // Integrações
        whatsappIntegrationId = (__runInitializers(this, _outOfHoursMessage_extraInitializers), __runInitializers(this, _whatsappIntegrationId_initializers, void 0));
        webhookUrl = (__runInitializers(this, _whatsappIntegrationId_extraInitializers), __runInitializers(this, _webhookUrl_initializers, void 0));
        constructor() {
            __runInitializers(this, _webhookUrl_extraInitializers);
        }
    };
})();
exports.UpdateAlexisSettingsDto = UpdateAlexisSettingsDto;
// ==================== KEYWORDS ====================
let CreateBlockedKeywordDto = (() => {
    let _keyword_decorators;
    let _keyword_initializers = [];
    let _keyword_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _violationType_decorators;
    let _violationType_initializers = [];
    let _violationType_extraInitializers = [];
    let _severity_decorators;
    let _severity_initializers = [];
    let _severity_extraInitializers = [];
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    let _replacement_decorators;
    let _replacement_initializers = [];
    let _replacement_extraInitializers = [];
    let _warningMessage_decorators;
    let _warningMessage_initializers = [];
    let _warningMessage_extraInitializers = [];
    return class CreateBlockedKeywordDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _keyword_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(100)];
            _category_decorators = [(0, class_validator_1.IsString)()];
            _violationType_decorators = [(0, class_validator_1.IsString)()];
            _severity_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _action_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _replacement_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _warningMessage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _keyword_decorators, { kind: "field", name: "keyword", static: false, private: false, access: { has: obj => "keyword" in obj, get: obj => obj.keyword, set: (obj, value) => { obj.keyword = value; } }, metadata: _metadata }, _keyword_initializers, _keyword_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _violationType_decorators, { kind: "field", name: "violationType", static: false, private: false, access: { has: obj => "violationType" in obj, get: obj => obj.violationType, set: (obj, value) => { obj.violationType = value; } }, metadata: _metadata }, _violationType_initializers, _violationType_extraInitializers);
            __esDecorate(null, null, _severity_decorators, { kind: "field", name: "severity", static: false, private: false, access: { has: obj => "severity" in obj, get: obj => obj.severity, set: (obj, value) => { obj.severity = value; } }, metadata: _metadata }, _severity_initializers, _severity_extraInitializers);
            __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
            __esDecorate(null, null, _replacement_decorators, { kind: "field", name: "replacement", static: false, private: false, access: { has: obj => "replacement" in obj, get: obj => obj.replacement, set: (obj, value) => { obj.replacement = value; } }, metadata: _metadata }, _replacement_initializers, _replacement_extraInitializers);
            __esDecorate(null, null, _warningMessage_decorators, { kind: "field", name: "warningMessage", static: false, private: false, access: { has: obj => "warningMessage" in obj, get: obj => obj.warningMessage, set: (obj, value) => { obj.warningMessage = value; } }, metadata: _metadata }, _warningMessage_initializers, _warningMessage_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        keyword = __runInitializers(this, _keyword_initializers, void 0);
        category = (__runInitializers(this, _keyword_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        violationType = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _violationType_initializers, void 0));
        severity = (__runInitializers(this, _violationType_extraInitializers), __runInitializers(this, _severity_initializers, void 0));
        action = (__runInitializers(this, _severity_extraInitializers), __runInitializers(this, _action_initializers, void 0));
        replacement = (__runInitializers(this, _action_extraInitializers), __runInitializers(this, _replacement_initializers, void 0));
        warningMessage = (__runInitializers(this, _replacement_extraInitializers), __runInitializers(this, _warningMessage_initializers, void 0));
        constructor() {
            __runInitializers(this, _warningMessage_extraInitializers);
        }
    };
})();
exports.CreateBlockedKeywordDto = CreateBlockedKeywordDto;
// ==================== TEMPLATES ====================
let CreateResponseTemplateDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _triggerKeywords_decorators;
    let _triggerKeywords_initializers = [];
    let _triggerKeywords_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _variables_decorators;
    let _variables_initializers = [];
    let _variables_extraInitializers = [];
    return class CreateResponseTemplateDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(100)];
            _category_decorators = [(0, class_validator_1.IsString)()];
            _triggerKeywords_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _content_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            _variables_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _triggerKeywords_decorators, { kind: "field", name: "triggerKeywords", static: false, private: false, access: { has: obj => "triggerKeywords" in obj, get: obj => obj.triggerKeywords, set: (obj, value) => { obj.triggerKeywords = value; } }, metadata: _metadata }, _triggerKeywords_initializers, _triggerKeywords_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _variables_decorators, { kind: "field", name: "variables", static: false, private: false, access: { has: obj => "variables" in obj, get: obj => obj.variables, set: (obj, value) => { obj.variables = value; } }, metadata: _metadata }, _variables_initializers, _variables_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        category = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        triggerKeywords = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _triggerKeywords_initializers, void 0));
        content = (__runInitializers(this, _triggerKeywords_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        variables = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _variables_initializers, void 0));
        constructor() {
            __runInitializers(this, _variables_extraInitializers);
        }
    };
})();
exports.CreateResponseTemplateDto = CreateResponseTemplateDto;
let UpdateResponseTemplateDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _triggerKeywords_decorators;
    let _triggerKeywords_initializers = [];
    let _triggerKeywords_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _variables_decorators;
    let _variables_initializers = [];
    let _variables_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateResponseTemplateDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100)];
            _category_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _triggerKeywords_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _content_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _variables_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _isActive_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _triggerKeywords_decorators, { kind: "field", name: "triggerKeywords", static: false, private: false, access: { has: obj => "triggerKeywords" in obj, get: obj => obj.triggerKeywords, set: (obj, value) => { obj.triggerKeywords = value; } }, metadata: _metadata }, _triggerKeywords_initializers, _triggerKeywords_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _variables_decorators, { kind: "field", name: "variables", static: false, private: false, access: { has: obj => "variables" in obj, get: obj => obj.variables, set: (obj, value) => { obj.variables = value; } }, metadata: _metadata }, _variables_initializers, _variables_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        category = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        triggerKeywords = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _triggerKeywords_initializers, void 0));
        content = (__runInitializers(this, _triggerKeywords_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        variables = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _variables_initializers, void 0));
        isActive = (__runInitializers(this, _variables_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateResponseTemplateDto = UpdateResponseTemplateDto;
// ==================== SESSÕES ====================
let EndSessionDto = (() => {
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _resolution_decorators;
    let _resolution_initializers = [];
    let _resolution_extraInitializers = [];
    return class EndSessionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _sessionId_decorators = [(0, class_validator_1.IsString)()];
            _resolution_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _resolution_decorators, { kind: "field", name: "resolution", static: false, private: false, access: { has: obj => "resolution" in obj, get: obj => obj.resolution, set: (obj, value) => { obj.resolution = value; } }, metadata: _metadata }, _resolution_initializers, _resolution_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        sessionId = __runInitializers(this, _sessionId_initializers, void 0);
        resolution = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _resolution_initializers, void 0));
        constructor() {
            __runInitializers(this, _resolution_extraInitializers);
        }
    };
})();
exports.EndSessionDto = EndSessionDto;
// ==================== WEBHOOK ====================
class WhatsAppWebhookDto {
    object;
    entry;
}
exports.WhatsAppWebhookDto = WhatsAppWebhookDto;
//# sourceMappingURL=dto.js.map
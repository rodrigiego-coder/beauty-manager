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
exports.MessageLogFiltersDto = exports.SendTestMessageDto = exports.SendMessageDto = exports.UpdateTemplateDto = exports.CreateTemplateDto = exports.UpdateAutomationSettingsDto = exports.SMSProvider = exports.WhatsAppProvider = exports.MessageStatus = exports.MessageChannel = exports.MessageTemplateType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// ==================== ENUMS ====================
var MessageTemplateType;
(function (MessageTemplateType) {
    MessageTemplateType["APPOINTMENT_REMINDER"] = "APPOINTMENT_REMINDER";
    MessageTemplateType["APPOINTMENT_CONFIRMATION"] = "APPOINTMENT_CONFIRMATION";
    MessageTemplateType["BIRTHDAY"] = "BIRTHDAY";
    MessageTemplateType["WELCOME"] = "WELCOME";
    MessageTemplateType["REVIEW_REQUEST"] = "REVIEW_REQUEST";
    MessageTemplateType["CUSTOM"] = "CUSTOM";
})(MessageTemplateType || (exports.MessageTemplateType = MessageTemplateType = {}));
var MessageChannel;
(function (MessageChannel) {
    MessageChannel["WHATSAPP"] = "WHATSAPP";
    MessageChannel["SMS"] = "SMS";
    MessageChannel["BOTH"] = "BOTH";
})(MessageChannel || (exports.MessageChannel = MessageChannel = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["PENDING"] = "PENDING";
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["READ"] = "READ";
    MessageStatus["FAILED"] = "FAILED";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
var WhatsAppProvider;
(function (WhatsAppProvider) {
    WhatsAppProvider["META"] = "META";
    WhatsAppProvider["TWILIO"] = "TWILIO";
    WhatsAppProvider["ZENVIA"] = "ZENVIA";
})(WhatsAppProvider || (exports.WhatsAppProvider = WhatsAppProvider = {}));
var SMSProvider;
(function (SMSProvider) {
    SMSProvider["TWILIO"] = "TWILIO";
    SMSProvider["ZENVIA"] = "ZENVIA";
    SMSProvider["AWS_SNS"] = "AWS_SNS";
})(SMSProvider || (exports.SMSProvider = SMSProvider = {}));
// ==================== DTOs ====================
let UpdateAutomationSettingsDto = (() => {
    let _whatsappEnabled_decorators;
    let _whatsappEnabled_initializers = [];
    let _whatsappEnabled_extraInitializers = [];
    let _whatsappProvider_decorators;
    let _whatsappProvider_initializers = [];
    let _whatsappProvider_extraInitializers = [];
    let _whatsappApiKey_decorators;
    let _whatsappApiKey_initializers = [];
    let _whatsappApiKey_extraInitializers = [];
    let _whatsappPhoneNumberId_decorators;
    let _whatsappPhoneNumberId_initializers = [];
    let _whatsappPhoneNumberId_extraInitializers = [];
    let _whatsappBusinessAccountId_decorators;
    let _whatsappBusinessAccountId_initializers = [];
    let _whatsappBusinessAccountId_extraInitializers = [];
    let _smsEnabled_decorators;
    let _smsEnabled_initializers = [];
    let _smsEnabled_extraInitializers = [];
    let _smsProvider_decorators;
    let _smsProvider_initializers = [];
    let _smsProvider_extraInitializers = [];
    let _smsApiKey_decorators;
    let _smsApiKey_initializers = [];
    let _smsApiKey_extraInitializers = [];
    let _smsAccountSid_decorators;
    let _smsAccountSid_initializers = [];
    let _smsAccountSid_extraInitializers = [];
    let _smsPhoneNumber_decorators;
    let _smsPhoneNumber_initializers = [];
    let _smsPhoneNumber_extraInitializers = [];
    let _reminderEnabled_decorators;
    let _reminderEnabled_initializers = [];
    let _reminderEnabled_extraInitializers = [];
    let _reminderHoursBefore_decorators;
    let _reminderHoursBefore_initializers = [];
    let _reminderHoursBefore_extraInitializers = [];
    let _confirmationEnabled_decorators;
    let _confirmationEnabled_initializers = [];
    let _confirmationEnabled_extraInitializers = [];
    let _confirmationHoursBefore_decorators;
    let _confirmationHoursBefore_initializers = [];
    let _confirmationHoursBefore_extraInitializers = [];
    let _birthdayEnabled_decorators;
    let _birthdayEnabled_initializers = [];
    let _birthdayEnabled_extraInitializers = [];
    let _birthdayTime_decorators;
    let _birthdayTime_initializers = [];
    let _birthdayTime_extraInitializers = [];
    let _birthdayDiscountPercent_decorators;
    let _birthdayDiscountPercent_initializers = [];
    let _birthdayDiscountPercent_extraInitializers = [];
    let _reviewRequestEnabled_decorators;
    let _reviewRequestEnabled_initializers = [];
    let _reviewRequestEnabled_extraInitializers = [];
    let _reviewRequestHoursAfter_decorators;
    let _reviewRequestHoursAfter_initializers = [];
    let _reviewRequestHoursAfter_extraInitializers = [];
    return class UpdateAutomationSettingsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _whatsappEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Habilitar WhatsApp', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _whatsappProvider_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Provedor WhatsApp', enum: WhatsAppProvider, example: 'META' }), (0, class_validator_1.IsEnum)(WhatsAppProvider), (0, class_validator_1.IsOptional)()];
            _whatsappApiKey_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'API Key do WhatsApp', example: 'EAAxxxxxxxx' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _whatsappPhoneNumberId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do número de telefone WhatsApp', example: '123456789012345' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _whatsappBusinessAccountId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID da conta WhatsApp Business', example: '987654321098765' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _smsEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Habilitar SMS', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _smsProvider_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Provedor SMS', enum: SMSProvider, example: 'TWILIO' }), (0, class_validator_1.IsEnum)(SMSProvider), (0, class_validator_1.IsOptional)()];
            _smsApiKey_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'API Key do SMS', example: 'SKxxxxxxxx' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _smsAccountSid_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Account SID do SMS (Twilio)', example: 'ACxxxxxxxx' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _smsPhoneNumber_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Número de telefone para SMS', example: '+5511999998888' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _reminderEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Habilitar lembretes automáticos', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _reminderHoursBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas antes do agendamento para enviar lembrete', example: 24, minimum: 1, maximum: 168 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(168), (0, class_validator_1.IsOptional)()];
            _confirmationEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Habilitar confirmação automática', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _confirmationHoursBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas antes do agendamento para pedir confirmação', example: 48, minimum: 1, maximum: 168 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(168), (0, class_validator_1.IsOptional)()];
            _birthdayEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Habilitar mensagens de aniversário', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _birthdayTime_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário para enviar mensagem de aniversário (HH:mm)', example: '09:00' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _birthdayDiscountPercent_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Percentual de desconto para aniversariantes', example: 10, minimum: 0, maximum: 100 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(100), (0, class_validator_1.IsOptional)()];
            _reviewRequestEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Habilitar solicitação de avaliação', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _reviewRequestHoursAfter_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas após o atendimento para solicitar avaliação', example: 2, minimum: 1, maximum: 168 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(168), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _whatsappEnabled_decorators, { kind: "field", name: "whatsappEnabled", static: false, private: false, access: { has: obj => "whatsappEnabled" in obj, get: obj => obj.whatsappEnabled, set: (obj, value) => { obj.whatsappEnabled = value; } }, metadata: _metadata }, _whatsappEnabled_initializers, _whatsappEnabled_extraInitializers);
            __esDecorate(null, null, _whatsappProvider_decorators, { kind: "field", name: "whatsappProvider", static: false, private: false, access: { has: obj => "whatsappProvider" in obj, get: obj => obj.whatsappProvider, set: (obj, value) => { obj.whatsappProvider = value; } }, metadata: _metadata }, _whatsappProvider_initializers, _whatsappProvider_extraInitializers);
            __esDecorate(null, null, _whatsappApiKey_decorators, { kind: "field", name: "whatsappApiKey", static: false, private: false, access: { has: obj => "whatsappApiKey" in obj, get: obj => obj.whatsappApiKey, set: (obj, value) => { obj.whatsappApiKey = value; } }, metadata: _metadata }, _whatsappApiKey_initializers, _whatsappApiKey_extraInitializers);
            __esDecorate(null, null, _whatsappPhoneNumberId_decorators, { kind: "field", name: "whatsappPhoneNumberId", static: false, private: false, access: { has: obj => "whatsappPhoneNumberId" in obj, get: obj => obj.whatsappPhoneNumberId, set: (obj, value) => { obj.whatsappPhoneNumberId = value; } }, metadata: _metadata }, _whatsappPhoneNumberId_initializers, _whatsappPhoneNumberId_extraInitializers);
            __esDecorate(null, null, _whatsappBusinessAccountId_decorators, { kind: "field", name: "whatsappBusinessAccountId", static: false, private: false, access: { has: obj => "whatsappBusinessAccountId" in obj, get: obj => obj.whatsappBusinessAccountId, set: (obj, value) => { obj.whatsappBusinessAccountId = value; } }, metadata: _metadata }, _whatsappBusinessAccountId_initializers, _whatsappBusinessAccountId_extraInitializers);
            __esDecorate(null, null, _smsEnabled_decorators, { kind: "field", name: "smsEnabled", static: false, private: false, access: { has: obj => "smsEnabled" in obj, get: obj => obj.smsEnabled, set: (obj, value) => { obj.smsEnabled = value; } }, metadata: _metadata }, _smsEnabled_initializers, _smsEnabled_extraInitializers);
            __esDecorate(null, null, _smsProvider_decorators, { kind: "field", name: "smsProvider", static: false, private: false, access: { has: obj => "smsProvider" in obj, get: obj => obj.smsProvider, set: (obj, value) => { obj.smsProvider = value; } }, metadata: _metadata }, _smsProvider_initializers, _smsProvider_extraInitializers);
            __esDecorate(null, null, _smsApiKey_decorators, { kind: "field", name: "smsApiKey", static: false, private: false, access: { has: obj => "smsApiKey" in obj, get: obj => obj.smsApiKey, set: (obj, value) => { obj.smsApiKey = value; } }, metadata: _metadata }, _smsApiKey_initializers, _smsApiKey_extraInitializers);
            __esDecorate(null, null, _smsAccountSid_decorators, { kind: "field", name: "smsAccountSid", static: false, private: false, access: { has: obj => "smsAccountSid" in obj, get: obj => obj.smsAccountSid, set: (obj, value) => { obj.smsAccountSid = value; } }, metadata: _metadata }, _smsAccountSid_initializers, _smsAccountSid_extraInitializers);
            __esDecorate(null, null, _smsPhoneNumber_decorators, { kind: "field", name: "smsPhoneNumber", static: false, private: false, access: { has: obj => "smsPhoneNumber" in obj, get: obj => obj.smsPhoneNumber, set: (obj, value) => { obj.smsPhoneNumber = value; } }, metadata: _metadata }, _smsPhoneNumber_initializers, _smsPhoneNumber_extraInitializers);
            __esDecorate(null, null, _reminderEnabled_decorators, { kind: "field", name: "reminderEnabled", static: false, private: false, access: { has: obj => "reminderEnabled" in obj, get: obj => obj.reminderEnabled, set: (obj, value) => { obj.reminderEnabled = value; } }, metadata: _metadata }, _reminderEnabled_initializers, _reminderEnabled_extraInitializers);
            __esDecorate(null, null, _reminderHoursBefore_decorators, { kind: "field", name: "reminderHoursBefore", static: false, private: false, access: { has: obj => "reminderHoursBefore" in obj, get: obj => obj.reminderHoursBefore, set: (obj, value) => { obj.reminderHoursBefore = value; } }, metadata: _metadata }, _reminderHoursBefore_initializers, _reminderHoursBefore_extraInitializers);
            __esDecorate(null, null, _confirmationEnabled_decorators, { kind: "field", name: "confirmationEnabled", static: false, private: false, access: { has: obj => "confirmationEnabled" in obj, get: obj => obj.confirmationEnabled, set: (obj, value) => { obj.confirmationEnabled = value; } }, metadata: _metadata }, _confirmationEnabled_initializers, _confirmationEnabled_extraInitializers);
            __esDecorate(null, null, _confirmationHoursBefore_decorators, { kind: "field", name: "confirmationHoursBefore", static: false, private: false, access: { has: obj => "confirmationHoursBefore" in obj, get: obj => obj.confirmationHoursBefore, set: (obj, value) => { obj.confirmationHoursBefore = value; } }, metadata: _metadata }, _confirmationHoursBefore_initializers, _confirmationHoursBefore_extraInitializers);
            __esDecorate(null, null, _birthdayEnabled_decorators, { kind: "field", name: "birthdayEnabled", static: false, private: false, access: { has: obj => "birthdayEnabled" in obj, get: obj => obj.birthdayEnabled, set: (obj, value) => { obj.birthdayEnabled = value; } }, metadata: _metadata }, _birthdayEnabled_initializers, _birthdayEnabled_extraInitializers);
            __esDecorate(null, null, _birthdayTime_decorators, { kind: "field", name: "birthdayTime", static: false, private: false, access: { has: obj => "birthdayTime" in obj, get: obj => obj.birthdayTime, set: (obj, value) => { obj.birthdayTime = value; } }, metadata: _metadata }, _birthdayTime_initializers, _birthdayTime_extraInitializers);
            __esDecorate(null, null, _birthdayDiscountPercent_decorators, { kind: "field", name: "birthdayDiscountPercent", static: false, private: false, access: { has: obj => "birthdayDiscountPercent" in obj, get: obj => obj.birthdayDiscountPercent, set: (obj, value) => { obj.birthdayDiscountPercent = value; } }, metadata: _metadata }, _birthdayDiscountPercent_initializers, _birthdayDiscountPercent_extraInitializers);
            __esDecorate(null, null, _reviewRequestEnabled_decorators, { kind: "field", name: "reviewRequestEnabled", static: false, private: false, access: { has: obj => "reviewRequestEnabled" in obj, get: obj => obj.reviewRequestEnabled, set: (obj, value) => { obj.reviewRequestEnabled = value; } }, metadata: _metadata }, _reviewRequestEnabled_initializers, _reviewRequestEnabled_extraInitializers);
            __esDecorate(null, null, _reviewRequestHoursAfter_decorators, { kind: "field", name: "reviewRequestHoursAfter", static: false, private: false, access: { has: obj => "reviewRequestHoursAfter" in obj, get: obj => obj.reviewRequestHoursAfter, set: (obj, value) => { obj.reviewRequestHoursAfter = value; } }, metadata: _metadata }, _reviewRequestHoursAfter_initializers, _reviewRequestHoursAfter_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // WhatsApp
        whatsappEnabled = __runInitializers(this, _whatsappEnabled_initializers, void 0);
        whatsappProvider = (__runInitializers(this, _whatsappEnabled_extraInitializers), __runInitializers(this, _whatsappProvider_initializers, void 0));
        whatsappApiKey = (__runInitializers(this, _whatsappProvider_extraInitializers), __runInitializers(this, _whatsappApiKey_initializers, void 0));
        whatsappPhoneNumberId = (__runInitializers(this, _whatsappApiKey_extraInitializers), __runInitializers(this, _whatsappPhoneNumberId_initializers, void 0));
        whatsappBusinessAccountId = (__runInitializers(this, _whatsappPhoneNumberId_extraInitializers), __runInitializers(this, _whatsappBusinessAccountId_initializers, void 0));
        // SMS
        smsEnabled = (__runInitializers(this, _whatsappBusinessAccountId_extraInitializers), __runInitializers(this, _smsEnabled_initializers, void 0));
        smsProvider = (__runInitializers(this, _smsEnabled_extraInitializers), __runInitializers(this, _smsProvider_initializers, void 0));
        smsApiKey = (__runInitializers(this, _smsProvider_extraInitializers), __runInitializers(this, _smsApiKey_initializers, void 0));
        smsAccountSid = (__runInitializers(this, _smsApiKey_extraInitializers), __runInitializers(this, _smsAccountSid_initializers, void 0));
        smsPhoneNumber = (__runInitializers(this, _smsAccountSid_extraInitializers), __runInitializers(this, _smsPhoneNumber_initializers, void 0));
        // Lembretes
        reminderEnabled = (__runInitializers(this, _smsPhoneNumber_extraInitializers), __runInitializers(this, _reminderEnabled_initializers, void 0));
        reminderHoursBefore = (__runInitializers(this, _reminderEnabled_extraInitializers), __runInitializers(this, _reminderHoursBefore_initializers, void 0));
        // Confirmação
        confirmationEnabled = (__runInitializers(this, _reminderHoursBefore_extraInitializers), __runInitializers(this, _confirmationEnabled_initializers, void 0));
        confirmationHoursBefore = (__runInitializers(this, _confirmationEnabled_extraInitializers), __runInitializers(this, _confirmationHoursBefore_initializers, void 0));
        // Aniversário
        birthdayEnabled = (__runInitializers(this, _confirmationHoursBefore_extraInitializers), __runInitializers(this, _birthdayEnabled_initializers, void 0));
        birthdayTime = (__runInitializers(this, _birthdayEnabled_extraInitializers), __runInitializers(this, _birthdayTime_initializers, void 0));
        birthdayDiscountPercent = (__runInitializers(this, _birthdayTime_extraInitializers), __runInitializers(this, _birthdayDiscountPercent_initializers, void 0));
        // Review
        reviewRequestEnabled = (__runInitializers(this, _birthdayDiscountPercent_extraInitializers), __runInitializers(this, _reviewRequestEnabled_initializers, void 0));
        reviewRequestHoursAfter = (__runInitializers(this, _reviewRequestEnabled_extraInitializers), __runInitializers(this, _reviewRequestHoursAfter_initializers, void 0));
        constructor() {
            __runInitializers(this, _reviewRequestHoursAfter_extraInitializers);
        }
    };
})();
exports.UpdateAutomationSettingsDto = UpdateAutomationSettingsDto;
let CreateTemplateDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _channel_decorators;
    let _channel_initializers = [];
    let _channel_extraInitializers = [];
    let _subject_decorators;
    let _subject_initializers = [];
    let _subject_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _isDefault_decorators;
    let _isDefault_initializers = [];
    let _isDefault_extraInitializers = [];
    let _triggerHoursBefore_decorators;
    let _triggerHoursBefore_initializers = [];
    let _triggerHoursBefore_extraInitializers = [];
    return class CreateTemplateDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do template', example: 'Lembrete 24h' }), (0, class_validator_1.IsString)()];
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo do template', enum: MessageTemplateType, example: 'APPOINTMENT_REMINDER' }), (0, class_validator_1.IsEnum)(MessageTemplateType)];
            _channel_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' }), (0, class_validator_1.IsEnum)(MessageChannel), (0, class_validator_1.IsOptional)()];
            _subject_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Assunto (para email)', example: 'Lembrete de agendamento' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _content_decorators = [(0, swagger_1.ApiProperty)({ description: 'Conteúdo do template (suporta variáveis)', example: 'Olá {{nome}}, seu agendamento é amanhã às {{horario}}' }), (0, class_validator_1.IsString)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Template ativo', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _isDefault_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Template padrão para o tipo', example: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _triggerHoursBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas antes do evento para disparar', example: 24 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: obj => "channel" in obj, get: obj => obj.channel, set: (obj, value) => { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
            __esDecorate(null, null, _subject_decorators, { kind: "field", name: "subject", static: false, private: false, access: { has: obj => "subject" in obj, get: obj => obj.subject, set: (obj, value) => { obj.subject = value; } }, metadata: _metadata }, _subject_initializers, _subject_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: obj => "isDefault" in obj, get: obj => obj.isDefault, set: (obj, value) => { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
            __esDecorate(null, null, _triggerHoursBefore_decorators, { kind: "field", name: "triggerHoursBefore", static: false, private: false, access: { has: obj => "triggerHoursBefore" in obj, get: obj => obj.triggerHoursBefore, set: (obj, value) => { obj.triggerHoursBefore = value; } }, metadata: _metadata }, _triggerHoursBefore_initializers, _triggerHoursBefore_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        channel = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _channel_initializers, void 0));
        subject = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _subject_initializers, void 0));
        content = (__runInitializers(this, _subject_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        isActive = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        isDefault = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
        triggerHoursBefore = (__runInitializers(this, _isDefault_extraInitializers), __runInitializers(this, _triggerHoursBefore_initializers, void 0));
        constructor() {
            __runInitializers(this, _triggerHoursBefore_extraInitializers);
        }
    };
})();
exports.CreateTemplateDto = CreateTemplateDto;
let UpdateTemplateDto = (() => {
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _channel_decorators;
    let _channel_initializers = [];
    let _channel_extraInitializers = [];
    let _subject_decorators;
    let _subject_initializers = [];
    let _subject_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    let _isDefault_decorators;
    let _isDefault_initializers = [];
    let _isDefault_extraInitializers = [];
    let _triggerHoursBefore_decorators;
    let _triggerHoursBefore_initializers = [];
    let _triggerHoursBefore_extraInitializers = [];
    return class UpdateTemplateDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do template', example: 'Lembrete 24h' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _type_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo do template', enum: MessageTemplateType, example: 'APPOINTMENT_REMINDER' }), (0, class_validator_1.IsEnum)(MessageTemplateType), (0, class_validator_1.IsOptional)()];
            _channel_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' }), (0, class_validator_1.IsEnum)(MessageChannel), (0, class_validator_1.IsOptional)()];
            _subject_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Assunto (para email)', example: 'Lembrete de agendamento' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _content_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Conteúdo do template', example: 'Olá {{nome}}, seu agendamento é amanhã às {{horario}}' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Template ativo', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _isDefault_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Template padrão para o tipo', example: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _triggerHoursBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas antes do evento para disparar', example: 24 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: obj => "channel" in obj, get: obj => obj.channel, set: (obj, value) => { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
            __esDecorate(null, null, _subject_decorators, { kind: "field", name: "subject", static: false, private: false, access: { has: obj => "subject" in obj, get: obj => obj.subject, set: (obj, value) => { obj.subject = value; } }, metadata: _metadata }, _subject_initializers, _subject_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: obj => "isDefault" in obj, get: obj => obj.isDefault, set: (obj, value) => { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
            __esDecorate(null, null, _triggerHoursBefore_decorators, { kind: "field", name: "triggerHoursBefore", static: false, private: false, access: { has: obj => "triggerHoursBefore" in obj, get: obj => obj.triggerHoursBefore, set: (obj, value) => { obj.triggerHoursBefore = value; } }, metadata: _metadata }, _triggerHoursBefore_initializers, _triggerHoursBefore_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        name = __runInitializers(this, _name_initializers, void 0);
        type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        channel = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _channel_initializers, void 0));
        subject = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _subject_initializers, void 0));
        content = (__runInitializers(this, _subject_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        isActive = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        isDefault = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
        triggerHoursBefore = (__runInitializers(this, _isDefault_extraInitializers), __runInitializers(this, _triggerHoursBefore_initializers, void 0));
        constructor() {
            __runInitializers(this, _triggerHoursBefore_extraInitializers);
        }
    };
})();
exports.UpdateTemplateDto = UpdateTemplateDto;
let SendMessageDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _phoneNumber_decorators;
    let _phoneNumber_initializers = [];
    let _phoneNumber_extraInitializers = [];
    let _channel_decorators;
    let _channel_initializers = [];
    let _channel_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    let _templateId_decorators;
    let _templateId_initializers = [];
    let _templateId_extraInitializers = [];
    let _appointmentId_decorators;
    let _appointmentId_initializers = [];
    let _appointmentId_extraInitializers = [];
    return class SendMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _phoneNumber_decorators = [(0, swagger_1.ApiProperty)({ description: 'Número de telefone', example: '5511999998888' }), (0, class_validator_1.IsString)()];
            _channel_decorators = [(0, swagger_1.ApiProperty)({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' }), (0, class_validator_1.IsEnum)(MessageChannel)];
            _content_decorators = [(0, swagger_1.ApiProperty)({ description: 'Conteúdo da mensagem', example: 'Olá! Esta é uma mensagem de teste.' }), (0, class_validator_1.IsString)()];
            _templateId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do template (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _appointmentId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do agendamento (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: obj => "phoneNumber" in obj, get: obj => obj.phoneNumber, set: (obj, value) => { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: obj => "channel" in obj, get: obj => obj.channel, set: (obj, value) => { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _templateId_decorators, { kind: "field", name: "templateId", static: false, private: false, access: { has: obj => "templateId" in obj, get: obj => obj.templateId, set: (obj, value) => { obj.templateId = value; } }, metadata: _metadata }, _templateId_initializers, _templateId_extraInitializers);
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: obj => "appointmentId" in obj, get: obj => obj.appointmentId, set: (obj, value) => { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        phoneNumber = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
        channel = (__runInitializers(this, _phoneNumber_extraInitializers), __runInitializers(this, _channel_initializers, void 0));
        content = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        templateId = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _templateId_initializers, void 0));
        appointmentId = (__runInitializers(this, _templateId_extraInitializers), __runInitializers(this, _appointmentId_initializers, void 0));
        constructor() {
            __runInitializers(this, _appointmentId_extraInitializers);
        }
    };
})();
exports.SendMessageDto = SendMessageDto;
let SendTestMessageDto = (() => {
    let _channel_decorators;
    let _channel_initializers = [];
    let _channel_extraInitializers = [];
    let _phoneNumber_decorators;
    let _phoneNumber_initializers = [];
    let _phoneNumber_extraInitializers = [];
    return class SendTestMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _channel_decorators = [(0, swagger_1.ApiProperty)({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' }), (0, class_validator_1.IsEnum)(MessageChannel)];
            _phoneNumber_decorators = [(0, swagger_1.ApiProperty)({ description: 'Número de telefone para teste', example: '5511999998888' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: obj => "channel" in obj, get: obj => obj.channel, set: (obj, value) => { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: obj => "phoneNumber" in obj, get: obj => obj.phoneNumber, set: (obj, value) => { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        channel = __runInitializers(this, _channel_initializers, void 0);
        phoneNumber = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
        constructor() {
            __runInitializers(this, _phoneNumber_extraInitializers);
        }
    };
})();
exports.SendTestMessageDto = SendTestMessageDto;
let MessageLogFiltersDto = (() => {
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _channel_decorators;
    let _channel_initializers = [];
    let _channel_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    let _limit_extraInitializers = [];
    let _offset_decorators;
    let _offset_initializers = [];
    let _offset_extraInitializers = [];
    return class MessageLogFiltersDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por status da mensagem', enum: MessageStatus, example: 'SENT' }), (0, class_validator_1.IsEnum)(MessageStatus), (0, class_validator_1.IsOptional)()];
            _channel_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por canal de envio', enum: MessageChannel, example: 'WHATSAPP' }), (0, class_validator_1.IsEnum)(MessageChannel), (0, class_validator_1.IsOptional)()];
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Filtrar por cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _startDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data inicial (ISO 8601)', example: '2024-01-01T00:00:00Z' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _endDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data final (ISO 8601)', example: '2024-12-31T23:59:59Z' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _limit_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Limite de registros', example: 50 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _offset_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Offset para paginação', example: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: obj => "channel" in obj, get: obj => obj.channel, set: (obj, value) => { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _offset_decorators, { kind: "field", name: "offset", static: false, private: false, access: { has: obj => "offset" in obj, get: obj => obj.offset, set: (obj, value) => { obj.offset = value; } }, metadata: _metadata }, _offset_initializers, _offset_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        status = __runInitializers(this, _status_initializers, void 0);
        channel = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _channel_initializers, void 0));
        clientId = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        startDate = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        limit = (__runInitializers(this, _endDate_extraInitializers), __runInitializers(this, _limit_initializers, void 0));
        offset = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _offset_initializers, void 0));
        constructor() {
            __runInitializers(this, _offset_extraInitializers);
        }
    };
})();
exports.MessageLogFiltersDto = MessageLogFiltersDto;
//# sourceMappingURL=dto.js.map
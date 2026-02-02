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
exports.GenerateAssistedLinkDto = exports.RescheduleOnlineBookingDto = exports.CancelOnlineBookingDto = exports.CreateOnlineBookingDto = exports.GetAvailableSlotsDto = exports.CheckAvailabilityDto = exports.ProcessDepositPaymentDto = exports.CreateDepositDto = exports.UpdateClientBookingRuleDto = exports.CreateClientBookingRuleDto = exports.VerifyOtpDto = exports.SendOtpDto = exports.ConvertHoldDto = exports.CreateHoldDto = exports.UpdateOnlineBookingSettingsDto = exports.CreateOnlineBookingSettingsDto = exports.DepositAppliesTo = exports.OperationMode = exports.BookingRuleType = exports.DepositStatus = exports.OtpType = exports.HoldStatus = exports.DepositType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
// ==================== ENUMS ====================
var DepositType;
(function (DepositType) {
    DepositType["NONE"] = "NONE";
    DepositType["FIXED"] = "FIXED";
    DepositType["PERCENTAGE"] = "PERCENTAGE";
})(DepositType || (exports.DepositType = DepositType = {}));
var HoldStatus;
(function (HoldStatus) {
    HoldStatus["ACTIVE"] = "ACTIVE";
    HoldStatus["CONVERTED"] = "CONVERTED";
    HoldStatus["EXPIRED"] = "EXPIRED";
    HoldStatus["RELEASED"] = "RELEASED";
})(HoldStatus || (exports.HoldStatus = HoldStatus = {}));
var OtpType;
(function (OtpType) {
    OtpType["PHONE_VERIFICATION"] = "PHONE_VERIFICATION";
    OtpType["BOOKING_CONFIRMATION"] = "BOOKING_CONFIRMATION";
    OtpType["CANCEL_BOOKING"] = "CANCEL_BOOKING";
})(OtpType || (exports.OtpType = OtpType = {}));
var DepositStatus;
(function (DepositStatus) {
    DepositStatus["PENDING"] = "PENDING";
    DepositStatus["PAID"] = "PAID";
    DepositStatus["REFUNDED"] = "REFUNDED";
    DepositStatus["FORFEITED"] = "FORFEITED";
})(DepositStatus || (exports.DepositStatus = DepositStatus = {}));
var BookingRuleType;
(function (BookingRuleType) {
    BookingRuleType["BLOCKED"] = "BLOCKED";
    BookingRuleType["VIP_ONLY"] = "VIP_ONLY";
    BookingRuleType["DEPOSIT_REQUIRED"] = "DEPOSIT_REQUIRED";
    BookingRuleType["RESTRICTED_SERVICES"] = "RESTRICTED_SERVICES";
})(BookingRuleType || (exports.BookingRuleType = BookingRuleType = {}));
// ==================== ONLINE BOOKING SETTINGS DTOs ====================
var OperationMode;
(function (OperationMode) {
    OperationMode["SECRETARY_ONLY"] = "SECRETARY_ONLY";
    OperationMode["SECRETARY_AND_ONLINE"] = "SECRETARY_AND_ONLINE";
    OperationMode["SECRETARY_WITH_LINK"] = "SECRETARY_WITH_LINK";
})(OperationMode || (exports.OperationMode = OperationMode = {}));
var DepositAppliesTo;
(function (DepositAppliesTo) {
    DepositAppliesTo["ALL"] = "ALL";
    DepositAppliesTo["NEW_CLIENTS"] = "NEW_CLIENTS";
    DepositAppliesTo["SPECIFIC_SERVICES"] = "SPECIFIC_SERVICES";
    DepositAppliesTo["SELECTED_CLIENTS"] = "SELECTED_CLIENTS";
})(DepositAppliesTo || (exports.DepositAppliesTo = DepositAppliesTo = {}));
let CreateOnlineBookingSettingsDto = (() => {
    let _enabled_decorators;
    let _enabled_initializers = [];
    let _enabled_extraInitializers = [];
    let _slug_decorators;
    let _slug_initializers = [];
    let _slug_extraInitializers = [];
    let _operationMode_decorators;
    let _operationMode_initializers = [];
    let _operationMode_extraInitializers = [];
    let _minAdvanceHours_decorators;
    let _minAdvanceHours_initializers = [];
    let _minAdvanceHours_extraInitializers = [];
    let _maxAdvanceDays_decorators;
    let _maxAdvanceDays_initializers = [];
    let _maxAdvanceDays_extraInitializers = [];
    let _holdDurationMinutes_decorators;
    let _holdDurationMinutes_initializers = [];
    let _holdDurationMinutes_extraInitializers = [];
    let _slotIntervalMinutes_decorators;
    let _slotIntervalMinutes_initializers = [];
    let _slotIntervalMinutes_extraInitializers = [];
    let _allowSameDayBooking_decorators;
    let _allowSameDayBooking_initializers = [];
    let _allowSameDayBooking_extraInitializers = [];
    let _cancellationHours_decorators;
    let _cancellationHours_initializers = [];
    let _cancellationHours_extraInitializers = [];
    let _cancellationPolicy_decorators;
    let _cancellationPolicy_initializers = [];
    let _cancellationPolicy_extraInitializers = [];
    let _allowRescheduling_decorators;
    let _allowRescheduling_initializers = [];
    let _allowRescheduling_extraInitializers = [];
    let _maxReschedules_decorators;
    let _maxReschedules_initializers = [];
    let _maxReschedules_extraInitializers = [];
    let _requirePhoneVerification_decorators;
    let _requirePhoneVerification_initializers = [];
    let _requirePhoneVerification_extraInitializers = [];
    let _requireDeposit_decorators;
    let _requireDeposit_initializers = [];
    let _requireDeposit_extraInitializers = [];
    let _depositType_decorators;
    let _depositType_initializers = [];
    let _depositType_extraInitializers = [];
    let _depositValue_decorators;
    let _depositValue_initializers = [];
    let _depositValue_extraInitializers = [];
    let _depositMinServices_decorators;
    let _depositMinServices_initializers = [];
    let _depositMinServices_extraInitializers = [];
    let _depositAppliesTo_decorators;
    let _depositAppliesTo_initializers = [];
    let _depositAppliesTo_extraInitializers = [];
    let _allowNewClients_decorators;
    let _allowNewClients_initializers = [];
    let _allowNewClients_extraInitializers = [];
    let _newClientRequiresApproval_decorators;
    let _newClientRequiresApproval_initializers = [];
    let _newClientRequiresApproval_extraInitializers = [];
    let _newClientDepositRequired_decorators;
    let _newClientDepositRequired_initializers = [];
    let _newClientDepositRequired_extraInitializers = [];
    let _maxDailyBookings_decorators;
    let _maxDailyBookings_initializers = [];
    let _maxDailyBookings_extraInitializers = [];
    let _maxWeeklyBookingsPerClient_decorators;
    let _maxWeeklyBookingsPerClient_initializers = [];
    let _maxWeeklyBookingsPerClient_extraInitializers = [];
    let _welcomeMessage_decorators;
    let _welcomeMessage_initializers = [];
    let _welcomeMessage_extraInitializers = [];
    let _confirmationMessage_decorators;
    let _confirmationMessage_initializers = [];
    let _confirmationMessage_extraInitializers = [];
    let _cancellationMessage_decorators;
    let _cancellationMessage_initializers = [];
    let _cancellationMessage_extraInitializers = [];
    let _termsUrl_decorators;
    let _termsUrl_initializers = [];
    let _termsUrl_extraInitializers = [];
    let _requireTermsAcceptance_decorators;
    let _requireTermsAcceptance_initializers = [];
    let _requireTermsAcceptance_extraInitializers = [];
    let _sendWhatsappConfirmation_decorators;
    let _sendWhatsappConfirmation_initializers = [];
    let _sendWhatsappConfirmation_extraInitializers = [];
    let _sendWhatsappReminder_decorators;
    let _sendWhatsappReminder_initializers = [];
    let _sendWhatsappReminder_extraInitializers = [];
    let _reminderHoursBefore_decorators;
    let _reminderHoursBefore_initializers = [];
    let _reminderHoursBefore_extraInitializers = [];
    return class CreateOnlineBookingSettingsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _enabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Agendamento online habilitado', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _slug_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Slug único do salão para URL pública', example: 'meu-salao', minLength: 3, maxLength: 100 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(3), (0, class_validator_1.MaxLength)(100), (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' }), (0, class_validator_1.IsOptional)()];
            _operationMode_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Modo de operação', enum: OperationMode, example: 'SECRETARY_AND_ONLINE' }), (0, class_validator_1.IsEnum)(OperationMode), (0, class_validator_1.IsOptional)()];
            _minAdvanceHours_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Antecedência mínima em horas', example: 2, minimum: 0, maximum: 168 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(168), (0, class_validator_1.IsOptional)()];
            _maxAdvanceDays_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Antecedência máxima em dias', example: 30, minimum: 1, maximum: 365 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(365), (0, class_validator_1.IsOptional)()];
            _holdDurationMinutes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Duração da reserva temporária em minutos', example: 15, minimum: 5, maximum: 60 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(5), (0, class_validator_1.Max)(60), (0, class_validator_1.IsOptional)()];
            _slotIntervalMinutes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Intervalo entre slots em minutos', example: 30, minimum: 15, maximum: 120 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(15), (0, class_validator_1.Max)(120), (0, class_validator_1.IsOptional)()];
            _allowSameDayBooking_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Permitir agendamento no mesmo dia', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _cancellationHours_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas mínimas para cancelamento', example: 24, minimum: 0, maximum: 168 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(168), (0, class_validator_1.IsOptional)()];
            _cancellationPolicy_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Política de cancelamento', example: 'Cancelamentos devem ser feitos com 24h de antecedência', maxLength: 2000 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(2000), (0, class_validator_1.IsOptional)()];
            _allowRescheduling_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Permitir reagendamento', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _maxReschedules_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de reagendamentos permitidos', example: 2, minimum: 0, maximum: 10 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.Max)(10), (0, class_validator_1.IsOptional)()];
            _requirePhoneVerification_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Exigir verificação de telefone por OTP', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _requireDeposit_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Exigir depósito/sinal', example: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _depositType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de depósito', enum: DepositType, example: 'FIXED' }), (0, class_validator_1.IsEnum)(DepositType), (0, class_validator_1.IsOptional)()];
            _depositValue_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Valor do depósito (fixo ou percentual)', example: 50.00, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _depositMinServices_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mínimo de serviços para exigir depósito', example: 1, minimum: 0 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0), (0, class_validator_1.IsOptional)()];
            _depositAppliesTo_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'A quem se aplica o depósito', enum: DepositAppliesTo, example: 'NEW_CLIENTS' }), (0, class_validator_1.IsEnum)(DepositAppliesTo), (0, class_validator_1.IsOptional)()];
            _allowNewClients_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Permitir novos clientes', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _newClientRequiresApproval_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Novos clientes precisam aprovação', example: false }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _newClientDepositRequired_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Novos clientes exigem depósito', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _maxDailyBookings_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de agendamentos por dia', example: 50, minimum: 1 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.IsOptional)()];
            _maxWeeklyBookingsPerClient_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Máximo de agendamentos semanais por cliente', example: 3, minimum: 1, maximum: 20 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(20), (0, class_validator_1.IsOptional)()];
            _welcomeMessage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem de boas-vindas', example: 'Bem-vindo ao nosso sistema de agendamento!', maxLength: 1000 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000), (0, class_validator_1.IsOptional)()];
            _confirmationMessage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem de confirmação', example: 'Seu agendamento foi confirmado!', maxLength: 1000 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000), (0, class_validator_1.IsOptional)()];
            _cancellationMessage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem de cancelamento', example: 'Seu agendamento foi cancelado.', maxLength: 1000 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000), (0, class_validator_1.IsOptional)()];
            _termsUrl_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'URL dos termos de uso', example: 'https://meusalao.com/termos', maxLength: 500 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(500), (0, class_validator_1.IsOptional)()];
            _requireTermsAcceptance_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Exigir aceite dos termos', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _sendWhatsappConfirmation_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Enviar confirmação via WhatsApp', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _sendWhatsappReminder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Enviar lembrete via WhatsApp', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _reminderHoursBefore_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horas antes para enviar lembrete', example: 24, minimum: 1, maximum: 72 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(72), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _enabled_decorators, { kind: "field", name: "enabled", static: false, private: false, access: { has: obj => "enabled" in obj, get: obj => obj.enabled, set: (obj, value) => { obj.enabled = value; } }, metadata: _metadata }, _enabled_initializers, _enabled_extraInitializers);
            __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: obj => "slug" in obj, get: obj => obj.slug, set: (obj, value) => { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
            __esDecorate(null, null, _operationMode_decorators, { kind: "field", name: "operationMode", static: false, private: false, access: { has: obj => "operationMode" in obj, get: obj => obj.operationMode, set: (obj, value) => { obj.operationMode = value; } }, metadata: _metadata }, _operationMode_initializers, _operationMode_extraInitializers);
            __esDecorate(null, null, _minAdvanceHours_decorators, { kind: "field", name: "minAdvanceHours", static: false, private: false, access: { has: obj => "minAdvanceHours" in obj, get: obj => obj.minAdvanceHours, set: (obj, value) => { obj.minAdvanceHours = value; } }, metadata: _metadata }, _minAdvanceHours_initializers, _minAdvanceHours_extraInitializers);
            __esDecorate(null, null, _maxAdvanceDays_decorators, { kind: "field", name: "maxAdvanceDays", static: false, private: false, access: { has: obj => "maxAdvanceDays" in obj, get: obj => obj.maxAdvanceDays, set: (obj, value) => { obj.maxAdvanceDays = value; } }, metadata: _metadata }, _maxAdvanceDays_initializers, _maxAdvanceDays_extraInitializers);
            __esDecorate(null, null, _holdDurationMinutes_decorators, { kind: "field", name: "holdDurationMinutes", static: false, private: false, access: { has: obj => "holdDurationMinutes" in obj, get: obj => obj.holdDurationMinutes, set: (obj, value) => { obj.holdDurationMinutes = value; } }, metadata: _metadata }, _holdDurationMinutes_initializers, _holdDurationMinutes_extraInitializers);
            __esDecorate(null, null, _slotIntervalMinutes_decorators, { kind: "field", name: "slotIntervalMinutes", static: false, private: false, access: { has: obj => "slotIntervalMinutes" in obj, get: obj => obj.slotIntervalMinutes, set: (obj, value) => { obj.slotIntervalMinutes = value; } }, metadata: _metadata }, _slotIntervalMinutes_initializers, _slotIntervalMinutes_extraInitializers);
            __esDecorate(null, null, _allowSameDayBooking_decorators, { kind: "field", name: "allowSameDayBooking", static: false, private: false, access: { has: obj => "allowSameDayBooking" in obj, get: obj => obj.allowSameDayBooking, set: (obj, value) => { obj.allowSameDayBooking = value; } }, metadata: _metadata }, _allowSameDayBooking_initializers, _allowSameDayBooking_extraInitializers);
            __esDecorate(null, null, _cancellationHours_decorators, { kind: "field", name: "cancellationHours", static: false, private: false, access: { has: obj => "cancellationHours" in obj, get: obj => obj.cancellationHours, set: (obj, value) => { obj.cancellationHours = value; } }, metadata: _metadata }, _cancellationHours_initializers, _cancellationHours_extraInitializers);
            __esDecorate(null, null, _cancellationPolicy_decorators, { kind: "field", name: "cancellationPolicy", static: false, private: false, access: { has: obj => "cancellationPolicy" in obj, get: obj => obj.cancellationPolicy, set: (obj, value) => { obj.cancellationPolicy = value; } }, metadata: _metadata }, _cancellationPolicy_initializers, _cancellationPolicy_extraInitializers);
            __esDecorate(null, null, _allowRescheduling_decorators, { kind: "field", name: "allowRescheduling", static: false, private: false, access: { has: obj => "allowRescheduling" in obj, get: obj => obj.allowRescheduling, set: (obj, value) => { obj.allowRescheduling = value; } }, metadata: _metadata }, _allowRescheduling_initializers, _allowRescheduling_extraInitializers);
            __esDecorate(null, null, _maxReschedules_decorators, { kind: "field", name: "maxReschedules", static: false, private: false, access: { has: obj => "maxReschedules" in obj, get: obj => obj.maxReschedules, set: (obj, value) => { obj.maxReschedules = value; } }, metadata: _metadata }, _maxReschedules_initializers, _maxReschedules_extraInitializers);
            __esDecorate(null, null, _requirePhoneVerification_decorators, { kind: "field", name: "requirePhoneVerification", static: false, private: false, access: { has: obj => "requirePhoneVerification" in obj, get: obj => obj.requirePhoneVerification, set: (obj, value) => { obj.requirePhoneVerification = value; } }, metadata: _metadata }, _requirePhoneVerification_initializers, _requirePhoneVerification_extraInitializers);
            __esDecorate(null, null, _requireDeposit_decorators, { kind: "field", name: "requireDeposit", static: false, private: false, access: { has: obj => "requireDeposit" in obj, get: obj => obj.requireDeposit, set: (obj, value) => { obj.requireDeposit = value; } }, metadata: _metadata }, _requireDeposit_initializers, _requireDeposit_extraInitializers);
            __esDecorate(null, null, _depositType_decorators, { kind: "field", name: "depositType", static: false, private: false, access: { has: obj => "depositType" in obj, get: obj => obj.depositType, set: (obj, value) => { obj.depositType = value; } }, metadata: _metadata }, _depositType_initializers, _depositType_extraInitializers);
            __esDecorate(null, null, _depositValue_decorators, { kind: "field", name: "depositValue", static: false, private: false, access: { has: obj => "depositValue" in obj, get: obj => obj.depositValue, set: (obj, value) => { obj.depositValue = value; } }, metadata: _metadata }, _depositValue_initializers, _depositValue_extraInitializers);
            __esDecorate(null, null, _depositMinServices_decorators, { kind: "field", name: "depositMinServices", static: false, private: false, access: { has: obj => "depositMinServices" in obj, get: obj => obj.depositMinServices, set: (obj, value) => { obj.depositMinServices = value; } }, metadata: _metadata }, _depositMinServices_initializers, _depositMinServices_extraInitializers);
            __esDecorate(null, null, _depositAppliesTo_decorators, { kind: "field", name: "depositAppliesTo", static: false, private: false, access: { has: obj => "depositAppliesTo" in obj, get: obj => obj.depositAppliesTo, set: (obj, value) => { obj.depositAppliesTo = value; } }, metadata: _metadata }, _depositAppliesTo_initializers, _depositAppliesTo_extraInitializers);
            __esDecorate(null, null, _allowNewClients_decorators, { kind: "field", name: "allowNewClients", static: false, private: false, access: { has: obj => "allowNewClients" in obj, get: obj => obj.allowNewClients, set: (obj, value) => { obj.allowNewClients = value; } }, metadata: _metadata }, _allowNewClients_initializers, _allowNewClients_extraInitializers);
            __esDecorate(null, null, _newClientRequiresApproval_decorators, { kind: "field", name: "newClientRequiresApproval", static: false, private: false, access: { has: obj => "newClientRequiresApproval" in obj, get: obj => obj.newClientRequiresApproval, set: (obj, value) => { obj.newClientRequiresApproval = value; } }, metadata: _metadata }, _newClientRequiresApproval_initializers, _newClientRequiresApproval_extraInitializers);
            __esDecorate(null, null, _newClientDepositRequired_decorators, { kind: "field", name: "newClientDepositRequired", static: false, private: false, access: { has: obj => "newClientDepositRequired" in obj, get: obj => obj.newClientDepositRequired, set: (obj, value) => { obj.newClientDepositRequired = value; } }, metadata: _metadata }, _newClientDepositRequired_initializers, _newClientDepositRequired_extraInitializers);
            __esDecorate(null, null, _maxDailyBookings_decorators, { kind: "field", name: "maxDailyBookings", static: false, private: false, access: { has: obj => "maxDailyBookings" in obj, get: obj => obj.maxDailyBookings, set: (obj, value) => { obj.maxDailyBookings = value; } }, metadata: _metadata }, _maxDailyBookings_initializers, _maxDailyBookings_extraInitializers);
            __esDecorate(null, null, _maxWeeklyBookingsPerClient_decorators, { kind: "field", name: "maxWeeklyBookingsPerClient", static: false, private: false, access: { has: obj => "maxWeeklyBookingsPerClient" in obj, get: obj => obj.maxWeeklyBookingsPerClient, set: (obj, value) => { obj.maxWeeklyBookingsPerClient = value; } }, metadata: _metadata }, _maxWeeklyBookingsPerClient_initializers, _maxWeeklyBookingsPerClient_extraInitializers);
            __esDecorate(null, null, _welcomeMessage_decorators, { kind: "field", name: "welcomeMessage", static: false, private: false, access: { has: obj => "welcomeMessage" in obj, get: obj => obj.welcomeMessage, set: (obj, value) => { obj.welcomeMessage = value; } }, metadata: _metadata }, _welcomeMessage_initializers, _welcomeMessage_extraInitializers);
            __esDecorate(null, null, _confirmationMessage_decorators, { kind: "field", name: "confirmationMessage", static: false, private: false, access: { has: obj => "confirmationMessage" in obj, get: obj => obj.confirmationMessage, set: (obj, value) => { obj.confirmationMessage = value; } }, metadata: _metadata }, _confirmationMessage_initializers, _confirmationMessage_extraInitializers);
            __esDecorate(null, null, _cancellationMessage_decorators, { kind: "field", name: "cancellationMessage", static: false, private: false, access: { has: obj => "cancellationMessage" in obj, get: obj => obj.cancellationMessage, set: (obj, value) => { obj.cancellationMessage = value; } }, metadata: _metadata }, _cancellationMessage_initializers, _cancellationMessage_extraInitializers);
            __esDecorate(null, null, _termsUrl_decorators, { kind: "field", name: "termsUrl", static: false, private: false, access: { has: obj => "termsUrl" in obj, get: obj => obj.termsUrl, set: (obj, value) => { obj.termsUrl = value; } }, metadata: _metadata }, _termsUrl_initializers, _termsUrl_extraInitializers);
            __esDecorate(null, null, _requireTermsAcceptance_decorators, { kind: "field", name: "requireTermsAcceptance", static: false, private: false, access: { has: obj => "requireTermsAcceptance" in obj, get: obj => obj.requireTermsAcceptance, set: (obj, value) => { obj.requireTermsAcceptance = value; } }, metadata: _metadata }, _requireTermsAcceptance_initializers, _requireTermsAcceptance_extraInitializers);
            __esDecorate(null, null, _sendWhatsappConfirmation_decorators, { kind: "field", name: "sendWhatsappConfirmation", static: false, private: false, access: { has: obj => "sendWhatsappConfirmation" in obj, get: obj => obj.sendWhatsappConfirmation, set: (obj, value) => { obj.sendWhatsappConfirmation = value; } }, metadata: _metadata }, _sendWhatsappConfirmation_initializers, _sendWhatsappConfirmation_extraInitializers);
            __esDecorate(null, null, _sendWhatsappReminder_decorators, { kind: "field", name: "sendWhatsappReminder", static: false, private: false, access: { has: obj => "sendWhatsappReminder" in obj, get: obj => obj.sendWhatsappReminder, set: (obj, value) => { obj.sendWhatsappReminder = value; } }, metadata: _metadata }, _sendWhatsappReminder_initializers, _sendWhatsappReminder_extraInitializers);
            __esDecorate(null, null, _reminderHoursBefore_decorators, { kind: "field", name: "reminderHoursBefore", static: false, private: false, access: { has: obj => "reminderHoursBefore" in obj, get: obj => obj.reminderHoursBefore, set: (obj, value) => { obj.reminderHoursBefore = value; } }, metadata: _metadata }, _reminderHoursBefore_initializers, _reminderHoursBefore_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        enabled = __runInitializers(this, _enabled_initializers, void 0);
        slug = (__runInitializers(this, _enabled_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
        operationMode = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _operationMode_initializers, void 0));
        minAdvanceHours = (__runInitializers(this, _operationMode_extraInitializers), __runInitializers(this, _minAdvanceHours_initializers, void 0));
        maxAdvanceDays = (__runInitializers(this, _minAdvanceHours_extraInitializers), __runInitializers(this, _maxAdvanceDays_initializers, void 0));
        holdDurationMinutes = (__runInitializers(this, _maxAdvanceDays_extraInitializers), __runInitializers(this, _holdDurationMinutes_initializers, void 0));
        slotIntervalMinutes = (__runInitializers(this, _holdDurationMinutes_extraInitializers), __runInitializers(this, _slotIntervalMinutes_initializers, void 0));
        allowSameDayBooking = (__runInitializers(this, _slotIntervalMinutes_extraInitializers), __runInitializers(this, _allowSameDayBooking_initializers, void 0));
        cancellationHours = (__runInitializers(this, _allowSameDayBooking_extraInitializers), __runInitializers(this, _cancellationHours_initializers, void 0));
        cancellationPolicy = (__runInitializers(this, _cancellationHours_extraInitializers), __runInitializers(this, _cancellationPolicy_initializers, void 0));
        allowRescheduling = (__runInitializers(this, _cancellationPolicy_extraInitializers), __runInitializers(this, _allowRescheduling_initializers, void 0));
        maxReschedules = (__runInitializers(this, _allowRescheduling_extraInitializers), __runInitializers(this, _maxReschedules_initializers, void 0));
        requirePhoneVerification = (__runInitializers(this, _maxReschedules_extraInitializers), __runInitializers(this, _requirePhoneVerification_initializers, void 0));
        requireDeposit = (__runInitializers(this, _requirePhoneVerification_extraInitializers), __runInitializers(this, _requireDeposit_initializers, void 0));
        depositType = (__runInitializers(this, _requireDeposit_extraInitializers), __runInitializers(this, _depositType_initializers, void 0));
        depositValue = (__runInitializers(this, _depositType_extraInitializers), __runInitializers(this, _depositValue_initializers, void 0));
        depositMinServices = (__runInitializers(this, _depositValue_extraInitializers), __runInitializers(this, _depositMinServices_initializers, void 0));
        depositAppliesTo = (__runInitializers(this, _depositMinServices_extraInitializers), __runInitializers(this, _depositAppliesTo_initializers, void 0));
        allowNewClients = (__runInitializers(this, _depositAppliesTo_extraInitializers), __runInitializers(this, _allowNewClients_initializers, void 0));
        newClientRequiresApproval = (__runInitializers(this, _allowNewClients_extraInitializers), __runInitializers(this, _newClientRequiresApproval_initializers, void 0));
        newClientDepositRequired = (__runInitializers(this, _newClientRequiresApproval_extraInitializers), __runInitializers(this, _newClientDepositRequired_initializers, void 0));
        maxDailyBookings = (__runInitializers(this, _newClientDepositRequired_extraInitializers), __runInitializers(this, _maxDailyBookings_initializers, void 0));
        maxWeeklyBookingsPerClient = (__runInitializers(this, _maxDailyBookings_extraInitializers), __runInitializers(this, _maxWeeklyBookingsPerClient_initializers, void 0));
        welcomeMessage = (__runInitializers(this, _maxWeeklyBookingsPerClient_extraInitializers), __runInitializers(this, _welcomeMessage_initializers, void 0));
        confirmationMessage = (__runInitializers(this, _welcomeMessage_extraInitializers), __runInitializers(this, _confirmationMessage_initializers, void 0));
        cancellationMessage = (__runInitializers(this, _confirmationMessage_extraInitializers), __runInitializers(this, _cancellationMessage_initializers, void 0));
        termsUrl = (__runInitializers(this, _cancellationMessage_extraInitializers), __runInitializers(this, _termsUrl_initializers, void 0));
        requireTermsAcceptance = (__runInitializers(this, _termsUrl_extraInitializers), __runInitializers(this, _requireTermsAcceptance_initializers, void 0));
        sendWhatsappConfirmation = (__runInitializers(this, _requireTermsAcceptance_extraInitializers), __runInitializers(this, _sendWhatsappConfirmation_initializers, void 0));
        sendWhatsappReminder = (__runInitializers(this, _sendWhatsappConfirmation_extraInitializers), __runInitializers(this, _sendWhatsappReminder_initializers, void 0));
        reminderHoursBefore = (__runInitializers(this, _sendWhatsappReminder_extraInitializers), __runInitializers(this, _reminderHoursBefore_initializers, void 0));
        constructor() {
            __runInitializers(this, _reminderHoursBefore_extraInitializers);
        }
    };
})();
exports.CreateOnlineBookingSettingsDto = CreateOnlineBookingSettingsDto;
class UpdateOnlineBookingSettingsDto extends CreateOnlineBookingSettingsDto {
}
exports.UpdateOnlineBookingSettingsDto = UpdateOnlineBookingSettingsDto;
// ==================== APPOINTMENT HOLD DTOs ====================
let CreateHoldDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _endTime_decorators;
    let _endTime_initializers = [];
    let _endTime_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    return class CreateHoldDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _serviceId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do serviço', example: 1 }), (0, class_validator_1.IsNumber)()];
            _date_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2024-02-15' }), (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })];
            _startTime_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário de início (HH:MM)', example: '14:00' }), (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'startTime deve estar no formato HH:MM' })];
            _endTime_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário de fim (HH:MM)', example: '15:00' }), (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'endTime deve estar no formato HH:MM' })];
            _clientPhone_decorators = [(0, swagger_1.ApiProperty)({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })];
            _clientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do cliente', example: 'Maria Silva', maxLength: 255 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255), (0, class_validator_1.IsOptional)()];
            _sessionId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID da sessão do cliente', example: 'sess_abc123', maxLength: 100 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _endTime_decorators, { kind: "field", name: "endTime", static: false, private: false, access: { has: obj => "endTime" in obj, get: obj => obj.endTime, set: (obj, value) => { obj.endTime = value; } }, metadata: _metadata }, _endTime_initializers, _endTime_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        serviceId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        date = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        startTime = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _startTime_initializers, void 0));
        endTime = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _endTime_initializers, void 0));
        clientPhone = (__runInitializers(this, _endTime_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        clientName = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        sessionId = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
        constructor() {
            __runInitializers(this, _sessionId_extraInitializers);
        }
    };
})();
exports.CreateHoldDto = CreateHoldDto;
let ConvertHoldDto = (() => {
    let _holdId_decorators;
    let _holdId_initializers = [];
    let _holdId_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _clientEmail_decorators;
    let _clientEmail_initializers = [];
    let _clientEmail_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _acceptedTerms_decorators;
    let _acceptedTerms_initializers = [];
    let _acceptedTerms_extraInitializers = [];
    return class ConvertHoldDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _holdId_decorators = [(0, class_validator_1.IsUUID)()];
            _clientName_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255), (0, class_validator_1.IsOptional)()];
            _clientEmail_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255), (0, class_validator_1.IsOptional)()];
            _notes_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000), (0, class_validator_1.IsOptional)()];
            _acceptedTerms_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _holdId_decorators, { kind: "field", name: "holdId", static: false, private: false, access: { has: obj => "holdId" in obj, get: obj => obj.holdId, set: (obj, value) => { obj.holdId = value; } }, metadata: _metadata }, _holdId_initializers, _holdId_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _clientEmail_decorators, { kind: "field", name: "clientEmail", static: false, private: false, access: { has: obj => "clientEmail" in obj, get: obj => obj.clientEmail, set: (obj, value) => { obj.clientEmail = value; } }, metadata: _metadata }, _clientEmail_initializers, _clientEmail_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _acceptedTerms_decorators, { kind: "field", name: "acceptedTerms", static: false, private: false, access: { has: obj => "acceptedTerms" in obj, get: obj => obj.acceptedTerms, set: (obj, value) => { obj.acceptedTerms = value; } }, metadata: _metadata }, _acceptedTerms_initializers, _acceptedTerms_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        holdId = __runInitializers(this, _holdId_initializers, void 0);
        clientName = (__runInitializers(this, _holdId_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        clientEmail = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _clientEmail_initializers, void 0));
        notes = (__runInitializers(this, _clientEmail_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        acceptedTerms = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _acceptedTerms_initializers, void 0));
        constructor() {
            __runInitializers(this, _acceptedTerms_extraInitializers);
        }
    };
})();
exports.ConvertHoldDto = ConvertHoldDto;
// ==================== OTP DTOs ====================
let SendOtpDto = (() => {
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _holdId_decorators;
    let _holdId_initializers = [];
    let _holdId_extraInitializers = [];
    let _appointmentId_decorators;
    let _appointmentId_initializers = [];
    let _appointmentId_extraInitializers = [];
    return class SendOtpDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _phone_decorators = [(0, swagger_1.ApiProperty)({ description: 'Telefone para envio do OTP (10-11 dígitos)', example: '11999998888' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'phone deve ter 10 ou 11 dígitos' })];
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo de OTP', enum: OtpType, example: 'PHONE_VERIFICATION' }), (0, class_validator_1.IsEnum)(OtpType)];
            _holdId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID da reserva temporária (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _appointmentId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do agendamento (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _holdId_decorators, { kind: "field", name: "holdId", static: false, private: false, access: { has: obj => "holdId" in obj, get: obj => obj.holdId, set: (obj, value) => { obj.holdId = value; } }, metadata: _metadata }, _holdId_initializers, _holdId_extraInitializers);
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: obj => "appointmentId" in obj, get: obj => obj.appointmentId, set: (obj, value) => { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        phone = __runInitializers(this, _phone_initializers, void 0);
        type = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        holdId = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _holdId_initializers, void 0));
        appointmentId = (__runInitializers(this, _holdId_extraInitializers), __runInitializers(this, _appointmentId_initializers, void 0));
        constructor() {
            __runInitializers(this, _appointmentId_extraInitializers);
        }
    };
})();
exports.SendOtpDto = SendOtpDto;
let VerifyOtpDto = (() => {
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    return class VerifyOtpDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _phone_decorators = [(0, swagger_1.ApiProperty)({ description: 'Telefone usado no envio (10-11 dígitos)', example: '11999998888' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'phone deve ter 10 ou 11 dígitos' })];
            _code_decorators = [(0, swagger_1.ApiProperty)({ description: 'Código OTP de 6 dígitos', example: '123456' }), (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'code deve ter 6 dígitos' })];
            _type_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo de OTP', enum: OtpType, example: 'PHONE_VERIFICATION' }), (0, class_validator_1.IsEnum)(OtpType)];
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        phone = __runInitializers(this, _phone_initializers, void 0);
        code = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _code_initializers, void 0));
        type = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _type_initializers, void 0));
        constructor() {
            __runInitializers(this, _type_extraInitializers);
        }
    };
})();
exports.VerifyOtpDto = VerifyOtpDto;
// ==================== CLIENT BOOKING RULE DTOs ====================
let CreateClientBookingRuleDto = (() => {
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _ruleType_decorators;
    let _ruleType_initializers = [];
    let _ruleType_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _restrictedServiceIds_decorators;
    let _restrictedServiceIds_initializers = [];
    let _restrictedServiceIds_extraInitializers = [];
    let _expiresAt_decorators;
    let _expiresAt_initializers = [];
    let _expiresAt_extraInitializers = [];
    return class CreateClientBookingRuleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientPhone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' }), (0, class_validator_1.IsOptional)()];
            _clientId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _ruleType_decorators = [(0, swagger_1.ApiProperty)({ description: 'Tipo da regra de bloqueio', enum: ['BLOCKED', 'VIP_ONLY', 'DEPOSIT_REQUIRED', 'RESTRICTED_SERVICES'], example: 'BLOCKED' }), (0, class_validator_1.IsEnum)(BookingRuleType)];
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo da regra', example: 'Cliente não compareceu 3x seguidas', maxLength: 500 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(500), (0, class_validator_1.IsOptional)()];
            _restrictedServiceIds_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'IDs dos serviços restritos (para RESTRICTED_SERVICES)', example: [1, 2, 3], isArray: true, type: Number }), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsNumber)({}, { each: true }), (0, class_validator_1.IsOptional)()];
            _expiresAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data de expiração da regra (ISO 8601)', example: '2024-12-31T23:59:59Z' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _ruleType_decorators, { kind: "field", name: "ruleType", static: false, private: false, access: { has: obj => "ruleType" in obj, get: obj => obj.ruleType, set: (obj, value) => { obj.ruleType = value; } }, metadata: _metadata }, _ruleType_initializers, _ruleType_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _restrictedServiceIds_decorators, { kind: "field", name: "restrictedServiceIds", static: false, private: false, access: { has: obj => "restrictedServiceIds" in obj, get: obj => obj.restrictedServiceIds, set: (obj, value) => { obj.restrictedServiceIds = value; } }, metadata: _metadata }, _restrictedServiceIds_initializers, _restrictedServiceIds_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientPhone = __runInitializers(this, _clientPhone_initializers, void 0);
        clientId = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        ruleType = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _ruleType_initializers, void 0));
        reason = (__runInitializers(this, _ruleType_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        restrictedServiceIds = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _restrictedServiceIds_initializers, void 0));
        expiresAt = (__runInitializers(this, _restrictedServiceIds_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _expiresAt_extraInitializers);
        }
    };
})();
exports.CreateClientBookingRuleDto = CreateClientBookingRuleDto;
let UpdateClientBookingRuleDto = (() => {
    let _ruleType_decorators;
    let _ruleType_initializers = [];
    let _ruleType_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _restrictedServiceIds_decorators;
    let _restrictedServiceIds_initializers = [];
    let _restrictedServiceIds_extraInitializers = [];
    let _expiresAt_decorators;
    let _expiresAt_initializers = [];
    let _expiresAt_extraInitializers = [];
    let _isActive_decorators;
    let _isActive_initializers = [];
    let _isActive_extraInitializers = [];
    return class UpdateClientBookingRuleDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _ruleType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo da regra de bloqueio', enum: ['BLOCKED', 'VIP_ONLY', 'DEPOSIT_REQUIRED', 'RESTRICTED_SERVICES'], example: 'BLOCKED' }), (0, class_validator_1.IsEnum)(BookingRuleType), (0, class_validator_1.IsOptional)()];
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo da regra', example: 'Cliente não compareceu 3x seguidas', maxLength: 500 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(500), (0, class_validator_1.IsOptional)()];
            _restrictedServiceIds_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'IDs dos serviços restritos (para RESTRICTED_SERVICES)', example: [1, 2, 3], isArray: true, type: Number }), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsNumber)({}, { each: true }), (0, class_validator_1.IsOptional)()];
            _expiresAt_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Data de expiração da regra (ISO 8601)', example: '2024-12-31T23:59:59Z' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Regra ativa', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _ruleType_decorators, { kind: "field", name: "ruleType", static: false, private: false, access: { has: obj => "ruleType" in obj, get: obj => obj.ruleType, set: (obj, value) => { obj.ruleType = value; } }, metadata: _metadata }, _ruleType_initializers, _ruleType_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _restrictedServiceIds_decorators, { kind: "field", name: "restrictedServiceIds", static: false, private: false, access: { has: obj => "restrictedServiceIds" in obj, get: obj => obj.restrictedServiceIds, set: (obj, value) => { obj.restrictedServiceIds = value; } }, metadata: _metadata }, _restrictedServiceIds_initializers, _restrictedServiceIds_extraInitializers);
            __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: obj => "expiresAt" in obj, get: obj => obj.expiresAt, set: (obj, value) => { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: obj => "isActive" in obj, get: obj => obj.isActive, set: (obj, value) => { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        ruleType = __runInitializers(this, _ruleType_initializers, void 0);
        reason = (__runInitializers(this, _ruleType_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        restrictedServiceIds = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _restrictedServiceIds_initializers, void 0));
        expiresAt = (__runInitializers(this, _restrictedServiceIds_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
        isActive = (__runInitializers(this, _expiresAt_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
        constructor() {
            __runInitializers(this, _isActive_extraInitializers);
        }
    };
})();
exports.UpdateClientBookingRuleDto = UpdateClientBookingRuleDto;
// ==================== DEPOSIT DTOs ====================
let CreateDepositDto = (() => {
    let _appointmentId_decorators;
    let _appointmentId_initializers = [];
    let _appointmentId_extraInitializers = [];
    let _holdId_decorators;
    let _holdId_initializers = [];
    let _holdId_extraInitializers = [];
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    return class CreateDepositDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _appointmentId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _holdId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _clientId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _amount_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.01)];
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: obj => "appointmentId" in obj, get: obj => obj.appointmentId, set: (obj, value) => { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            __esDecorate(null, null, _holdId_decorators, { kind: "field", name: "holdId", static: false, private: false, access: { has: obj => "holdId" in obj, get: obj => obj.holdId, set: (obj, value) => { obj.holdId = value; } }, metadata: _metadata }, _holdId_initializers, _holdId_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        appointmentId = __runInitializers(this, _appointmentId_initializers, void 0);
        holdId = (__runInitializers(this, _appointmentId_extraInitializers), __runInitializers(this, _holdId_initializers, void 0));
        clientId = (__runInitializers(this, _holdId_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
        amount = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        constructor() {
            __runInitializers(this, _amount_extraInitializers);
        }
    };
})();
exports.CreateDepositDto = CreateDepositDto;
let ProcessDepositPaymentDto = (() => {
    let _depositId_decorators;
    let _depositId_initializers = [];
    let _depositId_extraInitializers = [];
    let _paymentMethod_decorators;
    let _paymentMethod_initializers = [];
    let _paymentMethod_extraInitializers = [];
    let _paymentReference_decorators;
    let _paymentReference_initializers = [];
    let _paymentReference_extraInitializers = [];
    let _mercadoPagoPaymentId_decorators;
    let _mercadoPagoPaymentId_initializers = [];
    let _mercadoPagoPaymentId_extraInitializers = [];
    return class ProcessDepositPaymentDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _depositId_decorators = [(0, class_validator_1.IsUUID)()];
            _paymentMethod_decorators = [(0, class_validator_1.IsString)()];
            _paymentReference_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _mercadoPagoPaymentId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _depositId_decorators, { kind: "field", name: "depositId", static: false, private: false, access: { has: obj => "depositId" in obj, get: obj => obj.depositId, set: (obj, value) => { obj.depositId = value; } }, metadata: _metadata }, _depositId_initializers, _depositId_extraInitializers);
            __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: obj => "paymentMethod" in obj, get: obj => obj.paymentMethod, set: (obj, value) => { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
            __esDecorate(null, null, _paymentReference_decorators, { kind: "field", name: "paymentReference", static: false, private: false, access: { has: obj => "paymentReference" in obj, get: obj => obj.paymentReference, set: (obj, value) => { obj.paymentReference = value; } }, metadata: _metadata }, _paymentReference_initializers, _paymentReference_extraInitializers);
            __esDecorate(null, null, _mercadoPagoPaymentId_decorators, { kind: "field", name: "mercadoPagoPaymentId", static: false, private: false, access: { has: obj => "mercadoPagoPaymentId" in obj, get: obj => obj.mercadoPagoPaymentId, set: (obj, value) => { obj.mercadoPagoPaymentId = value; } }, metadata: _metadata }, _mercadoPagoPaymentId_initializers, _mercadoPagoPaymentId_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        depositId = __runInitializers(this, _depositId_initializers, void 0);
        paymentMethod = (__runInitializers(this, _depositId_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
        paymentReference = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _paymentReference_initializers, void 0));
        mercadoPagoPaymentId = (__runInitializers(this, _paymentReference_extraInitializers), __runInitializers(this, _mercadoPagoPaymentId_initializers, void 0));
        constructor() {
            __runInitializers(this, _mercadoPagoPaymentId_extraInitializers);
        }
    };
})();
exports.ProcessDepositPaymentDto = ProcessDepositPaymentDto;
// ==================== PUBLIC BOOKING DTOs ====================
let CheckAvailabilityDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    return class CheckAvailabilityDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, class_validator_1.IsUUID)()];
            _serviceId_decorators = [(0, class_validator_1.IsNumber)()];
            _date_decorators = [(0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        serviceId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        date = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        constructor() {
            __runInitializers(this, _date_extraInitializers);
        }
    };
})();
exports.CheckAvailabilityDto = CheckAvailabilityDto;
let GetAvailableSlotsDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    return class GetAvailableSlotsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _serviceId_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _startDate_decorators = [(0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate deve estar no formato YYYY-MM-DD' })];
            _endDate_decorators = [(0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate deve estar no formato YYYY-MM-DD' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        serviceId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        startDate = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        constructor() {
            __runInitializers(this, _endDate_extraInitializers);
        }
    };
})();
exports.GetAvailableSlotsDto = GetAvailableSlotsDto;
let CreateOnlineBookingDto = (() => {
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _time_decorators;
    let _time_initializers = [];
    let _time_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _clientEmail_decorators;
    let _clientEmail_initializers = [];
    let _clientEmail_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _acceptedTerms_decorators;
    let _acceptedTerms_initializers = [];
    let _acceptedTerms_extraInitializers = [];
    let _otpCode_decorators;
    let _otpCode_initializers = [];
    let _otpCode_extraInitializers = [];
    return class CreateOnlineBookingDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _professionalId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _serviceId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do serviço', example: 123 }), (0, class_validator_1.IsNumber)()];
            _date_decorators = [(0, swagger_1.ApiProperty)({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2024-02-15' }), (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })];
            _time_decorators = [(0, swagger_1.ApiProperty)({ description: 'Horário do agendamento (HH:MM)', example: '14:30' }), (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'time deve estar no formato HH:MM' })];
            _clientPhone_decorators = [(0, swagger_1.ApiProperty)({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })];
            _clientName_decorators = [(0, swagger_1.ApiProperty)({ description: 'Nome do cliente', example: 'Maria Silva', minLength: 2, maxLength: 255 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(255)];
            _clientEmail_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Email do cliente', example: 'maria@email.com', maxLength: 255 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(255), (0, class_validator_1.IsOptional)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Observações do agendamento', example: 'Primeira vez no salão', maxLength: 1000 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000), (0, class_validator_1.IsOptional)()];
            _acceptedTerms_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Cliente aceitou os termos', example: true }), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _otpCode_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Código OTP de verificação', example: '123456' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _time_decorators, { kind: "field", name: "time", static: false, private: false, access: { has: obj => "time" in obj, get: obj => obj.time, set: (obj, value) => { obj.time = value; } }, metadata: _metadata }, _time_initializers, _time_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _clientEmail_decorators, { kind: "field", name: "clientEmail", static: false, private: false, access: { has: obj => "clientEmail" in obj, get: obj => obj.clientEmail, set: (obj, value) => { obj.clientEmail = value; } }, metadata: _metadata }, _clientEmail_initializers, _clientEmail_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _acceptedTerms_decorators, { kind: "field", name: "acceptedTerms", static: false, private: false, access: { has: obj => "acceptedTerms" in obj, get: obj => obj.acceptedTerms, set: (obj, value) => { obj.acceptedTerms = value; } }, metadata: _metadata }, _acceptedTerms_initializers, _acceptedTerms_extraInitializers);
            __esDecorate(null, null, _otpCode_decorators, { kind: "field", name: "otpCode", static: false, private: false, access: { has: obj => "otpCode" in obj, get: obj => obj.otpCode, set: (obj, value) => { obj.otpCode = value; } }, metadata: _metadata }, _otpCode_initializers, _otpCode_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        professionalId = __runInitializers(this, _professionalId_initializers, void 0);
        serviceId = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        date = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        time = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _time_initializers, void 0));
        clientPhone = (__runInitializers(this, _time_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        clientName = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        clientEmail = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _clientEmail_initializers, void 0));
        notes = (__runInitializers(this, _clientEmail_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        acceptedTerms = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _acceptedTerms_initializers, void 0));
        otpCode = (__runInitializers(this, _acceptedTerms_extraInitializers), __runInitializers(this, _otpCode_initializers, void 0));
        constructor() {
            __runInitializers(this, _otpCode_extraInitializers);
        }
    };
})();
exports.CreateOnlineBookingDto = CreateOnlineBookingDto;
let CancelOnlineBookingDto = (() => {
    let _appointmentId_decorators;
    let _appointmentId_initializers = [];
    let _appointmentId_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _otpCode_decorators;
    let _otpCode_initializers = [];
    let _otpCode_extraInitializers = [];
    let _clientAccessToken_decorators;
    let _clientAccessToken_initializers = [];
    let _clientAccessToken_extraInitializers = [];
    return class CancelOnlineBookingDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _appointmentId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do agendamento a cancelar (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _reason_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Motivo do cancelamento', example: 'Imprevisto pessoal', maxLength: 500 }), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(500), (0, class_validator_1.IsOptional)()];
            _otpCode_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Código OTP de verificação', example: '123456' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _clientAccessToken_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Token de acesso do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: obj => "appointmentId" in obj, get: obj => obj.appointmentId, set: (obj, value) => { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _otpCode_decorators, { kind: "field", name: "otpCode", static: false, private: false, access: { has: obj => "otpCode" in obj, get: obj => obj.otpCode, set: (obj, value) => { obj.otpCode = value; } }, metadata: _metadata }, _otpCode_initializers, _otpCode_extraInitializers);
            __esDecorate(null, null, _clientAccessToken_decorators, { kind: "field", name: "clientAccessToken", static: false, private: false, access: { has: obj => "clientAccessToken" in obj, get: obj => obj.clientAccessToken, set: (obj, value) => { obj.clientAccessToken = value; } }, metadata: _metadata }, _clientAccessToken_initializers, _clientAccessToken_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        appointmentId = __runInitializers(this, _appointmentId_initializers, void 0);
        reason = (__runInitializers(this, _appointmentId_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
        otpCode = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _otpCode_initializers, void 0));
        clientAccessToken = (__runInitializers(this, _otpCode_extraInitializers), __runInitializers(this, _clientAccessToken_initializers, void 0));
        constructor() {
            __runInitializers(this, _clientAccessToken_extraInitializers);
        }
    };
})();
exports.CancelOnlineBookingDto = CancelOnlineBookingDto;
let RescheduleOnlineBookingDto = (() => {
    let _appointmentId_decorators;
    let _appointmentId_initializers = [];
    let _appointmentId_extraInitializers = [];
    let _newDate_decorators;
    let _newDate_initializers = [];
    let _newDate_extraInitializers = [];
    let _newTime_decorators;
    let _newTime_initializers = [];
    let _newTime_extraInitializers = [];
    let _newProfessionalId_decorators;
    let _newProfessionalId_initializers = [];
    let _newProfessionalId_extraInitializers = [];
    let _otpCode_decorators;
    let _otpCode_initializers = [];
    let _otpCode_extraInitializers = [];
    let _clientAccessToken_decorators;
    let _clientAccessToken_initializers = [];
    let _clientAccessToken_extraInitializers = [];
    return class RescheduleOnlineBookingDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _appointmentId_decorators = [(0, class_validator_1.IsUUID)()];
            _newDate_decorators = [(0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'newDate deve estar no formato YYYY-MM-DD' })];
            _newTime_decorators = [(0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'newTime deve estar no formato HH:MM' })];
            _newProfessionalId_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _otpCode_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _clientAccessToken_decorators = [(0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _appointmentId_decorators, { kind: "field", name: "appointmentId", static: false, private: false, access: { has: obj => "appointmentId" in obj, get: obj => obj.appointmentId, set: (obj, value) => { obj.appointmentId = value; } }, metadata: _metadata }, _appointmentId_initializers, _appointmentId_extraInitializers);
            __esDecorate(null, null, _newDate_decorators, { kind: "field", name: "newDate", static: false, private: false, access: { has: obj => "newDate" in obj, get: obj => obj.newDate, set: (obj, value) => { obj.newDate = value; } }, metadata: _metadata }, _newDate_initializers, _newDate_extraInitializers);
            __esDecorate(null, null, _newTime_decorators, { kind: "field", name: "newTime", static: false, private: false, access: { has: obj => "newTime" in obj, get: obj => obj.newTime, set: (obj, value) => { obj.newTime = value; } }, metadata: _metadata }, _newTime_initializers, _newTime_extraInitializers);
            __esDecorate(null, null, _newProfessionalId_decorators, { kind: "field", name: "newProfessionalId", static: false, private: false, access: { has: obj => "newProfessionalId" in obj, get: obj => obj.newProfessionalId, set: (obj, value) => { obj.newProfessionalId = value; } }, metadata: _metadata }, _newProfessionalId_initializers, _newProfessionalId_extraInitializers);
            __esDecorate(null, null, _otpCode_decorators, { kind: "field", name: "otpCode", static: false, private: false, access: { has: obj => "otpCode" in obj, get: obj => obj.otpCode, set: (obj, value) => { obj.otpCode = value; } }, metadata: _metadata }, _otpCode_initializers, _otpCode_extraInitializers);
            __esDecorate(null, null, _clientAccessToken_decorators, { kind: "field", name: "clientAccessToken", static: false, private: false, access: { has: obj => "clientAccessToken" in obj, get: obj => obj.clientAccessToken, set: (obj, value) => { obj.clientAccessToken = value; } }, metadata: _metadata }, _clientAccessToken_initializers, _clientAccessToken_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        appointmentId = __runInitializers(this, _appointmentId_initializers, void 0);
        newDate = (__runInitializers(this, _appointmentId_extraInitializers), __runInitializers(this, _newDate_initializers, void 0));
        newTime = (__runInitializers(this, _newDate_extraInitializers), __runInitializers(this, _newTime_initializers, void 0));
        newProfessionalId = (__runInitializers(this, _newTime_extraInitializers), __runInitializers(this, _newProfessionalId_initializers, void 0));
        otpCode = (__runInitializers(this, _newProfessionalId_extraInitializers), __runInitializers(this, _otpCode_initializers, void 0));
        clientAccessToken = (__runInitializers(this, _otpCode_extraInitializers), __runInitializers(this, _clientAccessToken_initializers, void 0));
        constructor() {
            __runInitializers(this, _clientAccessToken_extraInitializers);
        }
    };
})();
exports.RescheduleOnlineBookingDto = RescheduleOnlineBookingDto;
// ==================== ASSISTED LINK DTOs ====================
let GenerateAssistedLinkDto = (() => {
    let _salonId_decorators;
    let _salonId_initializers = [];
    let _salonId_extraInitializers = [];
    let _serviceId_decorators;
    let _serviceId_initializers = [];
    let _serviceId_extraInitializers = [];
    let _professionalId_decorators;
    let _professionalId_initializers = [];
    let _professionalId_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    return class GenerateAssistedLinkDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _salonId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do salão (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsUUID)()];
            _serviceId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do serviço', example: 123 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _professionalId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsUUID)(), (0, class_validator_1.IsOptional)()];
            _clientPhone_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' }), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _salonId_decorators, { kind: "field", name: "salonId", static: false, private: false, access: { has: obj => "salonId" in obj, get: obj => obj.salonId, set: (obj, value) => { obj.salonId = value; } }, metadata: _metadata }, _salonId_initializers, _salonId_extraInitializers);
            __esDecorate(null, null, _serviceId_decorators, { kind: "field", name: "serviceId", static: false, private: false, access: { has: obj => "serviceId" in obj, get: obj => obj.serviceId, set: (obj, value) => { obj.serviceId = value; } }, metadata: _metadata }, _serviceId_initializers, _serviceId_extraInitializers);
            __esDecorate(null, null, _professionalId_decorators, { kind: "field", name: "professionalId", static: false, private: false, access: { has: obj => "professionalId" in obj, get: obj => obj.professionalId, set: (obj, value) => { obj.professionalId = value; } }, metadata: _metadata }, _professionalId_initializers, _professionalId_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        salonId = __runInitializers(this, _salonId_initializers, void 0);
        serviceId = (__runInitializers(this, _salonId_extraInitializers), __runInitializers(this, _serviceId_initializers, void 0));
        professionalId = (__runInitializers(this, _serviceId_extraInitializers), __runInitializers(this, _professionalId_initializers, void 0));
        clientPhone = (__runInitializers(this, _professionalId_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        constructor() {
            __runInitializers(this, _clientPhone_extraInitializers);
        }
    };
})();
exports.GenerateAssistedLinkDto = GenerateAssistedLinkDto;
//# sourceMappingURL=dto.js.map
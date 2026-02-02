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
exports.AlexisController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
/**
 * =====================================================
 * ALEXIS CONTROLLER
 * API para IA WhatsApp & Dashboard
 * =====================================================
 */
// DTOs
let ProcessMessageDto = (() => {
    let _salonId_decorators;
    let _salonId_initializers = [];
    let _salonId_extraInitializers = [];
    let _clientPhone_decorators;
    let _clientPhone_initializers = [];
    let _clientPhone_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _clientName_decorators;
    let _clientName_initializers = [];
    let _clientName_extraInitializers = [];
    let _senderId_decorators;
    let _senderId_initializers = [];
    let _senderId_extraInitializers = [];
    let _senderType_decorators;
    let _senderType_initializers = [];
    let _senderType_extraInitializers = [];
    return class ProcessMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _salonId_decorators = [(0, swagger_1.ApiProperty)({ description: 'ID do salão (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' }), (0, class_validator_1.IsString)()];
            _clientPhone_decorators = [(0, swagger_1.ApiProperty)({ description: 'Telefone do cliente', example: '11999998888' }), (0, class_validator_1.IsString)()];
            _message_decorators = [(0, swagger_1.ApiProperty)({ description: 'Mensagem recebida', example: 'Olá, gostaria de agendar um corte' }), (0, class_validator_1.IsString)()];
            _clientName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome do cliente', example: 'Maria Silva' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _senderId_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'ID do remetente', example: '550e8400-e29b-41d4-a716-446655440001' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _senderType_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Tipo do remetente', enum: ['client', 'agent'], example: 'client' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsIn)(['client', 'agent'])];
            __esDecorate(null, null, _salonId_decorators, { kind: "field", name: "salonId", static: false, private: false, access: { has: obj => "salonId" in obj, get: obj => obj.salonId, set: (obj, value) => { obj.salonId = value; } }, metadata: _metadata }, _salonId_initializers, _salonId_extraInitializers);
            __esDecorate(null, null, _clientPhone_decorators, { kind: "field", name: "clientPhone", static: false, private: false, access: { has: obj => "clientPhone" in obj, get: obj => obj.clientPhone, set: (obj, value) => { obj.clientPhone = value; } }, metadata: _metadata }, _clientPhone_initializers, _clientPhone_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _clientName_decorators, { kind: "field", name: "clientName", static: false, private: false, access: { has: obj => "clientName" in obj, get: obj => obj.clientName, set: (obj, value) => { obj.clientName = value; } }, metadata: _metadata }, _clientName_initializers, _clientName_extraInitializers);
            __esDecorate(null, null, _senderId_decorators, { kind: "field", name: "senderId", static: false, private: false, access: { has: obj => "senderId" in obj, get: obj => obj.senderId, set: (obj, value) => { obj.senderId = value; } }, metadata: _metadata }, _senderId_initializers, _senderId_extraInitializers);
            __esDecorate(null, null, _senderType_decorators, { kind: "field", name: "senderType", static: false, private: false, access: { has: obj => "senderType" in obj, get: obj => obj.senderType, set: (obj, value) => { obj.senderType = value; } }, metadata: _metadata }, _senderType_initializers, _senderType_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        salonId = __runInitializers(this, _salonId_initializers, void 0);
        clientPhone = (__runInitializers(this, _salonId_extraInitializers), __runInitializers(this, _clientPhone_initializers, void 0));
        message = (__runInitializers(this, _clientPhone_extraInitializers), __runInitializers(this, _message_initializers, void 0));
        clientName = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _clientName_initializers, void 0));
        senderId = (__runInitializers(this, _clientName_extraInitializers), __runInitializers(this, _senderId_initializers, void 0));
        senderType = (__runInitializers(this, _senderId_extraInitializers), __runInitializers(this, _senderType_initializers, void 0));
        constructor() {
            __runInitializers(this, _senderType_extraInitializers);
        }
    };
})();
let UpdateSettingsDto = (() => {
    let _isEnabled_decorators;
    let _isEnabled_initializers = [];
    let _isEnabled_extraInitializers = [];
    let _assistantName_decorators;
    let _assistantName_initializers = [];
    let _assistantName_extraInitializers = [];
    let _greetingMessage_decorators;
    let _greetingMessage_initializers = [];
    let _greetingMessage_extraInitializers = [];
    let _humanTakeoverMessage_decorators;
    let _humanTakeoverMessage_initializers = [];
    let _humanTakeoverMessage_extraInitializers = [];
    let _aiResumeMessage_decorators;
    let _aiResumeMessage_initializers = [];
    let _aiResumeMessage_extraInitializers = [];
    let _humanTakeoverCommand_decorators;
    let _humanTakeoverCommand_initializers = [];
    let _humanTakeoverCommand_extraInitializers = [];
    let _aiResumeCommand_decorators;
    let _aiResumeCommand_initializers = [];
    let _aiResumeCommand_extraInitializers = [];
    let _autoSchedulingEnabled_decorators;
    let _autoSchedulingEnabled_initializers = [];
    let _autoSchedulingEnabled_extraInitializers = [];
    let _workingHoursStart_decorators;
    let _workingHoursStart_initializers = [];
    let _workingHoursStart_extraInitializers = [];
    let _workingHoursEnd_decorators;
    let _workingHoursEnd_initializers = [];
    let _workingHoursEnd_extraInitializers = [];
    return class UpdateSettingsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _isEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Alexis está habilitada', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _assistantName_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Nome da assistente', example: 'Alexis' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _greetingMessage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem de boas-vindas', example: 'Olá! Sou a Alexis, assistente virtual do salão.' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _humanTakeoverMessage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem quando humano assume', example: 'Um atendente humano irá te atender agora.' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _aiResumeMessage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Mensagem quando IA retoma', example: 'A Alexis voltou a te atender!' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _humanTakeoverCommand_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Comando para humano assumir', example: '#eu' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _aiResumeCommand_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Comando para IA retomar', example: '#ia' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _autoSchedulingEnabled_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Agendamento automático habilitado', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _workingHoursStart_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de início do expediente', example: '08:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _workingHoursEnd_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'Horário de fim do expediente', example: '18:00' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _isEnabled_decorators, { kind: "field", name: "isEnabled", static: false, private: false, access: { has: obj => "isEnabled" in obj, get: obj => obj.isEnabled, set: (obj, value) => { obj.isEnabled = value; } }, metadata: _metadata }, _isEnabled_initializers, _isEnabled_extraInitializers);
            __esDecorate(null, null, _assistantName_decorators, { kind: "field", name: "assistantName", static: false, private: false, access: { has: obj => "assistantName" in obj, get: obj => obj.assistantName, set: (obj, value) => { obj.assistantName = value; } }, metadata: _metadata }, _assistantName_initializers, _assistantName_extraInitializers);
            __esDecorate(null, null, _greetingMessage_decorators, { kind: "field", name: "greetingMessage", static: false, private: false, access: { has: obj => "greetingMessage" in obj, get: obj => obj.greetingMessage, set: (obj, value) => { obj.greetingMessage = value; } }, metadata: _metadata }, _greetingMessage_initializers, _greetingMessage_extraInitializers);
            __esDecorate(null, null, _humanTakeoverMessage_decorators, { kind: "field", name: "humanTakeoverMessage", static: false, private: false, access: { has: obj => "humanTakeoverMessage" in obj, get: obj => obj.humanTakeoverMessage, set: (obj, value) => { obj.humanTakeoverMessage = value; } }, metadata: _metadata }, _humanTakeoverMessage_initializers, _humanTakeoverMessage_extraInitializers);
            __esDecorate(null, null, _aiResumeMessage_decorators, { kind: "field", name: "aiResumeMessage", static: false, private: false, access: { has: obj => "aiResumeMessage" in obj, get: obj => obj.aiResumeMessage, set: (obj, value) => { obj.aiResumeMessage = value; } }, metadata: _metadata }, _aiResumeMessage_initializers, _aiResumeMessage_extraInitializers);
            __esDecorate(null, null, _humanTakeoverCommand_decorators, { kind: "field", name: "humanTakeoverCommand", static: false, private: false, access: { has: obj => "humanTakeoverCommand" in obj, get: obj => obj.humanTakeoverCommand, set: (obj, value) => { obj.humanTakeoverCommand = value; } }, metadata: _metadata }, _humanTakeoverCommand_initializers, _humanTakeoverCommand_extraInitializers);
            __esDecorate(null, null, _aiResumeCommand_decorators, { kind: "field", name: "aiResumeCommand", static: false, private: false, access: { has: obj => "aiResumeCommand" in obj, get: obj => obj.aiResumeCommand, set: (obj, value) => { obj.aiResumeCommand = value; } }, metadata: _metadata }, _aiResumeCommand_initializers, _aiResumeCommand_extraInitializers);
            __esDecorate(null, null, _autoSchedulingEnabled_decorators, { kind: "field", name: "autoSchedulingEnabled", static: false, private: false, access: { has: obj => "autoSchedulingEnabled" in obj, get: obj => obj.autoSchedulingEnabled, set: (obj, value) => { obj.autoSchedulingEnabled = value; } }, metadata: _metadata }, _autoSchedulingEnabled_initializers, _autoSchedulingEnabled_extraInitializers);
            __esDecorate(null, null, _workingHoursStart_decorators, { kind: "field", name: "workingHoursStart", static: false, private: false, access: { has: obj => "workingHoursStart" in obj, get: obj => obj.workingHoursStart, set: (obj, value) => { obj.workingHoursStart = value; } }, metadata: _metadata }, _workingHoursStart_initializers, _workingHoursStart_extraInitializers);
            __esDecorate(null, null, _workingHoursEnd_decorators, { kind: "field", name: "workingHoursEnd", static: false, private: false, access: { has: obj => "workingHoursEnd" in obj, get: obj => obj.workingHoursEnd, set: (obj, value) => { obj.workingHoursEnd = value; } }, metadata: _metadata }, _workingHoursEnd_initializers, _workingHoursEnd_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        isEnabled = __runInitializers(this, _isEnabled_initializers, void 0);
        assistantName = (__runInitializers(this, _isEnabled_extraInitializers), __runInitializers(this, _assistantName_initializers, void 0));
        greetingMessage = (__runInitializers(this, _assistantName_extraInitializers), __runInitializers(this, _greetingMessage_initializers, void 0));
        humanTakeoverMessage = (__runInitializers(this, _greetingMessage_extraInitializers), __runInitializers(this, _humanTakeoverMessage_initializers, void 0));
        aiResumeMessage = (__runInitializers(this, _humanTakeoverMessage_extraInitializers), __runInitializers(this, _aiResumeMessage_initializers, void 0));
        humanTakeoverCommand = (__runInitializers(this, _aiResumeMessage_extraInitializers), __runInitializers(this, _humanTakeoverCommand_initializers, void 0));
        aiResumeCommand = (__runInitializers(this, _humanTakeoverCommand_extraInitializers), __runInitializers(this, _aiResumeCommand_initializers, void 0));
        autoSchedulingEnabled = (__runInitializers(this, _aiResumeCommand_extraInitializers), __runInitializers(this, _autoSchedulingEnabled_initializers, void 0));
        workingHoursStart = (__runInitializers(this, _autoSchedulingEnabled_extraInitializers), __runInitializers(this, _workingHoursStart_initializers, void 0));
        workingHoursEnd = (__runInitializers(this, _workingHoursStart_extraInitializers), __runInitializers(this, _workingHoursEnd_initializers, void 0));
        constructor() {
            __runInitializers(this, _workingHoursEnd_extraInitializers);
        }
    };
})();
let DashboardChatDto = (() => {
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    return class DashboardChatDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _message_decorators = [(0, swagger_1.ApiProperty)({ description: 'Mensagem para a Alexis', example: 'Quantos agendamentos tenho hoje?' }), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        message = __runInitializers(this, _message_initializers, void 0);
        constructor() {
            __runInitializers(this, _message_extraInitializers);
        }
    };
})();
let AlexisController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Alexis'), (0, common_1.Controller)('alexis')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processMessage_decorators;
    let _getConversations_decorators;
    let _getMessages_decorators;
    let _getBriefing_decorators;
    let _dashboardChat_decorators;
    let _getSettings_decorators;
    let _updateSettings_decorators;
    let _getLogs_decorators;
    let _getBlockedLogs_decorators;
    let _getStatus_decorators;
    let _getSessions_decorators;
    let _getSessionMessages_decorators;
    let _endSession_decorators;
    let _getComplianceStats_decorators;
    let _getMetrics_decorators;
    let _takeover_decorators;
    let _resume_decorators;
    let _sendHumanMessage_decorators;
    let _deleteChatHistory_decorators;
    var AlexisController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _processMessage_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('whatsapp/message')];
            _getConversations_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Get)('whatsapp/conversations')];
            _getMessages_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Get)('whatsapp/conversations/:id/messages')];
            _getBriefing_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Get)('dashboard/briefing')];
            _dashboardChat_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Post)('dashboard/chat')];
            _getSettings_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.Get)('settings')];
            _updateSettings_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.Patch)('settings')];
            _getLogs_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.Get)('logs')];
            _getBlockedLogs_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.Get)('logs/blocked')];
            _getStatus_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Get)('status')];
            _getSessions_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Get)('sessions')];
            _getSessionMessages_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Get)('sessions/:sessionId/messages')];
            _endSession_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Post)('sessions/:sessionId/end')];
            _getComplianceStats_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.Get)('compliance/stats')];
            _getMetrics_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'), (0, common_1.Get)('metrics')];
            _takeover_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Post)('takeover')];
            _resume_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Post)('resume/:sessionId')];
            _sendHumanMessage_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.Post)('message/human')];
            _deleteChatHistory_decorators = [(0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Delete)('chat/history')];
            __esDecorate(this, null, _processMessage_decorators, { kind: "method", name: "processMessage", static: false, private: false, access: { has: obj => "processMessage" in obj, get: obj => obj.processMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getConversations_decorators, { kind: "method", name: "getConversations", static: false, private: false, access: { has: obj => "getConversations" in obj, get: obj => obj.getConversations }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMessages_decorators, { kind: "method", name: "getMessages", static: false, private: false, access: { has: obj => "getMessages" in obj, get: obj => obj.getMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBriefing_decorators, { kind: "method", name: "getBriefing", static: false, private: false, access: { has: obj => "getBriefing" in obj, get: obj => obj.getBriefing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _dashboardChat_decorators, { kind: "method", name: "dashboardChat", static: false, private: false, access: { has: obj => "dashboardChat" in obj, get: obj => obj.dashboardChat }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSettings_decorators, { kind: "method", name: "getSettings", static: false, private: false, access: { has: obj => "getSettings" in obj, get: obj => obj.getSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSettings_decorators, { kind: "method", name: "updateSettings", static: false, private: false, access: { has: obj => "updateSettings" in obj, get: obj => obj.updateSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getLogs_decorators, { kind: "method", name: "getLogs", static: false, private: false, access: { has: obj => "getLogs" in obj, get: obj => obj.getLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBlockedLogs_decorators, { kind: "method", name: "getBlockedLogs", static: false, private: false, access: { has: obj => "getBlockedLogs" in obj, get: obj => obj.getBlockedLogs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSessions_decorators, { kind: "method", name: "getSessions", static: false, private: false, access: { has: obj => "getSessions" in obj, get: obj => obj.getSessions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSessionMessages_decorators, { kind: "method", name: "getSessionMessages", static: false, private: false, access: { has: obj => "getSessionMessages" in obj, get: obj => obj.getSessionMessages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _endSession_decorators, { kind: "method", name: "endSession", static: false, private: false, access: { has: obj => "endSession" in obj, get: obj => obj.endSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getComplianceStats_decorators, { kind: "method", name: "getComplianceStats", static: false, private: false, access: { has: obj => "getComplianceStats" in obj, get: obj => obj.getComplianceStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMetrics_decorators, { kind: "method", name: "getMetrics", static: false, private: false, access: { has: obj => "getMetrics" in obj, get: obj => obj.getMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _takeover_decorators, { kind: "method", name: "takeover", static: false, private: false, access: { has: obj => "takeover" in obj, get: obj => obj.takeover }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resume_decorators, { kind: "method", name: "resume", static: false, private: false, access: { has: obj => "resume" in obj, get: obj => obj.resume }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendHumanMessage_decorators, { kind: "method", name: "sendHumanMessage", static: false, private: false, access: { has: obj => "sendHumanMessage" in obj, get: obj => obj.sendHumanMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteChatHistory_decorators, { kind: "method", name: "deleteChatHistory", static: false, private: false, access: { has: obj => "deleteChatHistory" in obj, get: obj => obj.deleteChatHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AlexisController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        alexisService = __runInitializers(this, _instanceExtraInitializers);
        constructor(alexisService) {
            this.alexisService = alexisService;
        }
        // ==================== WHATSAPP ====================
        /**
         * Processa mensagem do WhatsApp (webhook ou chamada direta)
         * Pode ser do cliente ou do atendente
         */
        async processMessage(dto) {
            return this.alexisService.processWhatsAppMessage(dto.salonId, dto.clientPhone, dto.message, dto.clientName, dto.senderId, dto.senderType || 'client');
        }
        /**
         * Lista conversas do WhatsApp
         */
        async getConversations(req, status) {
            return this.alexisService.getConversations(req.user.salonId, status);
        }
        /**
         * Busca mensagens de uma conversa
         */
        async getMessages(id) {
            return this.alexisService.getMessages(id);
        }
        // ==================== DASHBOARD ====================
        /**
         * Gera briefing para o usuário logado
         */
        async getBriefing(req) {
            return this.alexisService.generateBriefing(req.user.salonId, req.user.id, req.user.role, req.user.name);
        }
        /**
         * Chat do dashboard com a Alexis
         */
        async dashboardChat(req, dto) {
            return this.alexisService.processWhatsAppMessage(req.user.salonId, `dashboard-${req.user.id}`, dto.message, req.user.name, req.user.id, 'client');
        }
        // ==================== CONFIGURAÇÕES ====================
        /**
         * Obtém configurações da Alexis
         */
        async getSettings(req) {
            return this.alexisService.getSettings(req.user.salonId);
        }
        /**
         * Atualiza configurações da Alexis
         */
        async updateSettings(req, dto) {
            return this.alexisService.updateSettings(req.user.salonId, dto);
        }
        // ==================== LOGS ====================
        /**
         * Obtém logs de interação
         */
        async getLogs(req, limit) {
            return this.alexisService.getInteractionLogs(req.user.salonId, limit ? parseInt(limit) : 100);
        }
        /**
         * Obtém logs de termos bloqueados
         */
        async getBlockedLogs(req, limit) {
            return this.alexisService.getBlockedTermsLogs(req.user.salonId, limit ? parseInt(limit) : 100);
        }
        // ==================== STATUS ====================
        /**
         * Verifica status da Alexis
         */
        async getStatus(req) {
            const settings = await this.alexisService.getSettings(req.user.salonId);
            const isGeminiAvailable = this.alexisService.isEnabled();
            return {
                isEnabled: settings?.isEnabled ?? true,
                isGeminiAvailable,
                assistantName: settings?.assistantName || 'Alexis',
                commands: {
                    humanTakeover: settings?.humanTakeoverCommand || '#eu',
                    aiResume: settings?.aiResumeCommand || '#ia',
                },
            };
        }
        // ==================== SESSIONS (Dashboard) ====================
        /**
         * Lista sessões de conversa
         */
        async getSessions(req) {
            return this.alexisService.getSessions(req.user.salonId);
        }
        /**
         * Obtém mensagens de uma sessão
         */
        async getSessionMessages(req, sessionId) {
            return this.alexisService.getSessionMessages(req.user.salonId, sessionId);
        }
        /**
         * Encerra uma sessão
         */
        async endSession(req, sessionId) {
            return this.alexisService.endSession(req.user.salonId, sessionId);
        }
        // ==================== COMPLIANCE ====================
        /**
         * Estatísticas de compliance ANVISA
         */
        async getComplianceStats(req) {
            return this.alexisService.getComplianceStats(req.user.salonId);
        }
        // ==================== METRICS ====================
        /**
         * Métricas de uso da Alexis
         */
        async getMetrics(req) {
            return this.alexisService.getMetrics(req.user.salonId);
        }
        // ==================== TAKEOVER ====================
        /**
         * Atendente assume controle da conversa
         */
        async takeover(req, dto) {
            return this.alexisService.humanTakeover(req.user.salonId, dto.sessionId, req.user.id);
        }
        /**
         * Alexis retoma controle da conversa
         */
        async resume(req, sessionId) {
            return this.alexisService.aiResume(req.user.salonId, sessionId);
        }
        /**
         * Envia mensagem como humano
         */
        async sendHumanMessage(req, dto) {
            return this.alexisService.sendHumanMessage(req.user.salonId, dto.sessionId, dto.message, req.user.id);
        }
        /**
         * Deleta histórico do chat do dashboard
         */
        async deleteChatHistory(req) {
            return this.alexisService.deleteDashboardChatHistory(req.user.id);
        }
    };
    return AlexisController = _classThis;
})();
exports.AlexisController = AlexisController;
//# sourceMappingURL=alexis.controller.js.map
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
exports.CreateClientNoteDto = exports.UpdateAISettingsDto = exports.ChatMessageDto = void 0;
const class_validator_1 = require("class-validator");
let ChatMessageDto = (() => {
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    return class ChatMessageDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _message_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        message = __runInitializers(this, _message_initializers, void 0);
        constructor() {
            __runInitializers(this, _message_extraInitializers);
        }
    };
})();
exports.ChatMessageDto = ChatMessageDto;
let UpdateAISettingsDto = (() => {
    let _isEnabled_decorators;
    let _isEnabled_initializers = [];
    let _isEnabled_extraInitializers = [];
    let _assistantName_decorators;
    let _assistantName_initializers = [];
    let _assistantName_extraInitializers = [];
    let _personality_decorators;
    let _personality_initializers = [];
    let _personality_extraInitializers = [];
    let _dailyBriefingEnabled_decorators;
    let _dailyBriefingEnabled_initializers = [];
    let _dailyBriefingEnabled_extraInitializers = [];
    let _dailyBriefingTime_decorators;
    let _dailyBriefingTime_initializers = [];
    let _dailyBriefingTime_extraInitializers = [];
    let _alertsEnabled_decorators;
    let _alertsEnabled_initializers = [];
    let _alertsEnabled_extraInitializers = [];
    let _tipsEnabled_decorators;
    let _tipsEnabled_initializers = [];
    let _tipsEnabled_extraInitializers = [];
    return class UpdateAISettingsDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _isEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _assistantName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _personality_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _dailyBriefingEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _dailyBriefingTime_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _alertsEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _tipsEnabled_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _isEnabled_decorators, { kind: "field", name: "isEnabled", static: false, private: false, access: { has: obj => "isEnabled" in obj, get: obj => obj.isEnabled, set: (obj, value) => { obj.isEnabled = value; } }, metadata: _metadata }, _isEnabled_initializers, _isEnabled_extraInitializers);
            __esDecorate(null, null, _assistantName_decorators, { kind: "field", name: "assistantName", static: false, private: false, access: { has: obj => "assistantName" in obj, get: obj => obj.assistantName, set: (obj, value) => { obj.assistantName = value; } }, metadata: _metadata }, _assistantName_initializers, _assistantName_extraInitializers);
            __esDecorate(null, null, _personality_decorators, { kind: "field", name: "personality", static: false, private: false, access: { has: obj => "personality" in obj, get: obj => obj.personality, set: (obj, value) => { obj.personality = value; } }, metadata: _metadata }, _personality_initializers, _personality_extraInitializers);
            __esDecorate(null, null, _dailyBriefingEnabled_decorators, { kind: "field", name: "dailyBriefingEnabled", static: false, private: false, access: { has: obj => "dailyBriefingEnabled" in obj, get: obj => obj.dailyBriefingEnabled, set: (obj, value) => { obj.dailyBriefingEnabled = value; } }, metadata: _metadata }, _dailyBriefingEnabled_initializers, _dailyBriefingEnabled_extraInitializers);
            __esDecorate(null, null, _dailyBriefingTime_decorators, { kind: "field", name: "dailyBriefingTime", static: false, private: false, access: { has: obj => "dailyBriefingTime" in obj, get: obj => obj.dailyBriefingTime, set: (obj, value) => { obj.dailyBriefingTime = value; } }, metadata: _metadata }, _dailyBriefingTime_initializers, _dailyBriefingTime_extraInitializers);
            __esDecorate(null, null, _alertsEnabled_decorators, { kind: "field", name: "alertsEnabled", static: false, private: false, access: { has: obj => "alertsEnabled" in obj, get: obj => obj.alertsEnabled, set: (obj, value) => { obj.alertsEnabled = value; } }, metadata: _metadata }, _alertsEnabled_initializers, _alertsEnabled_extraInitializers);
            __esDecorate(null, null, _tipsEnabled_decorators, { kind: "field", name: "tipsEnabled", static: false, private: false, access: { has: obj => "tipsEnabled" in obj, get: obj => obj.tipsEnabled, set: (obj, value) => { obj.tipsEnabled = value; } }, metadata: _metadata }, _tipsEnabled_initializers, _tipsEnabled_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        isEnabled = __runInitializers(this, _isEnabled_initializers, void 0);
        assistantName = (__runInitializers(this, _isEnabled_extraInitializers), __runInitializers(this, _assistantName_initializers, void 0));
        personality = (__runInitializers(this, _assistantName_extraInitializers), __runInitializers(this, _personality_initializers, void 0));
        dailyBriefingEnabled = (__runInitializers(this, _personality_extraInitializers), __runInitializers(this, _dailyBriefingEnabled_initializers, void 0));
        dailyBriefingTime = (__runInitializers(this, _dailyBriefingEnabled_extraInitializers), __runInitializers(this, _dailyBriefingTime_initializers, void 0));
        alertsEnabled = (__runInitializers(this, _dailyBriefingTime_extraInitializers), __runInitializers(this, _alertsEnabled_initializers, void 0));
        tipsEnabled = (__runInitializers(this, _alertsEnabled_extraInitializers), __runInitializers(this, _tipsEnabled_initializers, void 0));
        constructor() {
            __runInitializers(this, _tipsEnabled_extraInitializers);
        }
    };
})();
exports.UpdateAISettingsDto = UpdateAISettingsDto;
let CreateClientNoteDto = (() => {
    let _clientId_decorators;
    let _clientId_initializers = [];
    let _clientId_extraInitializers = [];
    let _noteType_decorators;
    let _noteType_initializers = [];
    let _noteType_extraInitializers = [];
    let _content_decorators;
    let _content_initializers = [];
    let _content_extraInitializers = [];
    return class CreateClientNoteDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _clientId_decorators = [(0, class_validator_1.IsString)()];
            _noteType_decorators = [(0, class_validator_1.IsString)()];
            _content_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: obj => "clientId" in obj, get: obj => obj.clientId, set: (obj, value) => { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _noteType_decorators, { kind: "field", name: "noteType", static: false, private: false, access: { has: obj => "noteType" in obj, get: obj => obj.noteType, set: (obj, value) => { obj.noteType = value; } }, metadata: _metadata }, _noteType_initializers, _noteType_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: obj => "content" in obj, get: obj => obj.content, set: (obj, value) => { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        clientId = __runInitializers(this, _clientId_initializers, void 0);
        noteType = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _noteType_initializers, void 0)); // PREFERENCE, ALLERGY, PERSONALITY, IMPORTANT
        content = (__runInitializers(this, _noteType_extraInitializers), __runInitializers(this, _content_initializers, void 0));
        constructor() {
            __runInitializers(this, _content_extraInitializers);
        }
    };
})();
exports.CreateClientNoteDto = CreateClientNoteDto;
//# sourceMappingURL=dto.js.map
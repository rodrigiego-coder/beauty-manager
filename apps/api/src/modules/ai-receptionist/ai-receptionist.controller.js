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
exports.AiReceptionistController = void 0;
const common_1 = require("@nestjs/common");
let AiReceptionistController = (() => {
    let _classDecorators = [(0, common_1.Controller)('ai')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processMessage_decorators;
    let _chat_decorators;
    let _clearSession_decorators;
    var AiReceptionistController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _processMessage_decorators = [(0, common_1.Post)('message')];
            _chat_decorators = [(0, common_1.Post)('chat')];
            _clearSession_decorators = [(0, common_1.Delete)('session/:sessionId')];
            __esDecorate(this, null, _processMessage_decorators, { kind: "method", name: "processMessage", static: false, private: false, access: { has: obj => "processMessage" in obj, get: obj => obj.processMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _chat_decorators, { kind: "method", name: "chat", static: false, private: false, access: { has: obj => "chat" in obj, get: obj => obj.chat }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearSession_decorators, { kind: "method", name: "clearSession", static: false, private: false, access: { has: obj => "clearSession" in obj, get: obj => obj.clearSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiReceptionistController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        aiService = __runInitializers(this, _instanceExtraInitializers);
        constructor(aiService) {
            this.aiService = aiService;
        }
        /**
         * POST /ai/message
         * Processa mensagem com Human Handoff
         * Use este endpoint para integracao com WhatsApp
         */
        async processMessage(body) {
            const result = await this.aiService.processMessage(body.phone, body.message);
            return {
                response: result.response,
                aiActive: result.aiActive,
                toolCalls: result.toolCalls,
            };
        }
        /**
         * POST /ai/chat
         * Envia uma mensagem para a recepcionista virtual (sem Human Handoff)
         */
        async chat(body) {
            const sessionId = body.sessionId || `session_${Date.now()}`;
            const result = await this.aiService.chat(body.message, sessionId);
            return {
                response: result.response,
                sessionId,
                toolCalls: result.toolCalls,
            };
        }
        /**
         * DELETE /ai/session/:sessionId
         * Limpa o historico de uma conversa
         */
        clearSession(sessionId) {
            this.aiService.clearHistory(sessionId);
            return { message: 'Sessao encerrada com sucesso' };
        }
    };
    return AiReceptionistController = _classThis;
})();
exports.AiReceptionistController = AiReceptionistController;
//# sourceMappingURL=ai-receptionist.controller.js.map
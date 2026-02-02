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
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GeminiService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GeminiService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        genAI = null;
        model = null;
        onModuleInit() {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.warn('⚠️ GEMINI_API_KEY não configurada - IA desabilitada');
                return;
            }
            try {
                this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({
                    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
                });
                console.log('✅ Gemini AI inicializado com sucesso');
            }
            catch (error) {
                console.error('❌ Erro ao inicializar Gemini:', error);
            }
        }
        isEnabled() {
            return this.model !== null;
        }
        async generateContent(prompt) {
            if (!this.model) {
                throw new Error('IA não configurada. Verifique GEMINI_API_KEY no .env');
            }
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response;
                return response.text();
            }
            catch (error) {
                console.error('Erro Gemini generateContent:', error);
                throw new Error(`Falha ao gerar conteúdo: ${error.message || 'Erro desconhecido'}`);
            }
        }
        async chat(history, message) {
            if (!this.model) {
                throw new Error('IA não configurada. Verifique GEMINI_API_KEY no .env');
            }
            try {
                const chat = this.model.startChat({
                    history: history.map((h) => ({
                        role: h.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: h.content }],
                    })),
                });
                const result = await chat.sendMessage(message);
                return result.response.text();
            }
            catch (error) {
                console.error('Erro Gemini chat:', error);
                throw new Error(`Falha no chat: ${error.message || 'Erro desconhecido'}`);
            }
        }
    };
    return GeminiService = _classThis;
})();
exports.GeminiService = GeminiService;
//# sourceMappingURL=gemini.service.js.map
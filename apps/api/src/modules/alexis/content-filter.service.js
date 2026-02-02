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
exports.ContentFilterService = void 0;
const common_1 = require("@nestjs/common");
const forbidden_terms_1 = require("./constants/forbidden-terms");
let ContentFilterService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ContentFilterService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ContentFilterService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(ContentFilterService.name);
        /**
         * Verifica se a mensagem é um comando de controle (#eu ou #ia)
         * IMPORTANTE: Comandos NÃO são enviados ao cliente
         */
        isCommand(message) {
            const trimmed = message.trim().toLowerCase();
            if (trimmed === forbidden_terms_1.COMMANDS.HUMAN_TAKEOVER.toLowerCase()) {
                return { isCommand: true, command: 'HUMAN_TAKEOVER' };
            }
            if (trimmed === forbidden_terms_1.COMMANDS.AI_RESUME.toLowerCase()) {
                return { isCommand: true, command: 'AI_RESUME' };
            }
            return { isCommand: false, command: null };
        }
        /**
         * CAMADA 1: Filtro de ENTRADA
         * Executado ANTES de enviar para a IA
         * Bloqueia mensagens com termos proibidos
         */
        filterInput(message) {
            const blockedTerms = [];
            for (const [category, regex] of Object.entries(forbidden_terms_1.FORBIDDEN_REGEX)) {
                // Reset regex lastIndex para evitar problemas com flags globais
                regex.lastIndex = 0;
                const matches = message.match(regex);
                if (matches) {
                    this.logger.warn(`Termo bloqueado na entrada [${category}]: ${matches.join(', ')}`);
                    blockedTerms.push(...matches);
                }
            }
            return {
                allowed: blockedTerms.length === 0,
                blockedTerms: [...new Set(blockedTerms)], // Remove duplicatas
            };
        }
        /**
         * CAMADA 3: Filtro de SAÍDA
         * Executado DEPOIS de receber resposta da IA
         * Sanitiza ou bloqueia respostas com termos proibidos
         */
        filterOutput(response) {
            let filtered = response;
            const blockedTerms = [];
            // Primeiro, tenta substituir por termos seguros
            for (const [forbidden, safe] of Object.entries(forbidden_terms_1.SAFE_REPLACEMENTS)) {
                const regex = new RegExp(`\\b${forbidden}\\b`, 'gi');
                if (regex.test(filtered)) {
                    blockedTerms.push(forbidden);
                    filtered = filtered.replace(regex, safe);
                }
            }
            // Depois, verifica se ainda tem termos proibidos
            for (const [category, regex] of Object.entries(forbidden_terms_1.FORBIDDEN_REGEX)) {
                regex.lastIndex = 0;
                const matches = filtered.match(regex);
                if (matches) {
                    this.logger.warn(`Termo bloqueado na saída [${category}]: ${matches.join(', ')}`);
                    blockedTerms.push(...matches);
                }
            }
            // Se ainda tiver termos proibidos após substituição, bloqueia tudo
            const stillHasForbidden = Object.values(forbidden_terms_1.FORBIDDEN_REGEX).some((regex) => {
                regex.lastIndex = 0;
                return regex.test(filtered);
            });
            if (stillHasForbidden) {
                this.logger.warn('Resposta da IA bloqueada por conter termos proibidos');
                return {
                    safe: false,
                    filtered: forbidden_terms_1.BLOCKED_RESPONSE,
                    blockedTerms: [...new Set(blockedTerms)],
                };
            }
            return {
                safe: blockedTerms.length === 0,
                filtered,
                blockedTerms: [...new Set(blockedTerms)],
            };
        }
        /**
         * Obtém a resposta padrão para mensagens bloqueadas
         */
        getBlockedResponse() {
            return forbidden_terms_1.BLOCKED_RESPONSE;
        }
    };
    return ContentFilterService = _classThis;
})();
exports.ContentFilterService = ContentFilterService;
//# sourceMappingURL=content-filter.service.js.map
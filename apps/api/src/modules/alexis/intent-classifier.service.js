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
exports.IntentClassifierService = void 0;
const common_1 = require("@nestjs/common");
const forbidden_terms_1 = require("./constants/forbidden-terms");
let IntentClassifierService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IntentClassifierService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IntentClassifierService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Classifica a intenção da mensagem do cliente
         */
        classify(message) {
            const lower = message.toLowerCase().trim();
            // ========== CONFIRMAÇÃO DE AGENDAMENTO (prioridade alta) ==========
            // Mensagens curtas de confirmação (SIM, S, Confirmo, etc)
            if (this.isAppointmentConfirmation(lower)) {
                return 'APPOINTMENT_CONFIRM';
            }
            // Mensagens curtas de recusa (NÃO, N, Cancelar, etc)
            if (this.isAppointmentDecline(lower)) {
                return 'APPOINTMENT_DECLINE';
            }
            // Agendamento
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.SCHEDULE)) {
                return 'SCHEDULE';
            }
            // Reagendamento
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.RESCHEDULE)) {
                return 'RESCHEDULE';
            }
            // Cancelamento
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.CANCEL)) {
                return 'CANCEL';
            }
            // ========== PRICE_INFO tem precedência sobre PRODUCT_INFO (ALFA.3) ==========
            // Se a mensagem contém keywords de preço, é PRICE_INFO mesmo que mencione produto
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.PRICE_INFO)) {
                return 'PRICE_INFO';
            }
            // Informações de Produtos (só se não for sobre preço)
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.PRODUCT_INFO)) {
                return 'PRODUCT_INFO';
            }
            // Lista de serviços (mais específico que SERVICE_INFO genérico)
            if (this.isListServicesIntent(lower)) {
                return 'LIST_SERVICES';
            }
            // Informações de Serviços
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.SERVICE_INFO)) {
                return 'SERVICE_INFO';
            }
            // Horário de funcionamento
            if (this.matchesAny(lower, forbidden_terms_1.INTENT_KEYWORDS.HOURS_INFO)) {
                return 'HOURS_INFO';
            }
            // ========== GREETING somente se for saudação "pura" (sem intenção real) ==========
            // Movido para DEPOIS das checagens de conteúdo para evitar falso positivo
            if (this.isPureGreeting(lower)) {
                return 'GREETING';
            }
            return 'GENERAL';
        }
        /**
         * Verifica se a mensagem contém alguma das palavras-chave
         */
        matchesAny(message, keywords) {
            return keywords.some((keyword) => message.includes(keyword));
        }
        /**
         * Verifica se a mensagem é uma saudação "pura" (sem intenção real após a saudação).
         * Ex.: "Oi" => true, "Bom dia!" => true
         *      "Oi, quero saber sobre o Ultra Reconstrução" => false
         */
        isPureGreeting(message) {
            const greetingPattern = /^(oi|olá|ola|bom\s+dia|boa\s+tarde|boa\s+noite|hey|eai|e\s+ai|opa)[!,.\s]*$/;
            return greetingPattern.test(message);
        }
        /**
         * Retorna uma descrição amigável da intenção
         */
        getIntentDescription(intent) {
            const descriptions = {
                GREETING: 'Saudação',
                SCHEDULE: 'Agendamento',
                RESCHEDULE: 'Reagendamento',
                CANCEL: 'Cancelamento',
                PRODUCT_INFO: 'Informação sobre Produtos',
                SERVICE_INFO: 'Informação sobre Serviços',
                LIST_SERVICES: 'Lista de Serviços',
                PRICE_INFO: 'Informação sobre Preços',
                HOURS_INFO: 'Horário de Funcionamento',
                APPOINTMENT_CONFIRM: 'Confirmação de Agendamento',
                APPOINTMENT_DECLINE: 'Recusa de Agendamento',
                GENERAL: 'Pergunta Geral',
            };
            return descriptions[intent];
        }
        /**
         * Verifica se a mensagem é um pedido de listagem de serviços
         * Ex: "quais serviços vocês fazem?", "o que vocês oferecem?"
         */
        isListServicesIntent(message) {
            const patterns = [
                /quais\s+servi[cç]os/,
                /servi[cç]os\s+(voc[eê]s|que)\s+(fazem|oferecem|tem|têm)/,
                /o\s+que\s+(voc[eê]s|o\s+sal[aã]o)\s+(fazem|oferecem|tem|têm)/,
                /tabela\s+de\s+servi[cç]os/,
                /lista\s+de\s+servi[cç]os/,
                /menu\s+de\s+servi[cç]os/,
                /que\s+servi[cç]os/,
                /quais\s+s[aã]o\s+os\s+servi[cç]os/,
            ];
            return patterns.some((p) => p.test(message));
        }
        /**
         * Verifica se a mensagem é uma confirmação de agendamento
         * Detecta: SIM, S, Sim, sim, Confirmo, Confirmado, Vou, Estarei aí
         */
        isAppointmentConfirmation(message) {
            const confirmKeywords = [
                'sim',
                's',
                'confirmo',
                'confirmado',
                'confirmada',
                'confirmar',
                'vou',
                'vou sim',
                'com certeza',
                'pode confirmar',
                'tá confirmado',
                'ta confirmado',
                'estarei aí',
                'estarei ai',
                'estarei lá',
                'estarei la',
                'ok',
                'certo',
                'beleza',
                'combinado',
            ];
            // Mensagem deve ser curta (confirmações são geralmente curtas)
            if (message.length > 50)
                return false;
            return confirmKeywords.some(keyword => {
                // Para palavras de 1-2 caracteres, deve ser exata
                if (keyword.length <= 2) {
                    return message === keyword;
                }
                // Para outras, pode estar contida ou ser exata
                return message === keyword || message.startsWith(keyword + ' ') || message.endsWith(' ' + keyword);
            });
        }
        /**
         * Verifica se a mensagem é uma recusa de agendamento
         * Detecta: NÃO, N, Não, não, Cancelar, Cancela, Não vou
         */
        isAppointmentDecline(message) {
            const declineKeywords = [
                'não',
                'nao',
                'n',
                'cancelar',
                'cancela',
                'cancelado',
                'não vou',
                'nao vou',
                'não posso',
                'nao posso',
                'não dá',
                'nao da',
                'não vai dar',
                'nao vai dar',
                'desmarcar',
                'desmarca',
                'preciso cancelar',
                'quero cancelar',
            ];
            // Mensagem deve ser curta
            if (message.length > 50)
                return false;
            return declineKeywords.some(keyword => {
                if (keyword.length <= 2) {
                    return message === keyword;
                }
                return message === keyword || message.startsWith(keyword + ' ') || message.endsWith(' ' + keyword);
            });
        }
    };
    return IntentClassifierService = _classThis;
})();
exports.IntentClassifierService = IntentClassifierService;
//# sourceMappingURL=intent-classifier.service.js.map
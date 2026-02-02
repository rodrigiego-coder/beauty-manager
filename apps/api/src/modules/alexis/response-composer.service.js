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
exports.ResponseComposerService = void 0;
exports.getGreeting = getGreeting;
exports.shouldGreet = shouldGreet;
exports.isProductIntent = isProductIntent;
exports.getProductCta = getProductCta;
exports.getNameQuestion = getNameQuestion;
exports.getIntroduction = getIntroduction;
exports.composeResponse = composeResponse;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
// =====================================================
// PURE FUNCTIONS
// =====================================================
/**
 * Retorna saudacao contextual baseada no horario
 * Usa horario do servidor (ok para MVP)
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)
        return 'Bom dia';
    if (hour >= 12 && hour < 18)
        return 'Boa tarde';
    return 'Boa noite';
}
/**
 * Verifica se deve repetir saudacao/apresentacao
 * Janela padrao: 12 horas
 */
function shouldGreet(lastGreetedAt, windowHours = 2) {
    if (!lastGreetedAt)
        return true;
    const now = new Date();
    const diff = now.getTime() - lastGreetedAt.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours >= windowHours;
}
/**
 * Verifica se e uma intencao que merece CTA de produto
 */
function isProductIntent(intent) {
    return ['PRODUCT_INFO', 'PRICE_INFO'].includes(intent);
}
/**
 * Gera CTA suave para intencoes de produto
 */
function getProductCta() {
    return 'Quer que eu separe pra voce ou prefere retirar no salao?';
}
/**
 * Gera pergunta de nome educada
 */
function getNameQuestion() {
    return 'Como posso te chamar, por gentileza?';
}
/**
 * Gera apresentacao curta da Alexis
 */
function getIntroduction(salonName) {
    return `Eu sou a Alexis, assistente do ${salonName}.`;
}
/**
 * Compoe a resposta final com tom humanizado
 */
function composeResponse(params) {
    const parts = [];
    // Saudacao com primeiro nome se disponivel (P0.4: sem vírgula solta)
    const firstName = params.clientName?.split(' ')[0] || null;
    if (params.greeting && firstName) {
        parts.push(`${params.greeting}, ${firstName}!`);
    }
    else if (params.greeting) {
        parts.push(`${params.greeting}!`);
    }
    // skipGreeting=true e temos nome — NÃO prefixar (anti-repetição P0.5)
    // Apresentacao (apenas no primeiro contato da janela)
    if (params.introduction) {
        parts.push(params.introduction);
    }
    // Corpo da resposta (texto base)
    if (params.baseText) {
        parts.push(params.baseText);
    }
    // CTA para produtos
    if (params.cta) {
        parts.push(params.cta);
    }
    // Pergunta nome se nao temos
    if (params.askName) {
        parts.push(getNameQuestion());
    }
    return parts.join(' ');
}
// =====================================================
// SERVICE CLASS
// =====================================================
let ResponseComposerService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ResponseComposerService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ResponseComposerService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(ResponseComposerService.name);
        /**
         * Compoe resposta humanizada
         * - Saudacao contextual
         * - Apresentacao no primeiro contato
         * - Pergunta nome se necessario
         * - CTA suave para produtos
         */
        async compose(input) {
            const { salonId, phone, clientName, intent, baseText, skipGreeting } = input;
            // 1) Busca ou cria contato
            const contact = await this.upsertContact(salonId, phone, clientName);
            // 2) Busca nome do salao
            const salonName = await this.getSalonName(salonId);
            // 3) Determina se deve saudar/apresentar
            //    Anti-reset: skipGreeting=true quando conversa já está em andamento
            const shouldGreetNow = skipGreeting ? false : shouldGreet(contact.lastGreetedAt);
            // 4) Determina nome a usar (payload > salvo > null)
            const nameToUse = clientName || contact.name;
            // 5) Monta componentes
            const greeting = getGreeting();
            const introduction = shouldGreetNow ? getIntroduction(salonName) : null;
            const cta = isProductIntent(intent) ? getProductCta() : null;
            const askName = !nameToUse && shouldGreetNow;
            // 6) Compoe resposta
            const finalResponse = composeResponse({
                greeting: shouldGreetNow ? greeting : '',
                introduction,
                clientName: nameToUse,
                baseText,
                cta,
                askName,
            });
            // 7) Atualiza lastGreetedAt se saudou
            if (shouldGreetNow) {
                await this.updateGreetedAt(contact.id);
            }
            // 8) Se veio nome no payload e nao tinhamos, salva
            if (clientName && !contact.name) {
                await this.updateContactName(contact.id, clientName);
            }
            this.logger.debug(`Composed response for ${phone}: shouldGreet=${shouldGreetNow}, hasName=${!!nameToUse}`);
            return finalResponse.trim();
        }
        /**
         * Upsert contato (salon_id + phone)
         */
        async upsertContact(salonId, phone, clientName) {
            // Tenta buscar existente
            const [existing] = await connection_1.db
                .select()
                .from(schema_1.alexisContacts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alexisContacts.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.alexisContacts.phone, phone)))
                .limit(1);
            if (existing) {
                // Atualiza lastSeenAt
                await connection_1.db
                    .update(schema_1.alexisContacts)
                    .set({ lastSeenAt: new Date(), updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema_1.alexisContacts.id, existing.id));
                return {
                    id: existing.id,
                    name: existing.name,
                    lastGreetedAt: existing.lastGreetedAt,
                    lastSeenAt: new Date(),
                };
            }
            // Cria novo
            const [newContact] = await connection_1.db
                .insert(schema_1.alexisContacts)
                .values({
                salonId,
                phone,
                name: clientName || null,
                lastSeenAt: new Date(),
            })
                .returning();
            return {
                id: newContact.id,
                name: newContact.name,
                lastGreetedAt: null,
                lastSeenAt: new Date(),
            };
        }
        /**
         * Atualiza lastGreetedAt
         */
        async updateGreetedAt(contactId) {
            await connection_1.db
                .update(schema_1.alexisContacts)
                .set({ lastGreetedAt: new Date(), updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.alexisContacts.id, contactId));
        }
        /**
         * Atualiza nome do contato
         */
        async updateContactName(contactId, name) {
            await connection_1.db
                .update(schema_1.alexisContacts)
                .set({ name, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.alexisContacts.id, contactId));
        }
        /**
         * Busca nome do salao
         */
        async getSalonName(salonId) {
            const [salon] = await connection_1.db
                .select({ name: schema_1.salons.name })
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId))
                .limit(1);
            return salon?.name || 'Salao';
        }
    };
    return ResponseComposerService = _classThis;
})();
exports.ResponseComposerService = ResponseComposerService;
//# sourceMappingURL=response-composer.service.js.map
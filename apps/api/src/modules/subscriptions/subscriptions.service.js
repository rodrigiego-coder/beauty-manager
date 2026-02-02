"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../../database/schema"));
let SubscriptionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SubscriptionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SubscriptionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Busca a assinatura ativa de um salão
         */
        async findBySalonId(salonId) {
            const result = await this.db
                .select()
                .from(schema.subscriptions)
                .where((0, drizzle_orm_1.eq)(schema.subscriptions.salonId, salonId))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Verifica se a assinatura está ativa e válida
         */
        async isSubscriptionValid(salonId) {
            const subscription = await this.findBySalonId(salonId);
            if (!subscription) {
                return {
                    valid: false,
                    status: 'NO_SUBSCRIPTION',
                    daysRemaining: 0,
                    message: 'Nenhuma assinatura encontrada',
                };
            }
            const now = new Date();
            const periodEnd = new Date(subscription.currentPeriodEnd);
            const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            // Verifica status da assinatura
            switch (subscription.status) {
                case 'ACTIVE':
                    return {
                        valid: true,
                        status: 'ACTIVE',
                        daysRemaining,
                        message: 'Assinatura ativa',
                    };
                case 'TRIALING':
                    const trialEnd = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : periodEnd;
                    const trialDaysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (trialDaysRemaining > 0) {
                        return {
                            valid: true,
                            status: 'TRIALING',
                            daysRemaining: trialDaysRemaining,
                            message: `Período de teste: ${trialDaysRemaining} dias restantes`,
                        };
                    }
                    return {
                        valid: false,
                        status: 'TRIAL_EXPIRED',
                        daysRemaining: 0,
                        message: 'Período de teste expirado',
                    };
                case 'PAST_DUE':
                    // Permite acesso durante período de carência (7 dias)
                    const gracePeriodEnd = subscription.gracePeriodEndsAt
                        ? new Date(subscription.gracePeriodEndsAt)
                        : new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
                    if (now < gracePeriodEnd) {
                        const graceDaysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return {
                            valid: true,
                            status: 'PAST_DUE',
                            daysRemaining: graceDaysRemaining,
                            message: `Pagamento pendente. ${graceDaysRemaining} dias para regularizar`,
                        };
                    }
                    return {
                        valid: false,
                        status: 'SUSPENDED',
                        daysRemaining: 0,
                        message: 'Assinatura suspensa por falta de pagamento',
                    };
                case 'CANCELED':
                    // Permite acesso até o fim do período pago
                    if (daysRemaining > 0) {
                        return {
                            valid: true,
                            status: 'CANCELED',
                            daysRemaining,
                            message: `Assinatura cancelada. Acesso até ${periodEnd.toLocaleDateString('pt-BR')}`,
                        };
                    }
                    return {
                        valid: false,
                        status: 'CANCELED',
                        daysRemaining: 0,
                        message: 'Assinatura cancelada',
                    };
                case 'SUSPENDED':
                    return {
                        valid: false,
                        status: 'SUSPENDED',
                        daysRemaining: 0,
                        message: 'Assinatura suspensa',
                    };
                default:
                    return {
                        valid: false,
                        status: 'UNKNOWN',
                        daysRemaining: 0,
                        message: 'Status de assinatura desconhecido',
                    };
            }
        }
        /**
         * Cria uma nova assinatura para um salão
         */
        async create(data) {
            const now = new Date();
            const trialDays = data.trialDays ?? 7;
            const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
            const result = await this.db
                .insert(schema.subscriptions)
                .values({
                salonId: data.salonId,
                planId: data.planId,
                status: 'TRIALING',
                currentPeriodStart: now,
                currentPeriodEnd: trialEnd,
                trialEndsAt: trialEnd,
            })
                .returning();
            return result[0];
        }
        /**
         * Ativa a assinatura após pagamento
         */
        async activate(subscriptionId) {
            const now = new Date();
            const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
            const result = await this.db
                .update(schema.subscriptions)
                .set({
                status: 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema.subscriptions.id, subscriptionId))
                .returning();
            return result[0];
        }
        /**
         * Marca como pagamento atrasado
         */
        async markAsPastDue(subscriptionId) {
            const now = new Date();
            const gracePeriodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias de carência
            const result = await this.db
                .update(schema.subscriptions)
                .set({
                status: 'PAST_DUE',
                gracePeriodEndsAt: gracePeriodEnd,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema.subscriptions.id, subscriptionId))
                .returning();
            return result[0];
        }
        /**
         * Suspende a assinatura
         */
        async suspend(subscriptionId) {
            const result = await this.db
                .update(schema.subscriptions)
                .set({
                status: 'SUSPENDED',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.subscriptions.id, subscriptionId))
                .returning();
            return result[0];
        }
        /**
         * Cancela a assinatura
         */
        async cancel(subscriptionId) {
            const result = await this.db
                .update(schema.subscriptions)
                .set({
                status: 'CANCELED',
                canceledAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.subscriptions.id, subscriptionId))
                .returning();
            return result[0];
        }
        /**
         * Lista todos os planos disponíveis
         */
        async getPlans() {
            return this.db
                .select()
                .from(schema.subscriptionPlans)
                .where((0, drizzle_orm_1.eq)(schema.subscriptionPlans.active, true));
        }
        /**
         * Busca um plano por ID
         */
        async getPlanById(planId) {
            const result = await this.db
                .select()
                .from(schema.subscriptionPlans)
                .where((0, drizzle_orm_1.eq)(schema.subscriptionPlans.id, planId))
                .limit(1);
            return result[0] || null;
        }
    };
    return SubscriptionsService = _classThis;
})();
exports.SubscriptionsService = SubscriptionsService;
//# sourceMappingURL=subscriptions.service.js.map
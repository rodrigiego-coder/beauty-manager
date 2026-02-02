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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const swagger_1 = require("@nestjs/swagger");
let SubscriptionsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Subscriptions'), (0, common_1.Controller)('subscriptions'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getPlans_decorators;
    let _getCurrentSubscription_decorators;
    let _getSubscriptionStatus_decorators;
    let _startTrial_decorators;
    let _changePlan_decorators;
    let _cancelSubscription_decorators;
    let _reactivateSubscription_decorators;
    let _getInvoices_decorators;
    let _getInvoice_decorators;
    let _payInvoice_decorators;
    let _getEvents_decorators;
    var SubscriptionsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getPlans_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('plans')];
            _getCurrentSubscription_decorators = [(0, common_1.Get)('current')];
            _getSubscriptionStatus_decorators = [(0, common_1.Get)('status')];
            _startTrial_decorators = [(0, common_1.Post)('start-trial'), (0, roles_decorator_1.Roles)('OWNER')];
            _changePlan_decorators = [(0, common_1.Post)('change-plan'), (0, roles_decorator_1.Roles)('OWNER')];
            _cancelSubscription_decorators = [(0, common_1.Post)('cancel'), (0, roles_decorator_1.Roles)('OWNER')];
            _reactivateSubscription_decorators = [(0, common_1.Post)('reactivate'), (0, roles_decorator_1.Roles)('OWNER')];
            _getInvoices_decorators = [(0, common_1.Get)('invoices')];
            _getInvoice_decorators = [(0, common_1.Get)('invoices/:id')];
            _payInvoice_decorators = [(0, common_1.Post)('invoices/:id/pay'), (0, roles_decorator_1.Roles)('OWNER')];
            _getEvents_decorators = [(0, common_1.Get)('events')];
            __esDecorate(this, null, _getPlans_decorators, { kind: "method", name: "getPlans", static: false, private: false, access: { has: obj => "getPlans" in obj, get: obj => obj.getPlans }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCurrentSubscription_decorators, { kind: "method", name: "getCurrentSubscription", static: false, private: false, access: { has: obj => "getCurrentSubscription" in obj, get: obj => obj.getCurrentSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSubscriptionStatus_decorators, { kind: "method", name: "getSubscriptionStatus", static: false, private: false, access: { has: obj => "getSubscriptionStatus" in obj, get: obj => obj.getSubscriptionStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startTrial_decorators, { kind: "method", name: "startTrial", static: false, private: false, access: { has: obj => "startTrial" in obj, get: obj => obj.startTrial }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _changePlan_decorators, { kind: "method", name: "changePlan", static: false, private: false, access: { has: obj => "changePlan" in obj, get: obj => obj.changePlan }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelSubscription_decorators, { kind: "method", name: "cancelSubscription", static: false, private: false, access: { has: obj => "cancelSubscription" in obj, get: obj => obj.cancelSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reactivateSubscription_decorators, { kind: "method", name: "reactivateSubscription", static: false, private: false, access: { has: obj => "reactivateSubscription" in obj, get: obj => obj.reactivateSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getInvoices_decorators, { kind: "method", name: "getInvoices", static: false, private: false, access: { has: obj => "getInvoices" in obj, get: obj => obj.getInvoices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getInvoice_decorators, { kind: "method", name: "getInvoice", static: false, private: false, access: { has: obj => "getInvoice" in obj, get: obj => obj.getInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _payInvoice_decorators, { kind: "method", name: "payInvoice", static: false, private: false, access: { has: obj => "payInvoice" in obj, get: obj => obj.payInvoice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getEvents_decorators, { kind: "method", name: "getEvents", static: false, private: false, access: { has: obj => "getEvents" in obj, get: obj => obj.getEvents }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SubscriptionsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        subscriptionsService = __runInitializers(this, _instanceExtraInitializers);
        plansService;
        constructor(subscriptionsService, plansService) {
            this.subscriptionsService = subscriptionsService;
            this.plansService = plansService;
        }
        /**
         * GET /subscriptions/plans - Lista todos os planos disponiveis (público)
         */
        async getPlans() {
            return this.plansService.findAll();
        }
        /**
         * GET /subscriptions/current - Retorna a assinatura atual do salao
         */
        async getCurrentSubscription(user) {
            const { subscription, plan, limits, usage } = await this.subscriptionsService.getCurrentSubscription(user.salonId);
            if (!subscription) {
                return {
                    subscription: null,
                    plan: null,
                    limits: { users: 1, clients: 50 },
                    usage,
                    status: {
                        valid: false,
                        status: 'NO_SUBSCRIPTION',
                        message: 'Nenhuma assinatura encontrada',
                        canAccess: false,
                    },
                };
            }
            const status = await this.subscriptionsService.isSubscriptionValid(user.salonId);
            return {
                subscription: {
                    id: subscription.id,
                    salonId: subscription.salonId,
                    planId: subscription.planId,
                    status: subscription.status,
                    billingPeriod: subscription.billingPeriod,
                    startsAt: subscription.startsAt,
                    trialEndsAt: subscription.trialEndsAt,
                    currentPeriodStart: subscription.currentPeriodStart,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                    canceledAt: subscription.canceledAt,
                },
                plan: plan
                    ? {
                        id: plan.id,
                        code: plan.code,
                        name: plan.name,
                        description: plan.description,
                        priceMonthly: plan.priceMonthly,
                        priceYearly: plan.priceYearly,
                        maxUsers: plan.maxUsers,
                        maxClients: plan.maxClients,
                        features: plan.features,
                        hasFiscal: plan.hasFiscal,
                        hasAutomation: plan.hasAutomation,
                        hasReports: plan.hasReports,
                        hasAI: plan.hasAI,
                    }
                    : null,
                limits,
                usage,
                status,
            };
        }
        /**
         * GET /subscriptions/status - Retorna o status da assinatura
         */
        async getSubscriptionStatus(user) {
            return this.subscriptionsService.isSubscriptionValid(user.salonId);
        }
        /**
         * POST /subscriptions/start-trial - Iniciar periodo de teste
         */
        async startTrial(user, dto) {
            return this.subscriptionsService.startTrial(user.salonId, dto, user.id);
        }
        /**
         * POST /subscriptions/change-plan - Trocar de plano
         */
        async changePlan(user, dto) {
            return this.subscriptionsService.changePlan(user.salonId, dto, user.id);
        }
        /**
         * POST /subscriptions/cancel - Cancelar assinatura
         */
        async cancelSubscription(user, dto) {
            const subscription = await this.subscriptionsService.cancel(user.salonId, dto, user.id);
            return {
                success: true,
                message: dto.cancelAtPeriodEnd
                    ? 'Assinatura será cancelada ao final do período'
                    : 'Assinatura cancelada com sucesso',
                subscription,
            };
        }
        /**
         * POST /subscriptions/reactivate - Reativar assinatura
         */
        async reactivateSubscription(user, dto) {
            const subscription = await this.subscriptionsService.reactivate(user.salonId, dto, user.id);
            return {
                success: true,
                message: 'Assinatura reativada com sucesso',
                subscription,
            };
        }
        /**
         * GET /subscriptions/invoices - Listar faturas
         */
        async getInvoices(user, filters) {
            return this.subscriptionsService.getInvoices(user.salonId, filters);
        }
        /**
         * GET /subscriptions/invoices/:id - Detalhes de uma fatura
         */
        async getInvoice(user, invoiceId) {
            return this.subscriptionsService.getInvoiceById(invoiceId, user.salonId);
        }
        /**
         * POST /subscriptions/invoices/:id/pay - Iniciar pagamento
         */
        async payInvoice(user, invoiceId, dto) {
            return this.subscriptionsService.initiatePayment(invoiceId, user.salonId, dto);
        }
        /**
         * GET /subscriptions/events - Historico de eventos
         */
        async getEvents(user) {
            const { subscription } = await this.subscriptionsService.getCurrentSubscription(user.salonId);
            if (!subscription) {
                return [];
            }
            return this.subscriptionsService.getEvents(subscription.id);
        }
    };
    return SubscriptionsController = _classThis;
})();
exports.SubscriptionsController = SubscriptionsController;
//# sourceMappingURL=subscriptions.controller.js.map
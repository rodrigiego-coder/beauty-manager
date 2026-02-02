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
exports.ProductSubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let ProductSubscriptionsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('product-subscriptions'), (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getPlans_decorators;
    let _getPlanById_decorators;
    let _createPlan_decorators;
    let _updatePlan_decorators;
    let _deletePlan_decorators;
    let _addPlanItem_decorators;
    let _removePlanItem_decorators;
    let _getAvailablePlans_decorators;
    let _getSubscriptions_decorators;
    let _getStats_decorators;
    let _getMySubscriptions_decorators;
    let _getSubscriptionById_decorators;
    let _subscribe_decorators;
    let _updateSubscription_decorators;
    let _pauseSubscription_decorators;
    let _pauseSubscriptionAlt_decorators;
    let _resumeSubscription_decorators;
    let _resumeSubscriptionAlt_decorators;
    let _cancelSubscription_decorators;
    let _cancelSubscriptionAlt_decorators;
    let _getDeliveries_decorators;
    let _getPendingDeliveries_decorators;
    let _getSubscriptionDeliveries_decorators;
    let _updateDeliveryStatus_decorators;
    let _generateCommand_decorators;
    var ProductSubscriptionsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getPlans_decorators = [(0, common_1.Get)('plans'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getPlanById_decorators = [(0, common_1.Get)('plans/:id'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _createPlan_decorators = [(0, common_1.Post)('plans'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _updatePlan_decorators = [(0, common_1.Patch)('plans/:id'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _deletePlan_decorators = [(0, common_1.Delete)('plans/:id'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _addPlanItem_decorators = [(0, common_1.Post)('plans/:id/items'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _removePlanItem_decorators = [(0, common_1.Delete)('plans/:planId/items/:itemId'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _getAvailablePlans_decorators = [(0, common_1.Get)('available'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getSubscriptions_decorators = [(0, common_1.Get)(), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _getMySubscriptions_decorators = [(0, common_1.Get)('subscriptions/my'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getSubscriptionById_decorators = [(0, common_1.Get)(':id'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _subscribe_decorators = [(0, common_1.Post)('subscribe/:planId'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _updateSubscription_decorators = [(0, common_1.Patch)(':id'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _pauseSubscription_decorators = [(0, common_1.Post)(':id/pause'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _pauseSubscriptionAlt_decorators = [(0, common_1.Post)('subscriptions/:id/pause'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _resumeSubscription_decorators = [(0, common_1.Post)(':id/resume'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _resumeSubscriptionAlt_decorators = [(0, common_1.Post)('subscriptions/:id/resume'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _cancelSubscription_decorators = [(0, common_1.Post)(':id/cancel'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _cancelSubscriptionAlt_decorators = [(0, common_1.Post)('subscriptions/:id/cancel'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')];
            _getDeliveries_decorators = [(0, common_1.Get)('deliveries/all'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getPendingDeliveries_decorators = [(0, common_1.Get)('deliveries/pending'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getSubscriptionDeliveries_decorators = [(0, common_1.Get)(':id/deliveries'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _updateDeliveryStatus_decorators = [(0, common_1.Patch)('deliveries/:id/status'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _generateCommand_decorators = [(0, common_1.Post)('deliveries/:id/generate-command'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            __esDecorate(this, null, _getPlans_decorators, { kind: "method", name: "getPlans", static: false, private: false, access: { has: obj => "getPlans" in obj, get: obj => obj.getPlans }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPlanById_decorators, { kind: "method", name: "getPlanById", static: false, private: false, access: { has: obj => "getPlanById" in obj, get: obj => obj.getPlanById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createPlan_decorators, { kind: "method", name: "createPlan", static: false, private: false, access: { has: obj => "createPlan" in obj, get: obj => obj.createPlan }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updatePlan_decorators, { kind: "method", name: "updatePlan", static: false, private: false, access: { has: obj => "updatePlan" in obj, get: obj => obj.updatePlan }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deletePlan_decorators, { kind: "method", name: "deletePlan", static: false, private: false, access: { has: obj => "deletePlan" in obj, get: obj => obj.deletePlan }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addPlanItem_decorators, { kind: "method", name: "addPlanItem", static: false, private: false, access: { has: obj => "addPlanItem" in obj, get: obj => obj.addPlanItem }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removePlanItem_decorators, { kind: "method", name: "removePlanItem", static: false, private: false, access: { has: obj => "removePlanItem" in obj, get: obj => obj.removePlanItem }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailablePlans_decorators, { kind: "method", name: "getAvailablePlans", static: false, private: false, access: { has: obj => "getAvailablePlans" in obj, get: obj => obj.getAvailablePlans }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSubscriptions_decorators, { kind: "method", name: "getSubscriptions", static: false, private: false, access: { has: obj => "getSubscriptions" in obj, get: obj => obj.getSubscriptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMySubscriptions_decorators, { kind: "method", name: "getMySubscriptions", static: false, private: false, access: { has: obj => "getMySubscriptions" in obj, get: obj => obj.getMySubscriptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSubscriptionById_decorators, { kind: "method", name: "getSubscriptionById", static: false, private: false, access: { has: obj => "getSubscriptionById" in obj, get: obj => obj.getSubscriptionById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _subscribe_decorators, { kind: "method", name: "subscribe", static: false, private: false, access: { has: obj => "subscribe" in obj, get: obj => obj.subscribe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSubscription_decorators, { kind: "method", name: "updateSubscription", static: false, private: false, access: { has: obj => "updateSubscription" in obj, get: obj => obj.updateSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _pauseSubscription_decorators, { kind: "method", name: "pauseSubscription", static: false, private: false, access: { has: obj => "pauseSubscription" in obj, get: obj => obj.pauseSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _pauseSubscriptionAlt_decorators, { kind: "method", name: "pauseSubscriptionAlt", static: false, private: false, access: { has: obj => "pauseSubscriptionAlt" in obj, get: obj => obj.pauseSubscriptionAlt }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resumeSubscription_decorators, { kind: "method", name: "resumeSubscription", static: false, private: false, access: { has: obj => "resumeSubscription" in obj, get: obj => obj.resumeSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resumeSubscriptionAlt_decorators, { kind: "method", name: "resumeSubscriptionAlt", static: false, private: false, access: { has: obj => "resumeSubscriptionAlt" in obj, get: obj => obj.resumeSubscriptionAlt }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelSubscription_decorators, { kind: "method", name: "cancelSubscription", static: false, private: false, access: { has: obj => "cancelSubscription" in obj, get: obj => obj.cancelSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelSubscriptionAlt_decorators, { kind: "method", name: "cancelSubscriptionAlt", static: false, private: false, access: { has: obj => "cancelSubscriptionAlt" in obj, get: obj => obj.cancelSubscriptionAlt }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDeliveries_decorators, { kind: "method", name: "getDeliveries", static: false, private: false, access: { has: obj => "getDeliveries" in obj, get: obj => obj.getDeliveries }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPendingDeliveries_decorators, { kind: "method", name: "getPendingDeliveries", static: false, private: false, access: { has: obj => "getPendingDeliveries" in obj, get: obj => obj.getPendingDeliveries }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSubscriptionDeliveries_decorators, { kind: "method", name: "getSubscriptionDeliveries", static: false, private: false, access: { has: obj => "getSubscriptionDeliveries" in obj, get: obj => obj.getSubscriptionDeliveries }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateDeliveryStatus_decorators, { kind: "method", name: "updateDeliveryStatus", static: false, private: false, access: { has: obj => "updateDeliveryStatus" in obj, get: obj => obj.updateDeliveryStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateCommand_decorators, { kind: "method", name: "generateCommand", static: false, private: false, access: { has: obj => "generateCommand" in obj, get: obj => obj.generateCommand }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductSubscriptionsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        service = __runInitializers(this, _instanceExtraInitializers);
        constructor(service) {
            this.service = service;
        }
        // ==================== PLAN ENDPOINTS ====================
        async getPlans(req, active) {
            // Se active=true, retorna apenas planos ativos (para UI de assinaturas)
            if (active === 'true') {
                return this.service.getAvailablePlans(req.user.salonId);
            }
            return this.service.getPlans(req.user.salonId);
        }
        async getPlanById(id, req) {
            return this.service.getPlanById(id, req.user.salonId);
        }
        async createPlan(dto, req) {
            return this.service.createPlan(req.user.salonId, dto);
        }
        async updatePlan(id, dto, req) {
            return this.service.updatePlan(id, req.user.salonId, dto);
        }
        async deletePlan(id, req) {
            await this.service.deletePlan(id, req.user.salonId);
            return { message: 'Plano removido com sucesso' };
        }
        async addPlanItem(id, dto, req) {
            return this.service.addPlanItem(id, req.user.salonId, dto);
        }
        async removePlanItem(planId, itemId, req) {
            return this.service.removePlanItem(planId, itemId, req.user.salonId);
        }
        // ==================== SUBSCRIPTION ENDPOINTS ====================
        async getAvailablePlans(req) {
            return this.service.getAvailablePlans(req.user.salonId);
        }
        async getSubscriptions(req, clientId) {
            return this.service.getSubscriptions(req.user.salonId, clientId);
        }
        async getStats(req) {
            return this.service.getStats(req.user.salonId);
        }
        /**
         * GET /product-subscriptions/subscriptions/my
         * Retorna as assinaturas de produtos do salao do usuario logado
         * Usado pela pagina de Assinaturas do frontend
         */
        async getMySubscriptions(req) {
            return this.service.getSubscriptions(req.user.salonId);
        }
        async getSubscriptionById(id, req) {
            return this.service.getSubscriptionById(id, req.user.salonId);
        }
        async subscribe(planId, dto, req) {
            return this.service.subscribe(req.user.salonId, dto.clientId, planId, dto);
        }
        async updateSubscription(id, dto, req) {
            return this.service.updateSubscription(id, req.user.salonId, dto);
        }
        async pauseSubscription(id, dto, req) {
            return this.service.pauseSubscription(id, req.user.salonId, dto);
        }
        /**
         * POST /product-subscriptions/subscriptions/:id/pause
         * Rota alternativa para pausar assinatura (compatibilidade com frontend)
         */
        async pauseSubscriptionAlt(id, dto, req) {
            return this.service.pauseSubscription(id, req.user.salonId, dto);
        }
        async resumeSubscription(id, req) {
            return this.service.resumeSubscription(id, req.user.salonId);
        }
        /**
         * POST /product-subscriptions/subscriptions/:id/resume
         * Rota alternativa para retomar assinatura (compatibilidade com frontend)
         */
        async resumeSubscriptionAlt(id, req) {
            return this.service.resumeSubscription(id, req.user.salonId);
        }
        async cancelSubscription(id, dto, req) {
            return this.service.cancelSubscription(id, req.user.salonId, dto);
        }
        /**
         * POST /product-subscriptions/subscriptions/:id/cancel
         * Rota alternativa para cancelar assinatura (compatibilidade com frontend)
         */
        async cancelSubscriptionAlt(id, dto, req) {
            return this.service.cancelSubscription(id, req.user.salonId, dto);
        }
        // ==================== DELIVERY ENDPOINTS ====================
        async getDeliveries(req, date, status) {
            return this.service.getDeliveries(req.user.salonId, { date, status });
        }
        async getPendingDeliveries(req) {
            return this.service.getPendingDeliveries(req.user.salonId);
        }
        async getSubscriptionDeliveries(id, req) {
            return this.service.getSubscriptionDeliveries(id, req.user.salonId);
        }
        async updateDeliveryStatus(id, dto, req) {
            return this.service.updateDeliveryStatus(id, req.user.salonId, dto, req.user.sub);
        }
        async generateCommand(id, req) {
            return this.service.generateCommand(id, req.user.salonId, req.user.sub);
        }
    };
    return ProductSubscriptionsController = _classThis;
})();
exports.ProductSubscriptionsController = ProductSubscriptionsController;
//# sourceMappingURL=product-subscriptions.controller.js.map
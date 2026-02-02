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
exports.UpsellController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let UpsellController = (() => {
    let _classDecorators = [(0, common_1.Controller)('upsell'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getRules_decorators;
    let _getRule_decorators;
    let _createRule_decorators;
    let _updateRule_decorators;
    let _deleteRule_decorators;
    let _getOffersForAppointment_decorators;
    let _getOffersForService_decorators;
    let _getPersonalizedOffers_decorators;
    let _getOffers_decorators;
    let _acceptOffer_decorators;
    let _declineOffer_decorators;
    let _getStats_decorators;
    var UpsellController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getRules_decorators = [(0, common_1.Get)('rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getRule_decorators = [(0, common_1.Get)('rules/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _createRule_decorators = [(0, common_1.Post)('rules'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _updateRule_decorators = [(0, common_1.Patch)('rules/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _deleteRule_decorators = [(0, common_1.Delete)('rules/:id'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getOffersForAppointment_decorators = [(0, common_1.Get)('for-appointment/:appointmentId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getOffersForService_decorators = [(0, common_1.Get)('for-service/:serviceId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getPersonalizedOffers_decorators = [(0, common_1.Get)('for-client/:clientId'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getOffers_decorators = [(0, common_1.Get)('offers'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _acceptOffer_decorators = [(0, common_1.Post)('offers/:id/accept'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _declineOffer_decorators = [(0, common_1.Post)('offers/:id/decline'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _getRules_decorators, { kind: "method", name: "getRules", static: false, private: false, access: { has: obj => "getRules" in obj, get: obj => obj.getRules }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRule_decorators, { kind: "method", name: "getRule", static: false, private: false, access: { has: obj => "getRule" in obj, get: obj => obj.getRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createRule_decorators, { kind: "method", name: "createRule", static: false, private: false, access: { has: obj => "createRule" in obj, get: obj => obj.createRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateRule_decorators, { kind: "method", name: "updateRule", static: false, private: false, access: { has: obj => "updateRule" in obj, get: obj => obj.updateRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteRule_decorators, { kind: "method", name: "deleteRule", static: false, private: false, access: { has: obj => "deleteRule" in obj, get: obj => obj.deleteRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOffersForAppointment_decorators, { kind: "method", name: "getOffersForAppointment", static: false, private: false, access: { has: obj => "getOffersForAppointment" in obj, get: obj => obj.getOffersForAppointment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOffersForService_decorators, { kind: "method", name: "getOffersForService", static: false, private: false, access: { has: obj => "getOffersForService" in obj, get: obj => obj.getOffersForService }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPersonalizedOffers_decorators, { kind: "method", name: "getPersonalizedOffers", static: false, private: false, access: { has: obj => "getPersonalizedOffers" in obj, get: obj => obj.getPersonalizedOffers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOffers_decorators, { kind: "method", name: "getOffers", static: false, private: false, access: { has: obj => "getOffers" in obj, get: obj => obj.getOffers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _acceptOffer_decorators, { kind: "method", name: "acceptOffer", static: false, private: false, access: { has: obj => "acceptOffer" in obj, get: obj => obj.acceptOffer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _declineOffer_decorators, { kind: "method", name: "declineOffer", static: false, private: false, access: { has: obj => "declineOffer" in obj, get: obj => obj.declineOffer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UpsellController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        upsellService = __runInitializers(this, _instanceExtraInitializers);
        constructor(upsellService) {
            this.upsellService = upsellService;
        }
        // ==================== RULES ====================
        async getRules(req, page, limit, triggerType, isActive) {
            return this.upsellService.getRules(req.user.salonId, {
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                triggerType,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
            });
        }
        async getRule(req, id) {
            return this.upsellService.getRuleById(req.user.salonId, id);
        }
        async createRule(req, dto) {
            return this.upsellService.createRule(req.user.salonId, dto);
        }
        async updateRule(req, id, dto) {
            return this.upsellService.updateRule(req.user.salonId, id, dto);
        }
        async deleteRule(req, id) {
            return this.upsellService.deleteRule(req.user.salonId, id);
        }
        // ==================== OFFERS ====================
        async getOffersForAppointment(req, appointmentId) {
            return this.upsellService.getOffersForAppointment(req.user.salonId, appointmentId);
        }
        async getOffersForService(req, serviceId) {
            return this.upsellService.getOffersForService(req.user.salonId, parseInt(serviceId, 10));
        }
        async getPersonalizedOffers(req, clientId) {
            return this.upsellService.getPersonalizedOffers(req.user.salonId, clientId);
        }
        async getOffers(req, page, limit, status, clientId, ruleId) {
            return this.upsellService.getOffers(req.user.salonId, {
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
                status,
                clientId,
                ruleId,
            });
        }
        async acceptOffer(req, id, dto) {
            return this.upsellService.acceptOffer(req.user.salonId, id, dto.commandId);
        }
        async declineOffer(req, id) {
            return this.upsellService.declineOffer(req.user.salonId, id);
        }
        // ==================== STATS ====================
        async getStats(req, startDate, endDate) {
            return this.upsellService.getStats(req.user.salonId, startDate, endDate);
        }
    };
    return UpsellController = _classThis;
})();
exports.UpsellController = UpsellController;
//# sourceMappingURL=upsell.controller.js.map
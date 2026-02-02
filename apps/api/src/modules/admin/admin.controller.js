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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminController = (() => {
    let _classDecorators = [(0, common_1.Controller)('admin'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('SUPER_ADMIN')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getDashboard_decorators;
    let _listSalons_decorators;
    let _getSalonDetails_decorators;
    let _suspendSalon_decorators;
    let _activateSalon_decorators;
    let _updateSubscription_decorators;
    let _listSubscriptions_decorators;
    let _listInvoices_decorators;
    let _markInvoiceAsPaid_decorators;
    let _listEvents_decorators;
    var AdminController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getDashboard_decorators = [(0, common_1.Get)('dashboard')];
            _listSalons_decorators = [(0, common_1.Get)('salons')];
            _getSalonDetails_decorators = [(0, common_1.Get)('salons/:id')];
            _suspendSalon_decorators = [(0, common_1.Post)('salons/:id/suspend')];
            _activateSalon_decorators = [(0, common_1.Post)('salons/:id/activate')];
            _updateSubscription_decorators = [(0, common_1.Patch)('salons/:id/subscription')];
            _listSubscriptions_decorators = [(0, common_1.Get)('subscriptions')];
            _listInvoices_decorators = [(0, common_1.Get)('invoices')];
            _markInvoiceAsPaid_decorators = [(0, common_1.Post)('invoices/:id/mark-paid')];
            _listEvents_decorators = [(0, common_1.Get)('events')];
            __esDecorate(this, null, _getDashboard_decorators, { kind: "method", name: "getDashboard", static: false, private: false, access: { has: obj => "getDashboard" in obj, get: obj => obj.getDashboard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listSalons_decorators, { kind: "method", name: "listSalons", static: false, private: false, access: { has: obj => "listSalons" in obj, get: obj => obj.listSalons }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSalonDetails_decorators, { kind: "method", name: "getSalonDetails", static: false, private: false, access: { has: obj => "getSalonDetails" in obj, get: obj => obj.getSalonDetails }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _suspendSalon_decorators, { kind: "method", name: "suspendSalon", static: false, private: false, access: { has: obj => "suspendSalon" in obj, get: obj => obj.suspendSalon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _activateSalon_decorators, { kind: "method", name: "activateSalon", static: false, private: false, access: { has: obj => "activateSalon" in obj, get: obj => obj.activateSalon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateSubscription_decorators, { kind: "method", name: "updateSubscription", static: false, private: false, access: { has: obj => "updateSubscription" in obj, get: obj => obj.updateSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listSubscriptions_decorators, { kind: "method", name: "listSubscriptions", static: false, private: false, access: { has: obj => "listSubscriptions" in obj, get: obj => obj.listSubscriptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listInvoices_decorators, { kind: "method", name: "listInvoices", static: false, private: false, access: { has: obj => "listInvoices" in obj, get: obj => obj.listInvoices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markInvoiceAsPaid_decorators, { kind: "method", name: "markInvoiceAsPaid", static: false, private: false, access: { has: obj => "markInvoiceAsPaid" in obj, get: obj => obj.markInvoiceAsPaid }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listEvents_decorators, { kind: "method", name: "listEvents", static: false, private: false, access: { has: obj => "listEvents" in obj, get: obj => obj.listEvents }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        adminService = __runInitializers(this, _instanceExtraInitializers);
        constructor(adminService) {
            this.adminService = adminService;
        }
        /**
         * GET /admin/dashboard - Dashboard metrics
         */
        async getDashboard() {
            return this.adminService.getDashboardMetrics();
        }
        /**
         * GET /admin/salons - List all salons
         */
        async listSalons(status, search) {
            return this.adminService.listSalons({ status, search });
        }
        /**
         * GET /admin/salons/:id - Salon details
         */
        async getSalonDetails(salonId) {
            return this.adminService.getSalonDetails(salonId);
        }
        /**
         * POST /admin/salons/:id/suspend - Suspend salon
         */
        async suspendSalon(salonId, body, adminUserId, request) {
            await this.adminService.suspendSalon(salonId, body.reason, adminUserId, request.ip || request.connection?.remoteAddress);
            return { success: true, message: 'Salão suspenso com sucesso' };
        }
        /**
         * POST /admin/salons/:id/activate - Activate salon
         */
        async activateSalon(salonId, adminUserId, request) {
            await this.adminService.activateSalon(salonId, adminUserId, request.ip || request.connection?.remoteAddress);
            return { success: true, message: 'Salão ativado com sucesso' };
        }
        /**
         * PATCH /admin/salons/:id/subscription - Update subscription manually
         */
        async updateSubscription(salonId, body) {
            await this.adminService.updateSubscription(salonId, body);
            return { success: true, message: 'Assinatura atualizada com sucesso' };
        }
        /**
         * GET /admin/subscriptions - List all subscriptions
         */
        async listSubscriptions(status, planId) {
            return this.adminService.listSubscriptions({ status, planId });
        }
        /**
         * GET /admin/invoices - List all invoices
         */
        async listInvoices(status, salonId) {
            return this.adminService.listInvoices({ status, salonId });
        }
        /**
         * POST /admin/invoices/:id/mark-paid - Mark invoice as paid
         */
        async markInvoiceAsPaid(invoiceId) {
            await this.adminService.markInvoiceAsPaid(invoiceId);
            return { success: true, message: 'Fatura marcada como paga' };
        }
        /**
         * GET /admin/events - List subscription events
         */
        async listEvents(type, subscriptionId) {
            return this.adminService.listEvents({ type, subscriptionId });
        }
    };
    return AdminController = _classThis;
})();
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map
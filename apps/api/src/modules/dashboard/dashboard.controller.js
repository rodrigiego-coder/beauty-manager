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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const decorators_1 = require("../../common/decorators");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let DashboardController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Dashboard'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('dashboard'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getStats_decorators;
    let _getProfessionalDashboard_decorators;
    var DashboardController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getStats_decorators = [(0, common_1.Get)('stats'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, swagger_1.ApiOperation)({ summary: 'Dashboard geral do salão' })];
            _getProfessionalDashboard_decorators = [(0, common_1.Get)('professional'), (0, decorators_1.Roles)('STYLIST', 'MANAGER', 'OWNER'), (0, swagger_1.ApiOperation)({ summary: 'Dashboard do profissional (isolado por usuário)' })];
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProfessionalDashboard_decorators, { kind: "method", name: "getProfessionalDashboard", static: false, private: false, access: { has: obj => "getProfessionalDashboard" in obj, get: obj => obj.getProfessionalDashboard }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DashboardController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        dashboardService = __runInitializers(this, _instanceExtraInitializers);
        constructor(dashboardService) {
            this.dashboardService = dashboardService;
        }
        /**
         * GET /dashboard/stats
         * Retorna estatisticas do dashboard para o salao do usuario logado
         *
         * @param period - Periodo de consulta: today, week, month, year (default: today)
         */
        async getStats(user, period) {
            const validPeriod = this.validatePeriod(period);
            return this.dashboardService.getStats(user.salonId, validPeriod);
        }
        /**
         * GET /dashboard/professional
         * Retorna dashboard do profissional logado
         * CRÍTICO: STYLIST só vê seus próprios dados
         */
        async getProfessionalDashboard(user) {
            // SEGURANÇA: Sempre usa o ID do usuário logado, nunca aceita parâmetro externo
            return this.dashboardService.getProfessionalDashboard(user.salonId, user.id);
        }
        validatePeriod(period) {
            const validPeriods = ['today', 'week', 'month', 'year'];
            if (period && validPeriods.includes(period)) {
                return period;
            }
            return 'today';
        }
    };
    return DashboardController = _classThis;
})();
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map
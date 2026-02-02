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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CommissionsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Commissions'), (0, common_1.Controller)('commissions'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getSummary_decorators;
    let _getSummaryByProfessional_decorators;
    let _findById_decorators;
    let _payCommissions_decorators;
    let _payProfessionalCommissions_decorators;
    var CommissionsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _getSummary_decorators = [(0, common_1.Get)('summary')];
            _getSummaryByProfessional_decorators = [(0, common_1.Get)('by-professional')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _payCommissions_decorators = [(0, common_1.Post)('pay')];
            _payProfessionalCommissions_decorators = [(0, common_1.Post)('pay-professional')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSummary_decorators, { kind: "method", name: "getSummary", static: false, private: false, access: { has: obj => "getSummary" in obj, get: obj => obj.getSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSummaryByProfessional_decorators, { kind: "method", name: "getSummaryByProfessional", static: false, private: false, access: { has: obj => "getSummaryByProfessional" in obj, get: obj => obj.getSummaryByProfessional }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _payCommissions_decorators, { kind: "method", name: "payCommissions", static: false, private: false, access: { has: obj => "payCommissions" in obj, get: obj => obj.payCommissions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _payProfessionalCommissions_decorators, { kind: "method", name: "payProfessionalCommissions", static: false, private: false, access: { has: obj => "payProfessionalCommissions" in obj, get: obj => obj.payProfessionalCommissions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CommissionsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        commissionsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(commissionsService) {
            this.commissionsService = commissionsService;
        }
        /**
         * GET /commissions
         * Lista comissoes do salao com filtros
         */
        async findAll(user, query) {
            return this.commissionsService.findAll(user.salonId, {
                professionalId: query.professionalId,
                status: query.status,
                startDate: query.startDate,
                endDate: query.endDate,
            });
        }
        /**
         * GET /commissions/summary
         * Resumo geral das comissoes
         */
        async getSummary(user) {
            return this.commissionsService.getSummary(user.salonId);
        }
        /**
         * GET /commissions/by-professional
         * Resumo agrupado por profissional
         */
        async getSummaryByProfessional(user) {
            return this.commissionsService.getSummaryByProfessional(user.salonId);
        }
        /**
         * GET /commissions/:id
         * Detalhes de uma comissao
         */
        async findById(user, id) {
            return this.commissionsService.findById(user.salonId, id);
        }
        /**
         * POST /commissions/pay
         * Paga comissoes selecionadas
         */
        async payCommissions(user, dto) {
            return this.commissionsService.payCommissions(user.salonId, dto.commissionIds, user.id);
        }
        /**
         * POST /commissions/pay-professional
         * Paga todas as comissoes pendentes de um profissional
         */
        async payProfessionalCommissions(user, dto) {
            return this.commissionsService.payProfessionalCommissions(user.salonId, dto.professionalId, user.id, dto.startDate, dto.endDate);
        }
    };
    return CommissionsController = _classThis;
})();
exports.CommissionsController = CommissionsController;
//# sourceMappingURL=commissions.controller.js.map
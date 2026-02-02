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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ReportsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('reports'), (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSalesReport_decorators;
    let _getServicesReport_decorators;
    let _getProductsReport_decorators;
    let _getProfessionalsReport_decorators;
    let _getClientsReport_decorators;
    let _exportReport_decorators;
    let _exportTransactions_decorators;
    let _exportInvoices_decorators;
    let _getFinancialSummary_decorators;
    var ReportsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getSalesReport_decorators = [(0, common_1.Get)('sales'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getServicesReport_decorators = [(0, common_1.Get)('services'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getProductsReport_decorators = [(0, common_1.Get)('products'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getProfessionalsReport_decorators = [(0, common_1.Get)('professionals'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getClientsReport_decorators = [(0, common_1.Get)('clients'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _exportReport_decorators = [(0, common_1.Get)('export/:type'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _exportTransactions_decorators = [(0, common_1.Get)('export-transactions'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _exportInvoices_decorators = [(0, common_1.Get)('export-invoices'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            _getFinancialSummary_decorators = [(0, common_1.Get)('financial-summary'), (0, roles_decorator_1.Roles)('OWNER', 'MANAGER')];
            __esDecorate(this, null, _getSalesReport_decorators, { kind: "method", name: "getSalesReport", static: false, private: false, access: { has: obj => "getSalesReport" in obj, get: obj => obj.getSalesReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getServicesReport_decorators, { kind: "method", name: "getServicesReport", static: false, private: false, access: { has: obj => "getServicesReport" in obj, get: obj => obj.getServicesReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProductsReport_decorators, { kind: "method", name: "getProductsReport", static: false, private: false, access: { has: obj => "getProductsReport" in obj, get: obj => obj.getProductsReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getProfessionalsReport_decorators, { kind: "method", name: "getProfessionalsReport", static: false, private: false, access: { has: obj => "getProfessionalsReport" in obj, get: obj => obj.getProfessionalsReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getClientsReport_decorators, { kind: "method", name: "getClientsReport", static: false, private: false, access: { has: obj => "getClientsReport" in obj, get: obj => obj.getClientsReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _exportReport_decorators, { kind: "method", name: "exportReport", static: false, private: false, access: { has: obj => "exportReport" in obj, get: obj => obj.exportReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _exportTransactions_decorators, { kind: "method", name: "exportTransactions", static: false, private: false, access: { has: obj => "exportTransactions" in obj, get: obj => obj.exportTransactions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _exportInvoices_decorators, { kind: "method", name: "exportInvoices", static: false, private: false, access: { has: obj => "exportInvoices" in obj, get: obj => obj.exportInvoices }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getFinancialSummary_decorators, { kind: "method", name: "getFinancialSummary", static: false, private: false, access: { has: obj => "getFinancialSummary" in obj, get: obj => obj.getFinancialSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReportsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        reportsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(reportsService) {
            this.reportsService = reportsService;
        }
        /**
         * GET /reports/sales
         * Relatorio de vendas por periodo
         */
        async getSalesReport(user, startDate, endDate, groupBy = 'day') {
            return this.reportsService.getSalesReport(user.salonId, new Date(startDate), new Date(endDate), groupBy);
        }
        /**
         * GET /reports/services
         * Relatorio de servicos
         */
        async getServicesReport(user, startDate, endDate) {
            return this.reportsService.getServicesReport(user.salonId, new Date(startDate), new Date(endDate));
        }
        /**
         * GET /reports/products
         * Relatorio de produtos
         */
        async getProductsReport(user, startDate, endDate) {
            return this.reportsService.getProductsReport(user.salonId, new Date(startDate), new Date(endDate));
        }
        /**
         * GET /reports/professionals
         * Relatorio de profissionais
         */
        async getProfessionalsReport(user, startDate, endDate) {
            return this.reportsService.getProfessionalsReport(user.salonId, new Date(startDate), new Date(endDate));
        }
        /**
         * GET /reports/clients
         * Relatorio de clientes
         */
        async getClientsReport(user, startDate, endDate) {
            return this.reportsService.getClientsReport(user.salonId, new Date(startDate), new Date(endDate));
        }
        /**
         * GET /reports/export/:type
         * Exporta relatorio em CSV
         */
        async exportReport(user, type, startDate, endDate, reply) {
            const csv = await this.reportsService.exportReport(user.salonId, type, new Date(startDate), new Date(endDate));
            const filename = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.csv`;
            return reply
                .header('Content-Type', 'text/csv; charset=utf-8')
                .header('Content-Disposition', `attachment; filename="${filename}"`)
                .send(csv);
        }
        /**
         * GET /reports/export/transactions
         * Exporta todas as transacoes como JSON ou CSV
         */
        async exportTransactions(user, startDate, endDate, format = 'json', reply) {
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            const data = await this.reportsService.exportTransactions(user.salonId, start, end, format);
            if (format === 'csv' && reply) {
                const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
                return reply
                    .header('Content-Type', 'text/csv; charset=utf-8')
                    .header('Content-Disposition', `attachment; filename="${filename}"`)
                    .send(data);
            }
            if (reply) {
                return reply.send(data);
            }
            return data;
        }
        /**
         * GET /reports/export-invoices
         * Exporta dados fiscais para contabilidade
         */
        async exportInvoices(user, startDate, endDate, format = 'json', reply) {
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            const data = await this.reportsService.exportInvoices(user.salonId, start, end, format);
            if (format === 'csv' && reply) {
                const filename = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
                return reply
                    .header('Content-Type', 'text/csv; charset=utf-8')
                    .header('Content-Disposition', `attachment; filename="${filename}"`)
                    .send(data);
            }
            if (reply) {
                return reply.send(data);
            }
            return data;
        }
        /**
         * GET /reports/financial-summary
         * Gera resumo financeiro completo para um periodo
         */
        async getFinancialSummary(user, startDate, endDate) {
            return this.reportsService.getFinancialSummary(user.salonId, new Date(startDate), new Date(endDate));
        }
    };
    return ReportsController = _classThis;
})();
exports.ReportsController = ReportsController;
//# sourceMappingURL=reports.controller.js.map
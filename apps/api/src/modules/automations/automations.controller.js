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
exports.AutomationsController = void 0;
const common_1 = require("@nestjs/common");
let AutomationsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('automations')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _runManually_decorators;
    let _checkLowStock_decorators;
    let _checkDueBills_decorators;
    let _checkInactiveClients_decorators;
    let _removeChurnRisk_decorators;
    var AutomationsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _runManually_decorators = [(0, common_1.Post)('run')];
            _checkLowStock_decorators = [(0, common_1.Post)('check-stock')];
            _checkDueBills_decorators = [(0, common_1.Post)('check-bills')];
            _checkInactiveClients_decorators = [(0, common_1.Post)('check-clients')];
            _removeChurnRisk_decorators = [(0, common_1.Post)('remove-churn/:clientId')];
            __esDecorate(this, null, _runManually_decorators, { kind: "method", name: "runManually", static: false, private: false, access: { has: obj => "runManually" in obj, get: obj => obj.runManually }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkLowStock_decorators, { kind: "method", name: "checkLowStock", static: false, private: false, access: { has: obj => "checkLowStock" in obj, get: obj => obj.checkLowStock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkDueBills_decorators, { kind: "method", name: "checkDueBills", static: false, private: false, access: { has: obj => "checkDueBills" in obj, get: obj => obj.checkDueBills }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkInactiveClients_decorators, { kind: "method", name: "checkInactiveClients", static: false, private: false, access: { has: obj => "checkInactiveClients" in obj, get: obj => obj.checkInactiveClients }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeChurnRisk_decorators, { kind: "method", name: "removeChurnRisk", static: false, private: false, access: { has: obj => "removeChurnRisk" in obj, get: obj => obj.removeChurnRisk }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AutomationsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        automationsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(automationsService) {
            this.automationsService = automationsService;
        }
        /**
         * POST /automations/run
         * Executa todas as automações manualmente (para testes)
         */
        async runManually() {
            const result = await this.automationsService.runManually();
            return {
                message: 'Automacoes executadas com sucesso',
                notifications: result,
            };
        }
        /**
         * POST /automations/check-stock
         * Verifica estoque baixo manualmente
         */
        async checkLowStock() {
            const count = await this.automationsService.checkLowStock();
            return { message: `${count} notificacoes de estoque baixo criadas` };
        }
        /**
         * POST /automations/check-bills
         * Verifica contas a vencer manualmente
         */
        async checkDueBills() {
            const count = await this.automationsService.checkDueBills();
            return { message: `${count} notificacoes de contas a vencer criadas` };
        }
        /**
         * POST /automations/check-clients
         * Verifica clientes inativos manualmente
         */
        async checkInactiveClients() {
            const count = await this.automationsService.checkInactiveClients();
            return { message: `${count} clientes marcados como risco de churn` };
        }
        /**
         * POST /automations/remove-churn/:clientId
         * Remove flag de churn risk de um cliente
         */
        async removeChurnRisk(clientId) {
            await this.automationsService.removeChurnRisk(clientId);
            return { message: 'Flag de churn risk removida' };
        }
    };
    return AutomationsController = _classThis;
})();
exports.AutomationsController = AutomationsController;
//# sourceMappingURL=automations.controller.js.map
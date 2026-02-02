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
exports.CashRegistersController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../../common/decorators");
let CashRegistersController = (() => {
    let _classDecorators = [(0, common_1.Controller)('cash-registers')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getCurrent_decorators;
    let _open_decorators;
    let _close_decorators;
    let _withdrawal_decorators;
    let _deposit_decorators;
    let _getMovements_decorators;
    let _getHistory_decorators;
    let _findById_decorators;
    var CashRegistersController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getCurrent_decorators = [(0, common_1.Get)('current'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _open_decorators = [(0, common_1.Post)('open'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _close_decorators = [(0, common_1.Post)('close'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _withdrawal_decorators = [(0, common_1.Post)(':id/withdrawal'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _deposit_decorators = [(0, common_1.Post)(':id/deposit'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _getMovements_decorators = [(0, common_1.Get)(':id/movements'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            _getHistory_decorators = [(0, common_1.Get)('history'), (0, decorators_1.Roles)('OWNER', 'MANAGER')];
            _findById_decorators = [(0, common_1.Get)(':id'), (0, decorators_1.Roles)('OWNER', 'MANAGER', 'RECEPTIONIST')];
            __esDecorate(this, null, _getCurrent_decorators, { kind: "method", name: "getCurrent", static: false, private: false, access: { has: obj => "getCurrent" in obj, get: obj => obj.getCurrent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _open_decorators, { kind: "method", name: "open", static: false, private: false, access: { has: obj => "open" in obj, get: obj => obj.open }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: obj => "close" in obj, get: obj => obj.close }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _withdrawal_decorators, { kind: "method", name: "withdrawal", static: false, private: false, access: { has: obj => "withdrawal" in obj, get: obj => obj.withdrawal }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deposit_decorators, { kind: "method", name: "deposit", static: false, private: false, access: { has: obj => "deposit" in obj, get: obj => obj.deposit }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getMovements_decorators, { kind: "method", name: "getMovements", static: false, private: false, access: { has: obj => "getMovements" in obj, get: obj => obj.getMovements }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getHistory_decorators, { kind: "method", name: "getHistory", static: false, private: false, access: { has: obj => "getHistory" in obj, get: obj => obj.getHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CashRegistersController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        cashRegistersService = __runInitializers(this, _instanceExtraInitializers);
        constructor(cashRegistersService) {
            this.cashRegistersService = cashRegistersService;
        }
        /**
         * GET /cash-registers/current
         * Retorna o caixa aberto atual ou null
         */
        async getCurrent(req) {
            return this.cashRegistersService.getCurrent(req.user.salonId);
        }
        /**
         * POST /cash-registers/open
         * Abre um novo caixa
         */
        async open(req, dto) {
            return this.cashRegistersService.open(req.user.salonId, dto, req.user);
        }
        /**
         * POST /cash-registers/close
         * Fecha o caixa atual
         */
        async close(req, dto) {
            return this.cashRegistersService.close(req.user.salonId, dto, req.user);
        }
        /**
         * POST /cash-registers/:id/withdrawal
         * Registra sangria
         */
        async withdrawal(id, req, dto) {
            return this.cashRegistersService.withdrawal(id, dto, req.user);
        }
        /**
         * POST /cash-registers/:id/deposit
         * Registra suprimento
         */
        async deposit(id, req, dto) {
            return this.cashRegistersService.deposit(id, dto, req.user);
        }
        /**
         * GET /cash-registers/:id/movements
         * Lista movimentos de um caixa
         */
        async getMovements(id) {
            return this.cashRegistersService.getMovements(id);
        }
        /**
         * GET /cash-registers/history
         * Histórico de caixas fechados
         */
        async getHistory(req) {
            return this.cashRegistersService.getHistory(req.user.salonId);
        }
        /**
         * GET /cash-registers/:id
         * Busca caixa por ID
         */
        async findById(id) {
            return this.cashRegistersService.findById(id);
        }
    };
    return CashRegistersController = _classThis;
})();
exports.CashRegistersController = CashRegistersController;
//# sourceMappingURL=cash-registers.controller.js.map
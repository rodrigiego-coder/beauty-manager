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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
let TransactionsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('transactions')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _getSummary_decorators;
    let _findByPeriod_decorators;
    let _findByType_decorators;
    let _findByClient_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _delete_decorators;
    var TransactionsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _getSummary_decorators = [(0, common_1.Get)('summary')];
            _findByPeriod_decorators = [(0, common_1.Get)('period')];
            _findByType_decorators = [(0, common_1.Get)('type/:type')];
            _findByClient_decorators = [(0, common_1.Get)('client/:clientId')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _create_decorators = [(0, common_1.Post)()];
            _update_decorators = [(0, common_1.Patch)(':id')];
            _delete_decorators = [(0, common_1.Delete)(':id')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSummary_decorators, { kind: "method", name: "getSummary", static: false, private: false, access: { has: obj => "getSummary" in obj, get: obj => obj.getSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByPeriod_decorators, { kind: "method", name: "findByPeriod", static: false, private: false, access: { has: obj => "findByPeriod" in obj, get: obj => obj.findByPeriod }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByType_decorators, { kind: "method", name: "findByType", static: false, private: false, access: { has: obj => "findByType" in obj, get: obj => obj.findByType }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByClient_decorators, { kind: "method", name: "findByClient", static: false, private: false, access: { has: obj => "findByClient" in obj, get: obj => obj.findByClient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TransactionsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        transactionsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(transactionsService) {
            this.transactionsService = transactionsService;
        }
        /**
         * GET /transactions
         * Lista todas as transações
         */
        async findAll() {
            return this.transactionsService.findAll();
        }
        /**
         * GET /transactions/summary
         * Retorna resumo financeiro
         */
        async getSummary(startDate, endDate) {
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            return this.transactionsService.getSummary(start, end);
        }
        /**
         * GET /transactions/period
         * Lista transações por período
         */
        async findByPeriod(startDate, endDate) {
            return this.transactionsService.findByPeriod(new Date(startDate), new Date(endDate));
        }
        /**
         * GET /transactions/type/:type
         * Lista transações por tipo
         */
        async findByType(type) {
            return this.transactionsService.findByType(type);
        }
        /**
         * GET /transactions/client/:clientId
         * Lista transações por cliente
         */
        async findByClient(clientId) {
            return this.transactionsService.findByClient(clientId);
        }
        /**
         * GET /transactions/:id
         * Busca transação por ID
         */
        async findById(id) {
            const transaction = await this.transactionsService.findById(id);
            if (!transaction) {
                throw new common_1.NotFoundException('Transacao nao encontrada');
            }
            return transaction;
        }
        /**
         * POST /transactions
         * Cria uma nova transação
         */
        async create(data) {
            return this.transactionsService.create(data);
        }
        /**
         * PATCH /transactions/:id
         * Atualiza uma transação
         */
        async update(id, data) {
            const transaction = await this.transactionsService.update(id, data);
            if (!transaction) {
                throw new common_1.NotFoundException('Transacao nao encontrada');
            }
            return transaction;
        }
        /**
         * DELETE /transactions/:id
         * Remove uma transação
         */
        async delete(id) {
            const deleted = await this.transactionsService.delete(id);
            if (!deleted) {
                throw new common_1.NotFoundException('Transacao nao encontrada');
            }
            return { message: 'Transacao removida com sucesso' };
        }
    };
    return TransactionsController = _classThis;
})();
exports.TransactionsController = TransactionsController;
//# sourceMappingURL=transactions.controller.js.map
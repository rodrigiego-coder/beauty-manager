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
exports.AccountsPayableController = void 0;
const common_1 = require("@nestjs/common");
let AccountsPayableController = (() => {
    let _classDecorators = [(0, common_1.Controller)('accounts-payable')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAll_decorators;
    let _findPending_decorators;
    let _findOverdue_decorators;
    let _getTotalPending_decorators;
    let _findByStatus_decorators;
    let _findById_decorators;
    let _create_decorators;
    let _update_decorators;
    let _markAsPaid_decorators;
    let _delete_decorators;
    var AccountsPayableController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _findAll_decorators = [(0, common_1.Get)()];
            _findPending_decorators = [(0, common_1.Get)('pending')];
            _findOverdue_decorators = [(0, common_1.Get)('overdue')];
            _getTotalPending_decorators = [(0, common_1.Get)('total-pending')];
            _findByStatus_decorators = [(0, common_1.Get)('status/:status')];
            _findById_decorators = [(0, common_1.Get)(':id')];
            _create_decorators = [(0, common_1.Post)()];
            _update_decorators = [(0, common_1.Patch)(':id')];
            _markAsPaid_decorators = [(0, common_1.Patch)(':id/pay')];
            _delete_decorators = [(0, common_1.Delete)(':id')];
            __esDecorate(this, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findPending_decorators, { kind: "method", name: "findPending", static: false, private: false, access: { has: obj => "findPending" in obj, get: obj => obj.findPending }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findOverdue_decorators, { kind: "method", name: "findOverdue", static: false, private: false, access: { has: obj => "findOverdue" in obj, get: obj => obj.findOverdue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTotalPending_decorators, { kind: "method", name: "getTotalPending", static: false, private: false, access: { has: obj => "getTotalPending" in obj, get: obj => obj.getTotalPending }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findByStatus_decorators, { kind: "method", name: "findByStatus", static: false, private: false, access: { has: obj => "findByStatus" in obj, get: obj => obj.findByStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markAsPaid_decorators, { kind: "method", name: "markAsPaid", static: false, private: false, access: { has: obj => "markAsPaid" in obj, get: obj => obj.markAsPaid }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AccountsPayableController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        accountsPayableService = __runInitializers(this, _instanceExtraInitializers);
        constructor(accountsPayableService) {
            this.accountsPayableService = accountsPayableService;
        }
        /**
         * GET /accounts-payable
         * Lista todas as contas a pagar
         */
        async findAll() {
            return this.accountsPayableService.findAll();
        }
        /**
         * GET /accounts-payable/pending
         * Lista contas pendentes
         */
        async findPending() {
            return this.accountsPayableService.findPending();
        }
        /**
         * GET /accounts-payable/overdue
         * Lista contas vencidas
         */
        async findOverdue() {
            return this.accountsPayableService.findOverdue();
        }
        /**
         * GET /accounts-payable/total-pending
         * Retorna o total pendente
         */
        async getTotalPending() {
            const total = await this.accountsPayableService.getTotalPending();
            return { totalPending: total };
        }
        /**
         * GET /accounts-payable/status/:status
         * Lista contas por status
         */
        async findByStatus(status) {
            return this.accountsPayableService.findByStatus(status);
        }
        /**
         * GET /accounts-payable/:id
         * Busca conta por ID
         */
        async findById(id) {
            const account = await this.accountsPayableService.findById(id);
            if (!account) {
                throw new common_1.NotFoundException('Conta nao encontrada');
            }
            return account;
        }
        /**
         * POST /accounts-payable
         * Cria uma nova conta a pagar
         */
        async create(data) {
            return this.accountsPayableService.create(data);
        }
        /**
         * PATCH /accounts-payable/:id
         * Atualiza uma conta a pagar
         */
        async update(id, data) {
            const account = await this.accountsPayableService.update(id, data);
            if (!account) {
                throw new common_1.NotFoundException('Conta nao encontrada');
            }
            return account;
        }
        /**
         * PATCH /accounts-payable/:id/pay
         * Marca uma conta como paga
         */
        async markAsPaid(id) {
            const account = await this.accountsPayableService.markAsPaid(id);
            if (!account) {
                throw new common_1.NotFoundException('Conta nao encontrada');
            }
            return account;
        }
        /**
         * DELETE /accounts-payable/:id
         * Remove uma conta a pagar
         */
        async delete(id) {
            const deleted = await this.accountsPayableService.delete(id);
            if (!deleted) {
                throw new common_1.NotFoundException('Conta nao encontrada');
            }
            return { message: 'Conta removida com sucesso' };
        }
    };
    return AccountsPayableController = _classThis;
})();
exports.AccountsPayableController = AccountsPayableController;
//# sourceMappingURL=accounts-payable.controller.js.map
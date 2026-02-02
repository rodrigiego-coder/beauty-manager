"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsPayableService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let AccountsPayableService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AccountsPayableService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AccountsPayableService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todas as contas a pagar
         */
        async findAll() {
            return this.db
                .select()
                .from(database_1.accountsPayable)
                .orderBy((0, drizzle_orm_1.desc)(database_1.accountsPayable.dueDate));
        }
        /**
         * Busca conta por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.accountsPayable)
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria uma nova conta a pagar
         */
        async create(data) {
            const result = await this.db
                .insert(database_1.accountsPayable)
                .values(data)
                .returning();
            return result[0];
        }
        /**
         * Atualiza uma conta a pagar
         */
        async update(id, data) {
            const result = await this.db
                .update(database_1.accountsPayable)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Remove uma conta a pagar
         */
        async delete(id) {
            const result = await this.db
                .delete(database_1.accountsPayable)
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.id, id))
                .returning();
            return result.length > 0;
        }
        /**
         * Marca uma conta como paga
         */
        async markAsPaid(id) {
            return this.update(id, { status: 'PAID' });
        }
        /**
         * Lista contas pendentes
         */
        async findPending() {
            return this.db
                .select()
                .from(database_1.accountsPayable)
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.status, 'PENDING'))
                .orderBy(database_1.accountsPayable.dueDate);
        }
        /**
         * Lista contas vencidas (atualiza status para OVERDUE se necessário)
         */
        async findOverdue() {
            const today = new Date().toISOString().split('T')[0];
            // Primeiro atualiza status das vencidas
            await this.db
                .update(database_1.accountsPayable)
                .set({ status: 'OVERDUE', updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.accountsPayable.status, 'PENDING'), (0, drizzle_orm_1.lte)(database_1.accountsPayable.dueDate, today)));
            // Retorna todas as vencidas
            return this.db
                .select()
                .from(database_1.accountsPayable)
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.status, 'OVERDUE'))
                .orderBy(database_1.accountsPayable.dueDate);
        }
        /**
         * Lista contas por status
         */
        async findByStatus(status) {
            return this.db
                .select()
                .from(database_1.accountsPayable)
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.status, status))
                .orderBy(database_1.accountsPayable.dueDate);
        }
        /**
         * Calcula total pendente
         */
        async getTotalPending() {
            const pending = await this.findPending();
            return pending.reduce((sum, account) => sum + parseFloat(account.amount), 0);
        }
    };
    return AccountsPayableService = _classThis;
})();
exports.AccountsPayableService = AccountsPayableService;
//# sourceMappingURL=accounts-payable.service.js.map
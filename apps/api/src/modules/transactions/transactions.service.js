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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let TransactionsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TransactionsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TransactionsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todas as transações
         */
        async findAll() {
            return this.db
                .select()
                .from(database_1.transactions)
                .orderBy((0, drizzle_orm_1.desc)(database_1.transactions.date));
        }
        /**
         * Busca transação por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.transactions)
                .where((0, drizzle_orm_1.eq)(database_1.transactions.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria uma nova transação
         */
        async create(data) {
            const result = await this.db
                .insert(database_1.transactions)
                .values(data)
                .returning();
            return result[0];
        }
        /**
         * Atualiza uma transação
         */
        async update(id, data) {
            const result = await this.db
                .update(database_1.transactions)
                .set(data)
                .where((0, drizzle_orm_1.eq)(database_1.transactions.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Remove uma transação
         */
        async delete(id) {
            const result = await this.db
                .delete(database_1.transactions)
                .where((0, drizzle_orm_1.eq)(database_1.transactions.id, id))
                .returning();
            return result.length > 0;
        }
        /**
         * Lista transações por período
         */
        async findByPeriod(startDate, endDate) {
            return this.db
                .select()
                .from(database_1.transactions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(database_1.transactions.date, startDate), (0, drizzle_orm_1.lte)(database_1.transactions.date, endDate)))
                .orderBy((0, drizzle_orm_1.desc)(database_1.transactions.date));
        }
        /**
         * Lista transações por tipo (INCOME ou EXPENSE)
         */
        async findByType(type) {
            return this.db
                .select()
                .from(database_1.transactions)
                .where((0, drizzle_orm_1.eq)(database_1.transactions.type, type))
                .orderBy((0, drizzle_orm_1.desc)(database_1.transactions.date));
        }
        /**
         * Calcula o resumo financeiro de um período
         */
        async getSummary(startDate, endDate) {
            let query = this.db.select().from(database_1.transactions);
            if (startDate && endDate) {
                const filtered = await this.db
                    .select()
                    .from(database_1.transactions)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(database_1.transactions.date, startDate), (0, drizzle_orm_1.lte)(database_1.transactions.date, endDate)));
                return this.calculateSummary(filtered);
            }
            const all = await query;
            return this.calculateSummary(all);
        }
        calculateSummary(txs) {
            let totalIncome = 0;
            let totalExpense = 0;
            for (const tx of txs) {
                const amount = parseFloat(tx.amount);
                if (tx.type === 'INCOME') {
                    totalIncome += amount;
                }
                else {
                    totalExpense += amount;
                }
            }
            return {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                transactionCount: txs.length,
            };
        }
        /**
         * Lista transações por cliente
         */
        async findByClient(clientId) {
            return this.db
                .select()
                .from(database_1.transactions)
                .where((0, drizzle_orm_1.eq)(database_1.transactions.clientId, clientId))
                .orderBy((0, drizzle_orm_1.desc)(database_1.transactions.date));
        }
        /**
         * Lista transações por agendamento
         */
        async findByAppointment(appointmentId) {
            return this.db
                .select()
                .from(database_1.transactions)
                .where((0, drizzle_orm_1.eq)(database_1.transactions.appointmentId, appointmentId))
                .orderBy((0, drizzle_orm_1.desc)(database_1.transactions.date));
        }
    };
    return TransactionsService = _classThis;
})();
exports.TransactionsService = TransactionsService;
//# sourceMappingURL=transactions.service.js.map
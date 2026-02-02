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
exports.CashRegistersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let CashRegistersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CashRegistersService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CashRegistersService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Busca caixa aberto atual do salão
         */
        async getCurrent(salonId) {
            const result = await this.db
                .select()
                .from(database_1.cashRegisters)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.cashRegisters.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.cashRegisters.status, 'OPEN')))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Abre um novo caixa
         */
        async open(salonId, data, currentUser) {
            // Verifica se já existe caixa aberto
            const existingOpen = await this.getCurrent(salonId);
            if (existingOpen) {
                throw new common_1.BadRequestException('Ja existe um caixa aberto. Feche o caixa atual antes de abrir um novo.');
            }
            const [cashRegister] = await this.db
                .insert(database_1.cashRegisters)
                .values({
                salonId,
                openingBalance: data.openingBalance.toString(),
                openedById: currentUser.id,
                status: 'OPEN',
            })
                .returning();
            return cashRegister;
        }
        /**
         * Fecha o caixa atual
         */
        async close(salonId, data, currentUser) {
            const cashRegister = await this.getCurrent(salonId);
            if (!cashRegister) {
                throw new common_1.BadRequestException('Nao existe caixa aberto para fechar.');
            }
            // Calcula saldo esperado
            const openingBalance = parseFloat(cashRegister.openingBalance);
            const totalCash = parseFloat(cashRegister.totalCash || '0');
            const totalDeposits = parseFloat(cashRegister.totalDeposits || '0');
            const totalWithdrawals = parseFloat(cashRegister.totalWithdrawals || '0');
            // Saldo esperado = abertura + vendas em dinheiro + suprimentos - sangrias
            const expectedBalance = openingBalance + totalCash + totalDeposits - totalWithdrawals;
            const difference = data.closingBalance - expectedBalance;
            const [closedRegister] = await this.db
                .update(database_1.cashRegisters)
                .set({
                status: 'CLOSED',
                closingBalance: data.closingBalance.toString(),
                expectedBalance: expectedBalance.toString(),
                difference: difference.toString(),
                closedAt: new Date(),
                closedById: currentUser.id,
                notes: data.notes || null,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.cashRegisters.id, cashRegister.id))
                .returning();
            return closedRegister;
        }
        /**
         * Registra sangria (retirada)
         */
        async withdrawal(cashRegisterId, data, currentUser) {
            const cashRegister = await this.findById(cashRegisterId);
            if (!cashRegister) {
                throw new common_1.NotFoundException('Caixa nao encontrado');
            }
            if (cashRegister.status !== 'OPEN') {
                throw new common_1.BadRequestException('Caixa ja esta fechado');
            }
            // Cria movimento
            const [movement] = await this.db
                .insert(database_1.cashMovements)
                .values({
                cashRegisterId,
                type: 'WITHDRAWAL',
                amount: data.amount.toString(),
                reason: data.reason,
                performedById: currentUser.id,
            })
                .returning();
            // Atualiza total de sangrias
            const currentWithdrawals = parseFloat(cashRegister.totalWithdrawals || '0');
            await this.db
                .update(database_1.cashRegisters)
                .set({
                totalWithdrawals: (currentWithdrawals + data.amount).toString(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.cashRegisters.id, cashRegisterId));
            return movement;
        }
        /**
         * Registra suprimento (entrada)
         */
        async deposit(cashRegisterId, data, currentUser) {
            const cashRegister = await this.findById(cashRegisterId);
            if (!cashRegister) {
                throw new common_1.NotFoundException('Caixa nao encontrado');
            }
            if (cashRegister.status !== 'OPEN') {
                throw new common_1.BadRequestException('Caixa ja esta fechado');
            }
            // Cria movimento
            const [movement] = await this.db
                .insert(database_1.cashMovements)
                .values({
                cashRegisterId,
                type: 'DEPOSIT',
                amount: data.amount.toString(),
                reason: data.reason,
                performedById: currentUser.id,
            })
                .returning();
            // Atualiza total de suprimentos
            const currentDeposits = parseFloat(cashRegister.totalDeposits || '0');
            await this.db
                .update(database_1.cashRegisters)
                .set({
                totalDeposits: (currentDeposits + data.amount).toString(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.cashRegisters.id, cashRegisterId));
            return movement;
        }
        /**
         * Lista movimentos de um caixa
         */
        async getMovements(cashRegisterId) {
            return this.db
                .select()
                .from(database_1.cashMovements)
                .where((0, drizzle_orm_1.eq)(database_1.cashMovements.cashRegisterId, cashRegisterId))
                .orderBy((0, drizzle_orm_1.desc)(database_1.cashMovements.performedAt));
        }
        /**
         * Histórico de caixas fechados
         */
        async getHistory(salonId, limit = 30) {
            return this.db
                .select()
                .from(database_1.cashRegisters)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.cashRegisters.salonId, salonId), (0, drizzle_orm_1.eq)(database_1.cashRegisters.status, 'CLOSED')))
                .orderBy((0, drizzle_orm_1.desc)(database_1.cashRegisters.closedAt))
                .limit(limit);
        }
        /**
         * Busca caixa por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.cashRegisters)
                .where((0, drizzle_orm_1.eq)(database_1.cashRegisters.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Atualiza totais do caixa ao receber pagamento
         * Chamado pelo CommandsService ao fechar comanda
         */
        async addSale(salonId, paymentMethod, amount) {
            const cashRegister = await this.getCurrent(salonId);
            if (!cashRegister) {
                // Se não tem caixa aberto, apenas ignora (permite fechar comanda sem caixa)
                return;
            }
            const currentSales = parseFloat(cashRegister.totalSales || '0');
            const currentCash = parseFloat(cashRegister.totalCash || '0');
            const currentCard = parseFloat(cashRegister.totalCard || '0');
            const currentPix = parseFloat(cashRegister.totalPix || '0');
            const updates = {
                totalSales: (currentSales + amount).toString(),
                updatedAt: new Date().toISOString(),
            };
            // Atualiza totais por método de pagamento
            if (paymentMethod === 'CASH') {
                updates.totalCash = (currentCash + amount).toString();
            }
            else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CARD_CREDIT' || paymentMethod === 'CARD_DEBIT') {
                updates.totalCard = (currentCard + amount).toString();
            }
            else if (paymentMethod === 'PIX') {
                updates.totalPix = (currentPix + amount).toString();
            }
            await this.db
                .update(database_1.cashRegisters)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(database_1.cashRegisters.id, cashRegister.id));
        }
    };
    return CashRegistersService = _classThis;
})();
exports.CashRegistersService = CashRegistersService;
//# sourceMappingURL=cash-registers.service.js.map
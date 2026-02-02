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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let NotificationsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Lista todas as notificações
         */
        async findAll() {
            return this.db
                .select()
                .from(database_1.notifications)
                .orderBy((0, drizzle_orm_1.desc)(database_1.notifications.createdAt));
        }
        /**
         * Lista notificações não lidas
         */
        async findUnread() {
            return this.db
                .select()
                .from(database_1.notifications)
                .where((0, drizzle_orm_1.eq)(database_1.notifications.read, false))
                .orderBy((0, drizzle_orm_1.desc)(database_1.notifications.createdAt));
        }
        /**
         * Conta notificações não lidas
         */
        async countUnread() {
            const unread = await this.findUnread();
            return unread.length;
        }
        /**
         * Busca notificação por ID
         */
        async findById(id) {
            const result = await this.db
                .select()
                .from(database_1.notifications)
                .where((0, drizzle_orm_1.eq)(database_1.notifications.id, id))
                .limit(1);
            return result[0] || null;
        }
        /**
         * Cria uma nova notificação
         */
        async create(data) {
            const result = await this.db
                .insert(database_1.notifications)
                .values(data)
                .returning();
            return result[0];
        }
        /**
         * Marca notificação como lida
         */
        async markAsRead(id) {
            const result = await this.db
                .update(database_1.notifications)
                .set({ read: true })
                .where((0, drizzle_orm_1.eq)(database_1.notifications.id, id))
                .returning();
            return result[0] || null;
        }
        /**
         * Marca todas como lidas
         */
        async markAllAsRead() {
            const result = await this.db
                .update(database_1.notifications)
                .set({ read: true })
                .where((0, drizzle_orm_1.eq)(database_1.notifications.read, false))
                .returning();
            return result.length;
        }
        /**
         * Remove notificação
         */
        async delete(id) {
            const result = await this.db
                .delete(database_1.notifications)
                .where((0, drizzle_orm_1.eq)(database_1.notifications.id, id))
                .returning();
            return result.length > 0;
        }
        /**
         * Remove notificações antigas (mais de 30 dias)
         */
        async cleanOld() {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const all = await this.findAll();
            const oldNotifications = all.filter(n => new Date(n.createdAt) < thirtyDaysAgo);
            for (const notification of oldNotifications) {
                await this.delete(notification.id);
            }
            return oldNotifications.length;
        }
        /**
         * Cria notificação de estoque baixo
         */
        async createStockLowNotification(productId, productName, currentStock, minStock) {
            return this.create({
                type: 'STOCK_LOW',
                title: 'Estoque Baixo',
                message: `O produto "${productName}" está com estoque baixo: ${currentStock} unidades (mínimo: ${minStock})`,
                referenceId: productId.toString(),
                referenceType: 'product',
            });
        }
        /**
         * Cria notificação de cliente inativo
         */
        async createClientInactiveNotification(clientId, clientName, daysSinceLastVisit) {
            return this.create({
                type: 'CLIENT_INACTIVE',
                title: 'Cliente Inativo',
                message: `O cliente "${clientName || 'Sem nome'}" não visita o salão há ${daysSinceLastVisit} dias`,
                referenceId: clientId,
                referenceType: 'client',
            });
        }
        /**
         * Cria notificação de conta a pagar vencendo
         */
        async createBillDueNotification(billId, supplierName, amount, dueDate) {
            return this.create({
                type: 'BILL_DUE',
                title: 'Conta a Vencer',
                message: `Conta de "${supplierName}" no valor de R$ ${amount} vence em ${dueDate}`,
                referenceId: billId.toString(),
                referenceType: 'bill',
            });
        }
        /**
         * Cria notificação de risco de churn
         */
        async createChurnRiskNotification(clientId, clientName) {
            return this.create({
                type: 'CHURN_RISK',
                title: 'Risco de Perda de Cliente',
                message: `O cliente "${clientName || 'Sem nome'}" foi marcado como risco de churn. Considere entrar em contato.`,
                referenceId: clientId,
                referenceType: 'client',
            });
        }
    };
    return NotificationsService = _classThis;
})();
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.service.js.map
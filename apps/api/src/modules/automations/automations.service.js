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
exports.AutomationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const is_jest_1 = require("../../common/is-jest");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../database");
let AutomationsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _runDailyAutomations_decorators;
    var AutomationsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _runDailyAutomations_decorators = [(0, schedule_1.Cron)('0 8 * * *', { disabled: is_jest_1.IS_JEST })];
            __esDecorate(this, null, _runDailyAutomations_decorators, { kind: "method", name: "runDailyAutomations", static: false, private: false, access: { has: obj => "runDailyAutomations" in obj, get: obj => obj.runDailyAutomations }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AutomationsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db = __runInitializers(this, _instanceExtraInitializers);
        notificationsService;
        logger = new common_1.Logger(AutomationsService.name);
        constructor(db, notificationsService) {
            this.db = db;
            this.notificationsService = notificationsService;
        }
        /**
         * Cron Job: Roda todo dia às 08:00
         * - Verifica estoque baixo
         * - Verifica contas a vencer
         * - Identifica clientes inativos (churn risk)
         */
        async runDailyAutomations() {
            this.logger.log('Iniciando automacoes diarias...');
            try {
                await this.checkLowStock();
                await this.checkDueBills();
                await this.checkInactiveClients();
                this.logger.log('Automacoes diarias concluidas com sucesso');
            }
            catch (error) {
                this.logger.error('Erro nas automacoes diarias:', error);
            }
        }
        /**
         * Verifica produtos com estoque baixo
         */
        async checkLowStock() {
            this.logger.log('Verificando estoque baixo...');
            const allProducts = await this.db
                .select()
                .from(database_1.products)
                .where((0, drizzle_orm_1.eq)(database_1.products.active, true));
            // Verificar ambos os estoques (retail e internal)
            const lowStockProducts = allProducts.filter(p => {
                const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                return retailLow || internalLow;
            });
            let notificationsCreated = 0;
            for (const product of lowStockProducts) {
                // Determinar qual estoque está baixo para a notificação
                const retailLow = product.isRetail && product.stockRetail <= product.minStockRetail;
                const internalLow = product.isBackbar && product.stockInternal <= product.minStockInternal;
                if (retailLow) {
                    await this.notificationsService.createStockLowNotification(product.id, `${product.name} (Retail)`, product.stockRetail, product.minStockRetail);
                    notificationsCreated++;
                }
                if (internalLow) {
                    await this.notificationsService.createStockLowNotification(product.id, `${product.name} (Internal)`, product.stockInternal, product.minStockInternal);
                    notificationsCreated++;
                }
            }
            this.logger.log(`${notificationsCreated} notificacoes de estoque baixo criadas`);
            return notificationsCreated;
        }
        /**
         * Verifica contas a pagar vencendo nos próximos 3 dias
         */
        async checkDueBills() {
            this.logger.log('Verificando contas a vencer...');
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];
            const pendingBills = await this.db
                .select()
                .from(database_1.accountsPayable)
                .where((0, drizzle_orm_1.eq)(database_1.accountsPayable.status, 'PENDING'));
            const dueBills = pendingBills.filter(bill => bill.dueDate <= threeDaysStr);
            let notificationsCreated = 0;
            for (const bill of dueBills) {
                await this.notificationsService.createBillDueNotification(bill.id, bill.supplierName, bill.amount, bill.dueDate);
                notificationsCreated++;
            }
            this.logger.log(`${notificationsCreated} notificacoes de contas a vencer criadas`);
            return notificationsCreated;
        }
        /**
         * Identifica clientes sem visita há mais de 60 dias e marca como churn risk
         */
        async checkInactiveClients() {
            this.logger.log('Verificando clientes inativos...');
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const sixtyDaysStr = sixtyDaysAgo.toISOString().split('T')[0];
            // Busca todos os clientes
            const allClients = await this.db.select().from(database_1.clients);
            // Busca todos os agendamentos
            const allAppointments = await this.db.select().from(database_1.appointments);
            let churnRiskCount = 0;
            for (const client of allClients) {
                // Busca o último agendamento do cliente
                const clientAppointments = allAppointments
                    .filter(apt => apt.clientId === client.id && apt.status === 'CONFIRMED')
                    .sort((a, b) => b.date.localeCompare(a.date));
                const lastAppointment = clientAppointments[0];
                if (!lastAppointment) {
                    // Cliente nunca agendou - verifica se foi criado há mais de 60 dias
                    const createdAt = new Date(client.createdAt).toISOString().split('T')[0];
                    if (createdAt < sixtyDaysStr && !client.churnRisk) {
                        await this.markAsChurnRisk(client.id, client.name, 60);
                        churnRiskCount++;
                    }
                    continue;
                }
                const lastVisitDate = lastAppointment.date;
                // Atualiza lastVisitDate do cliente
                await this.db
                    .update(database_1.clients)
                    .set({ lastVisitDate, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(database_1.clients.id, client.id));
                // Verifica se a última visita foi há mais de 60 dias
                if (lastVisitDate < sixtyDaysStr && !client.churnRisk) {
                    const daysSinceVisit = Math.floor((new Date().getTime() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
                    await this.markAsChurnRisk(client.id, client.name, daysSinceVisit);
                    churnRiskCount++;
                }
            }
            this.logger.log(`${churnRiskCount} clientes marcados como risco de churn`);
            return churnRiskCount;
        }
        /**
         * Marca cliente como risco de churn e cria notificação
         */
        async markAsChurnRisk(clientId, clientName, daysSinceVisit) {
            // Marca o cliente como churn risk
            await this.db
                .update(database_1.clients)
                .set({ churnRisk: true, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(database_1.clients.id, clientId));
            // Cria notificação de cliente inativo
            await this.notificationsService.createClientInactiveNotification(clientId, clientName || 'Sem nome', daysSinceVisit);
            // Cria notificação de churn risk
            await this.notificationsService.createChurnRiskNotification(clientId, clientName || 'Sem nome');
        }
        /**
         * Endpoint para rodar automações manualmente (para testes)
         */
        async runManually() {
            const lowStock = await this.checkLowStock();
            const dueBills = await this.checkDueBills();
            const churnRisk = await this.checkInactiveClients();
            return { lowStock, dueBills, churnRisk };
        }
        /**
         * Remove flag de churn risk de um cliente (quando ele volta)
         */
        async removeChurnRisk(clientId) {
            await this.db
                .update(database_1.clients)
                .set({ churnRisk: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(database_1.clients.id, clientId));
        }
    };
    return AutomationsService = _classThis;
})();
exports.AutomationsService = AutomationsService;
//# sourceMappingURL=automations.service.js.map
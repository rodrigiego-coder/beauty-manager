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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../database/schema");
let DashboardService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DashboardService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DashboardService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        async getStats(salonId, period = 'today') {
            const { startDate, endDate, previousStartDate, previousEndDate } = this.getPeriodDates(period);
            // Buscar todas as estatisticas em paralelo
            const [revenueData, previousRevenueData, commandsData, clientsData, topServicesData, topProductsData, lowStockData, cashRegisterData, todaySalesData,] = await Promise.all([
                this.getRevenueData(salonId, startDate, endDate),
                this.getRevenueData(salonId, previousStartDate, previousEndDate),
                this.getCommandsData(salonId, startDate, endDate),
                this.getClientsData(salonId, startDate, endDate),
                this.getTopServices(salonId, startDate, endDate),
                this.getTopProducts(salonId, startDate, endDate),
                this.getLowStockProducts(salonId),
                this.getCashRegisterStatus(salonId),
                this.getTodaySales(salonId),
            ]);
            // Calcular crescimento
            const revenueGrowth = previousRevenueData.totalRevenue > 0
                ? ((revenueData.totalRevenue - previousRevenueData.totalRevenue) / previousRevenueData.totalRevenue) * 100
                : revenueData.totalRevenue > 0 ? 100 : 0;
            // Calcular ticket medio
            const closedCommands = commandsData.commandsByStatus.closed;
            const averageTicket = closedCommands > 0
                ? revenueData.totalRevenue / closedCommands
                : 0;
            return {
                // Faturamento
                totalRevenue: revenueData.totalRevenue,
                previousRevenue: previousRevenueData.totalRevenue,
                revenueGrowth,
                revenueByPaymentMethod: revenueData.byPaymentMethod,
                todaySales: todaySalesData,
                // Comandas
                totalCommands: commandsData.total,
                openCommands: commandsData.openCommands, // Total de comandas abertas (independente do período)
                averageTicket,
                commandsByStatus: commandsData.commandsByStatus,
                // Clientes
                totalClients: clientsData.total,
                newClients: clientsData.newClients,
                returningClients: clientsData.returningClients,
                // Servicos e Produtos
                topServices: topServicesData,
                topProducts: topProductsData,
                lowStockProducts: lowStockData,
                // Caixa
                cashRegister: cashRegisterData,
                // Periodo
                period,
                periodStart: startDate.toISOString(),
                periodEnd: endDate.toISOString(),
            };
        }
        getPeriodDates(period) {
            const now = new Date();
            let startDate;
            let endDate;
            let previousStartDate;
            let previousEndDate;
            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    previousStartDate = new Date(startDate);
                    previousStartDate.setDate(previousStartDate.getDate() - 1);
                    previousEndDate = new Date(previousStartDate);
                    previousEndDate.setHours(23, 59, 59);
                    break;
                case 'week':
                    const dayOfWeek = now.getDay();
                    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    previousStartDate = new Date(startDate);
                    previousStartDate.setDate(previousStartDate.getDate() - 7);
                    previousEndDate = new Date(startDate);
                    previousEndDate.setDate(previousEndDate.getDate() - 1);
                    previousEndDate.setHours(23, 59, 59);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
                    previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    previousStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
                    previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
                    break;
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    previousStartDate = new Date(startDate);
                    previousStartDate.setDate(previousStartDate.getDate() - 1);
                    previousEndDate = new Date(previousStartDate);
                    previousEndDate.setHours(23, 59, 59);
            }
            return { startDate, endDate, previousStartDate, previousEndDate };
        }
        async getRevenueData(salonId, startDate, endDate) {
            // Buscar comandas fechadas no periodo
            const closedCommands = await this.db
                .select()
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)));
            const totalRevenue = closedCommands.reduce((sum, cmd) => sum + parseFloat(cmd.totalNet || '0'), 0);
            // Buscar pagamentos das comandas fechadas no periodo
            const commandIds = closedCommands.map(cmd => cmd.id);
            let payments = [];
            if (commandIds.length > 0) {
                payments = await this.db
                    .select({
                    method: schema_1.commandPayments.method,
                    amount: schema_1.commandPayments.amount,
                })
                    .from(schema_1.commandPayments)
                    .where((0, drizzle_orm_1.sql) `${schema_1.commandPayments.commandId} IN ${commandIds.length > 0 ? (0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(commandIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})` : (0, drizzle_orm_1.sql) `(NULL)`}`);
            }
            // Agrupar por metodo de pagamento
            const byPaymentMethod = {
                cash: 0,
                creditCard: 0,
                debitCard: 0,
                pix: 0,
                other: 0,
            };
            payments.forEach(p => {
                const amount = parseFloat(p.amount);
                switch (p.method) {
                    case 'CASH':
                        byPaymentMethod.cash += amount;
                        break;
                    case 'CREDIT_CARD':
                    case 'CARD_CREDIT':
                        byPaymentMethod.creditCard += amount;
                        break;
                    case 'DEBIT_CARD':
                    case 'CARD_DEBIT':
                        byPaymentMethod.debitCard += amount;
                        break;
                    case 'PIX':
                        byPaymentMethod.pix += amount;
                        break;
                    default:
                        byPaymentMethod.other += amount;
                }
            });
            return { totalRevenue, byPaymentMethod };
        }
        async getCommandsData(salonId, startDate, endDate) {
            // Buscar todas as comandas criadas no periodo
            const allCommands = await this.db
                .select()
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.gte)(schema_1.commands.openedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.openedAt, endDate)));
            // Comandas abertas (independente do periodo)
            const openCommandsList = await this.db
                .select()
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.sql) `${schema_1.commands.status} IN ('OPEN', 'IN_SERVICE', 'WAITING_PAYMENT')`));
            const commandsByStatus = {
                open: 0,
                inService: 0,
                waitingPayment: 0,
                closed: 0,
                canceled: 0,
            };
            allCommands.forEach(cmd => {
                switch (cmd.status) {
                    case 'OPEN':
                        commandsByStatus.open++;
                        break;
                    case 'IN_SERVICE':
                        commandsByStatus.inService++;
                        break;
                    case 'WAITING_PAYMENT':
                        commandsByStatus.waitingPayment++;
                        break;
                    case 'CLOSED':
                        commandsByStatus.closed++;
                        break;
                    case 'CANCELED':
                        commandsByStatus.canceled++;
                        break;
                }
            });
            return {
                total: allCommands.length,
                openCommands: openCommandsList.length,
                commandsByStatus,
            };
        }
        async getClientsData(salonId, startDate, endDate) {
            // Total de clientes ativos
            const allClients = await this.db
                .select()
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.clients.active, true)));
            // Clientes novos no periodo
            const newClientsList = allClients.filter(c => {
                const createdAt = new Date(c.createdAt);
                return createdAt >= startDate && createdAt <= endDate;
            });
            // Clientes com mais de 1 visita
            const returningClientsList = allClients.filter(c => c.totalVisits > 1);
            return {
                total: allClients.length,
                newClients: newClientsList.length,
                returningClients: returningClientsList.length,
            };
        }
        async getTopServices(salonId, startDate, endDate) {
            // Buscar comandas fechadas no periodo
            const closedCommands = await this.db
                .select({ id: schema_1.commands.id })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)));
            if (closedCommands.length === 0) {
                return [];
            }
            const commandIds = closedCommands.map(c => c.id);
            // Buscar itens do tipo SERVICE dessas comandas
            const serviceItems = await this.db
                .select({
                description: schema_1.commandItems.description,
                quantity: schema_1.commandItems.quantity,
                totalPrice: schema_1.commandItems.totalPrice,
            })
                .from(schema_1.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.commandItems.commandId} IN ${(0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(commandIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`}`, (0, drizzle_orm_1.eq)(schema_1.commandItems.type, 'SERVICE'), (0, drizzle_orm_1.sql) `${schema_1.commandItems.canceledAt} IS NULL`));
            // Agrupar por nome do servico
            const serviceMap = new Map();
            serviceItems.forEach(item => {
                const name = item.description;
                const qty = parseFloat(item.quantity || '1');
                const rev = parseFloat(item.totalPrice || '0');
                if (serviceMap.has(name)) {
                    const current = serviceMap.get(name);
                    current.quantity += qty;
                    current.revenue += rev;
                }
                else {
                    serviceMap.set(name, { quantity: qty, revenue: rev });
                }
            });
            // Converter para array e ordenar por quantidade
            return Array.from(serviceMap.entries())
                .map(([name, data]) => ({
                name,
                quantity: Math.round(data.quantity),
                revenue: data.revenue,
            }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
        }
        async getTopProducts(salonId, startDate, endDate) {
            // Buscar comandas fechadas no periodo
            const closedCommands = await this.db
                .select({ id: schema_1.commands.id })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)));
            if (closedCommands.length === 0) {
                return [];
            }
            const commandIds = closedCommands.map(c => c.id);
            // Buscar itens do tipo PRODUCT dessas comandas
            const productItems = await this.db
                .select({
                description: schema_1.commandItems.description,
                quantity: schema_1.commandItems.quantity,
                totalPrice: schema_1.commandItems.totalPrice,
            })
                .from(schema_1.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.commandItems.commandId} IN ${(0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(commandIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`}`, (0, drizzle_orm_1.eq)(schema_1.commandItems.type, 'PRODUCT'), (0, drizzle_orm_1.sql) `${schema_1.commandItems.canceledAt} IS NULL`));
            // Agrupar por nome do produto
            const productMap = new Map();
            productItems.forEach(item => {
                const name = item.description;
                const qty = parseFloat(item.quantity || '1');
                const rev = parseFloat(item.totalPrice || '0');
                if (productMap.has(name)) {
                    const current = productMap.get(name);
                    current.quantity += qty;
                    current.revenue += rev;
                }
                else {
                    productMap.set(name, { quantity: qty, revenue: rev });
                }
            });
            // Converter para array e ordenar por quantidade
            return Array.from(productMap.entries())
                .map(([name, data]) => ({
                name,
                quantity: Math.round(data.quantity),
                revenue: data.revenue,
            }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
        }
        async getLowStockProducts(salonId) {
            const allProducts = await this.db
                .select()
                .from(schema_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true)));
            // Filtrar produtos com estoque baixo (retail ou internal)
            return allProducts
                .filter(p => {
                const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                return retailLow || internalLow;
            })
                .map(p => ({
                id: p.id,
                name: p.name,
                currentStock: p.stockRetail + p.stockInternal,
                minStock: p.minStockRetail + p.minStockInternal,
            }))
                .sort((a, b) => a.currentStock - b.currentStock);
        }
        async getCashRegisterStatus(salonId) {
            // Buscar caixa aberto
            const openCashRegister = await this.db
                .select()
                .from(schema_1.cashRegisters)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cashRegisters.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.cashRegisters.status, 'OPEN')))
                .limit(1);
            if (openCashRegister.length === 0) {
                return { isOpen: false };
            }
            const register = openCashRegister[0];
            const openingBalance = parseFloat(register.openingBalance || '0');
            const totalSales = parseFloat(register.totalSales || '0');
            const totalCash = parseFloat(register.totalCash || '0');
            const totalCard = parseFloat(register.totalCard || '0');
            const totalPix = parseFloat(register.totalPix || '0');
            const totalWithdrawals = parseFloat(register.totalWithdrawals || '0');
            const totalDeposits = parseFloat(register.totalDeposits || '0');
            const expectedBalance = openingBalance + totalCash + totalDeposits - totalWithdrawals;
            return {
                isOpen: true,
                id: register.id,
                openedAt: register.openedAt,
                openingBalance,
                totalSales,
                totalCash,
                totalCard,
                totalPix,
                expectedBalance,
            };
        }
        async getTodaySales(salonId) {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
            const todayCommands = await this.db
                .select()
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startOfDay), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endOfDay)));
            return todayCommands.reduce((sum, cmd) => sum + parseFloat(cmd.totalNet || '0'), 0);
        }
        /**
         * =====================================================
         * DASHBOARD DO PROFISSIONAL
         * CRÍTICO: Sempre filtra por professionalId para isolamento
         * =====================================================
         */
        async getProfessionalDashboard(salonId, professionalId) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayStr = today.toISOString().split('T')[0];
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - 7);
            const weekStartStr = weekStart.toISOString().split('T')[0];
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            // Buscar dados do profissional (nome e taxa de comissão)
            const [professional] = await this.db
                .select({
                name: schema_1.users.name,
                commissionRate: schema_1.users.commissionRate,
            })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, professionalId))
                .limit(1);
            const commissionRate = parseFloat(professional?.commissionRate || '0.50');
            // CRÍTICO: Todos os queries filtram por professionalId
            const [todayAppts, weekAppts, monthAppts, upcomingAppts, monthRevenue,] = await Promise.all([
                // Agendamentos de hoje
                this.db
                    .select()
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, todayStr))),
                // Agendamentos da semana
                this.db
                    .select()
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, professionalId), (0, drizzle_orm_1.gte)(schema_1.appointments.date, weekStartStr), (0, drizzle_orm_1.lte)(schema_1.appointments.date, todayStr))),
                // Agendamentos do mês (para performance)
                this.db
                    .select()
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, professionalId), (0, drizzle_orm_1.gte)(schema_1.appointments.date, monthStart.toISOString().split('T')[0]), (0, drizzle_orm_1.lte)(schema_1.appointments.date, monthEnd.toISOString().split('T')[0]))),
                // Próximos agendamentos (hoje e futuros)
                this.db
                    .select()
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, professionalId), (0, drizzle_orm_1.gte)(schema_1.appointments.date, todayStr), (0, drizzle_orm_1.sql) `${schema_1.appointments.status} NOT IN ('CANCELLED', 'NO_SHOW')`))
                    .orderBy(schema_1.appointments.date, schema_1.appointments.time)
                    .limit(10),
                // Faturamento do mês (serviços executados pelo profissional)
                this.getProfessionalMonthRevenue(salonId, professionalId, monthStart, monthEnd),
            ]);
            // Calcular performance
            const completedAppts = monthAppts.filter(a => a.status === 'COMPLETED').length;
            const cancelledAppts = monthAppts.filter(a => a.status === 'CANCELLED').length;
            const noShowAppts = monthAppts.filter(a => a.status === 'NO_SHOW').length;
            const totalMonthAppts = monthAppts.length;
            const completionRate = totalMonthAppts > 0
                ? (completedAppts / totalMonthAppts) * 100
                : 0;
            // Calcular comissão pendente
            const pendingCommission = monthRevenue * commissionRate;
            return {
                todayAppointments: todayAppts.length,
                weekAppointments: weekAppts.length,
                monthRevenue,
                pendingCommission,
                commissionRate: commissionRate * 100, // Converter para percentual
                upcomingAppointments: upcomingAppts.map(a => ({
                    id: a.id,
                    clientName: a.clientName || 'Cliente não informado',
                    serviceName: a.service,
                    date: a.date,
                    time: a.time,
                    status: a.status,
                    price: parseFloat(a.price || '0'),
                })),
                performance: {
                    totalAppointments: totalMonthAppts,
                    completedAppointments: completedAppts,
                    cancelledAppointments: cancelledAppts,
                    noShowAppointments: noShowAppts,
                    completionRate: Math.round(completionRate * 10) / 10,
                },
                professionalName: professional?.name || 'Profissional',
            };
        }
        /**
         * Calcula faturamento do profissional no mês
         * Baseado em commandItems.performerId
         */
        async getProfessionalMonthRevenue(salonId, professionalId, monthStart, monthEnd) {
            // Buscar comandas fechadas no mês
            const closedCommands = await this.db
                .select({ id: schema_1.commands.id })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, monthStart), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, monthEnd)));
            if (closedCommands.length === 0) {
                return 0;
            }
            const commandIds = closedCommands.map(c => c.id);
            // Buscar itens de serviço executados pelo profissional
            const items = await this.db
                .select({
                totalPrice: schema_1.commandItems.totalPrice,
            })
                .from(schema_1.commandItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.commandItems.commandId} IN ${(0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(commandIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`}`, (0, drizzle_orm_1.eq)(schema_1.commandItems.performerId, professionalId), (0, drizzle_orm_1.eq)(schema_1.commandItems.type, 'SERVICE'), (0, drizzle_orm_1.sql) `${schema_1.commandItems.canceledAt} IS NULL`));
            return items.reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);
        }
    };
    return DashboardService = _classThis;
})();
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map
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
exports.AIDataCollectorService = void 0;
const common_1 = require("@nestjs/common");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AIDataCollectorService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AIDataCollectorService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AIDataCollectorService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        // ==================== OWNER DATA ====================
        async collectOwnerData(salonId) {
            const now = new Date();
            const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            const [todayRevenue, weekRevenue, monthRevenue, lastMonthRevenue, totalClients, newClientsThisMonth, atRiskClients, lowStockProducts, pendingCommissions, todayAppointments, teamRanking, bestSellingServices, cashRegister, monthCommandsCount,] = await Promise.all([
                this.getRevenue(salonId, startOfDay, now),
                this.getRevenue(salonId, startOfWeek, now),
                this.getRevenue(salonId, startOfMonth, now),
                this.getRevenue(salonId, startOfLastMonth, endOfLastMonth),
                this.getTotalClients(salonId),
                this.getNewClients(salonId, startOfMonth),
                this.getAtRiskClients(salonId, 30),
                this.getLowStockProducts(salonId),
                this.getPendingCommissions(salonId),
                this.getTodayAppointmentsCount(salonId, today),
                this.getTeamRanking(salonId, startOfMonth),
                this.getBestSellingServices(salonId, startOfMonth),
                this.getCurrentCashRegister(salonId),
                this.getCommandsCount(salonId, startOfMonth),
            ]);
            const revenueGrowthPercent = lastMonthRevenue > 0
                ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                : 0;
            const averageTicket = monthCommandsCount > 0 ? monthRevenue / monthCommandsCount : 0;
            return {
                todayRevenue,
                weekRevenue,
                monthRevenue,
                lastMonthRevenue,
                revenueGrowthPercent,
                averageTicket,
                totalClients,
                newClientsThisMonth,
                atRiskClients,
                lowStockProducts,
                pendingCommissions,
                todayAppointments,
                teamRanking,
                bestSellingServices,
                cashRegisterOpen: !!cashRegister,
                cashRegisterBalance: cashRegister?.balance || 0,
            };
        }
        // ==================== MANAGER DATA ====================
        async collectManagerData(salonId) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const [todayAppointments, pendingConfirmations, lowStockProducts, pendingCommissions, todayRevenue, openCommands,] = await Promise.all([
                this.getTodayAppointmentsCount(salonId, today),
                this.getPendingConfirmations(salonId),
                this.getLowStockProducts(salonId),
                this.getPendingCommissions(salonId),
                this.getRevenue(salonId, startOfDay, now),
                this.getOpenCommandsCount(salonId),
            ]);
            return {
                todayAppointments,
                pendingConfirmations,
                lowStockProducts,
                pendingCommissions,
                todayRevenue,
                openCommands,
            };
        }
        // ==================== RECEPTIONIST DATA ====================
        async collectReceptionistData(salonId) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const [todayAppointments, pendingConfirmations, birthdayClients, openCommands,] = await Promise.all([
                this.getTodayAppointmentsList(salonId, today),
                this.getPendingConfirmations(salonId),
                this.getBirthdayClients(salonId),
                this.getOpenCommandsCount(salonId),
            ]);
            return {
                todayAppointments,
                pendingConfirmations,
                birthdayClients,
                openCommands,
            };
        }
        // ==================== STYLIST DATA ====================
        async collectStylistData(salonId, odela) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const [myTodayAppointments, myMonthRevenue, myCommission, ranking,] = await Promise.all([
                this.getStylistTodayAppointments(salonId, odela, today),
                this.getStylistMonthRevenue(salonId, odela, startOfMonth),
                this.getStylistPendingCommission(salonId, odela),
                this.getTeamRanking(salonId, startOfMonth),
            ]);
            const myRanking = ranking.findIndex((r) => r.odela === odela) + 1;
            return {
                myTodayAppointments,
                myMonthRevenue,
                myCommission,
                myRanking: myRanking || ranking.length + 1,
                totalProfessionals: ranking.length,
            };
        }
        // ==================== CLIENT INFO ====================
        async collectClientInfo(salonId, clientId) {
            const [clientResult] = await connection_1.db
                .select({
                id: schema_1.clients.id,
                name: schema_1.clients.name,
                phone: schema_1.clients.phone,
                email: schema_1.clients.email,
                lastVisitDate: schema_1.clients.lastVisitDate,
                totalVisits: schema_1.clients.totalVisits,
            })
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.id, clientId), (0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId)));
            if (!clientResult) {
                throw new Error('Cliente não encontrado');
            }
            const [hairProfile] = await connection_1.db
                .select()
                .from(schema_1.clientHairProfiles)
                .where((0, drizzle_orm_1.eq)(schema_1.clientHairProfiles.clientId, clientId));
            const purchasesResult = await connection_1.db
                .select({ total: schema_1.commands.totalNet })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.clientId, clientId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED')));
            const notesResult = await connection_1.db
                .select({ noteType: schema_1.clientNotesAi.noteType, content: schema_1.clientNotesAi.content })
                .from(schema_1.clientNotesAi)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clientNotesAi.clientId, clientId), (0, drizzle_orm_1.eq)(schema_1.clientNotesAi.salonId, salonId)));
            const totalPurchases = purchasesResult.reduce((sum, p) => sum + parseFloat(p.total || '0'), 0);
            return {
                client: {
                    id: clientResult.id,
                    name: clientResult.name || 'Sem nome',
                    phone: clientResult.phone,
                    email: clientResult.email,
                },
                hairProfile: hairProfile || null,
                lastVisit: clientResult.lastVisitDate,
                totalVisits: clientResult.totalVisits || 0,
                averageTicket: purchasesResult.length > 0 ? totalPurchases / purchasesResult.length : 0,
                preferences: notesResult.filter((n) => n.noteType === 'PREFERENCE').map((n) => n.content),
                allergies: notesResult.filter((n) => n.noteType === 'ALLERGY').map((n) => n.content),
                notes: notesResult.filter((n) => n.noteType === 'IMPORTANT').map((n) => n.content),
            };
        }
        // ==================== PRIVATE HELPER METHODS ====================
        async getRevenue(salonId, start, end) {
            const result = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commands.totalNet}), 0)` })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, start), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, end)));
            return parseFloat(result[0]?.total || '0');
        }
        async getTotalClients(salonId) {
            const result = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId));
            return result[0]?.count || 0;
        }
        async getNewClients(salonId, since) {
            const result = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.gte)(schema_1.clients.createdAt, since)));
            return result[0]?.count || 0;
        }
        async getAtRiskClients(salonId, days) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffStr = cutoffDate.toISOString().split('T')[0];
            const result = await connection_1.db
                .select({
                name: schema_1.clients.name,
                phone: schema_1.clients.phone,
                lastVisitDate: schema_1.clients.lastVisitDate,
            })
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.sql) `${schema_1.clients.lastVisitDate} < ${cutoffStr}`))
                .orderBy(schema_1.clients.lastVisitDate)
                .limit(10);
            return result.map((c) => ({
                name: c.name || 'Sem nome',
                phone: c.phone,
                lastVisitDays: c.lastVisitDate
                    ? Math.floor((Date.now() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 999,
            }));
        }
        async getLowStockProducts(salonId) {
            // Buscar todos os produtos ativos do salão
            const result = await connection_1.db
                .select()
                .from(schema_1.products)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.products.active, true)));
            // Filtrar produtos com estoque baixo (retail ou internal)
            const lowStock = result.filter(p => {
                const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
                const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
                return retailLow || internalLow;
            }).slice(0, 10);
            // Retornar formato compatível (usando retail como principal)
            return lowStock.map((p) => ({
                name: p.name,
                currentStock: p.stockRetail + p.stockInternal, // soma dos dois estoques
                minStock: p.minStockRetail + p.minStockInternal,
            }));
        }
        async getPendingCommissions(salonId) {
            const result = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commissions.commissionValue}), 0)` })
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commissions.status, 'PENDING')));
            return parseFloat(result[0]?.total || '0');
        }
        async getTodayAppointmentsCount(salonId, today) {
            const result = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, today)));
            return result[0]?.count || 0;
        }
        async getTeamRanking(salonId, since) {
            const result = await connection_1.db
                .select({
                odela: schema_1.commandItems.performerId,
                name: schema_1.users.name,
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commandItems.totalPrice}), 0)`,
            })
                .from(schema_1.commandItems)
                .innerJoin(schema_1.commands, (0, drizzle_orm_1.eq)(schema_1.commandItems.commandId, schema_1.commands.id))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.commandItems.performerId, schema_1.users.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, since)))
                .groupBy(schema_1.commandItems.performerId, schema_1.users.name)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `SUM(${schema_1.commandItems.totalPrice})`))
                .limit(10);
            return result.map((r) => ({
                name: r.name || 'Profissional',
                revenue: parseFloat(r.total || '0'),
                odela: r.odela || undefined,
            }));
        }
        async getBestSellingServices(salonId, since) {
            // Since commandItems uses description instead of serviceId, we group by description
            const result = await connection_1.db
                .select({
                name: schema_1.commandItems.description,
                qty: (0, drizzle_orm_1.sql) `COUNT(*)`,
            })
                .from(schema_1.commandItems)
                .innerJoin(schema_1.commands, (0, drizzle_orm_1.eq)(schema_1.commandItems.commandId, schema_1.commands.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.eq)(schema_1.commandItems.type, 'SERVICE'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, since)))
                .groupBy(schema_1.commandItems.description)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`))
                .limit(5);
            return result.map((r) => ({
                name: r.name,
                quantity: r.qty || 0,
            }));
        }
        async getCurrentCashRegister(salonId) {
            const [result] = await connection_1.db
                .select({
                openingBalance: schema_1.cashRegisters.openingBalance,
                totalDeposits: schema_1.cashRegisters.totalDeposits,
                totalWithdrawals: schema_1.cashRegisters.totalWithdrawals,
                totalSales: schema_1.cashRegisters.totalSales,
            })
                .from(schema_1.cashRegisters)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cashRegisters.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.cashRegisters.status, 'OPEN')));
            if (!result)
                return null;
            const balance = parseFloat(result.openingBalance || '0') +
                parseFloat(result.totalDeposits || '0') +
                parseFloat(result.totalSales || '0') -
                parseFloat(result.totalWithdrawals || '0');
            return { balance };
        }
        async getCommandsCount(salonId, since) {
            const result = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, since)));
            return result[0]?.count || 0;
        }
        async getPendingConfirmations(salonId) {
            const result = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.appointments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.confirmationStatus, 'PENDING')));
            return result[0]?.count || 0;
        }
        async getOpenCommandsCount(salonId) {
            const result = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'OPEN')));
            return result[0]?.count || 0;
        }
        async getTodayAppointmentsList(salonId, today) {
            const result = await connection_1.db
                .select({
                time: schema_1.appointments.time,
                clientName: schema_1.clients.name,
                service: schema_1.appointments.service,
                professionalName: schema_1.users.name,
            })
                .from(schema_1.appointments)
                .leftJoin(schema_1.clients, (0, drizzle_orm_1.eq)(schema_1.appointments.clientId, schema_1.clients.id))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, schema_1.users.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.date, today)))
                .orderBy(schema_1.appointments.time);
            return result.map((a) => ({
                time: a.time || '--:--',
                clientName: a.clientName || 'Cliente',
                serviceName: a.service || 'Serviço',
                professionalName: a.professionalName || 'Profissional',
            }));
        }
        async getBirthdayClients(salonId) {
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const result = await connection_1.db
                .select({ name: schema_1.clients.name, phone: schema_1.clients.phone })
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.clients.birthDate}) = ${month}`, (0, drizzle_orm_1.sql) `EXTRACT(DAY FROM ${schema_1.clients.birthDate}) = ${day}`));
            return result.map((c) => ({
                name: c.name || 'Cliente',
                phone: c.phone,
            }));
        }
        async getStylistTodayAppointments(salonId, odela, today) {
            const result = await connection_1.db
                .select({
                time: schema_1.appointments.time,
                clientName: schema_1.clients.name,
                service: schema_1.appointments.service,
            })
                .from(schema_1.appointments)
                .leftJoin(schema_1.clients, (0, drizzle_orm_1.eq)(schema_1.appointments.clientId, schema_1.clients.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.appointments.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.appointments.professionalId, odela), (0, drizzle_orm_1.eq)(schema_1.appointments.date, today)))
                .orderBy(schema_1.appointments.time);
            return result.map((a) => ({
                time: a.time || '--:--',
                clientName: a.clientName || 'Cliente',
                serviceName: a.service || 'Serviço',
            }));
        }
        async getStylistMonthRevenue(salonId, odela, since) {
            const result = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commandItems.totalPrice}), 0)` })
                .from(schema_1.commandItems)
                .innerJoin(schema_1.commands, (0, drizzle_orm_1.eq)(schema_1.commandItems.commandId, schema_1.commands.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.eq)(schema_1.commandItems.performerId, odela), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, since)));
            return parseFloat(result[0]?.total || '0');
        }
        async getStylistPendingCommission(salonId, odela) {
            const result = await connection_1.db
                .select({ total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commissions.commissionValue}), 0)` })
                .from(schema_1.commissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commissions.professionalId, odela), (0, drizzle_orm_1.eq)(schema_1.commissions.status, 'PENDING')));
            return parseFloat(result[0]?.total || '0');
        }
    };
    return AIDataCollectorService = _classThis;
})();
exports.AIDataCollectorService = AIDataCollectorService;
//# sourceMappingURL=ai-data-collector.service.js.map
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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ReportsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReportsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReportsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        db;
        constructor(db) {
            this.db = db;
        }
        /**
         * Relatorio de vendas por periodo
         */
        async getSalesReport(salonId, startDate, endDate, groupBy = 'day') {
            // Get closed commands in the period
            const closedCommands = await this.db
                .select({
                id: schema_1.commands.id,
                closedAt: schema_1.commands.cashierClosedAt,
                totalAmount: schema_1.commands.totalNet,
            })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.commands.cashierClosedAt));
            // Group by date
            const groupedData = {};
            for (const cmd of closedCommands) {
                if (!cmd.closedAt)
                    continue;
                let key;
                const date = new Date(cmd.closedAt);
                if (groupBy === 'day') {
                    key = date.toISOString().split('T')[0];
                }
                else if (groupBy === 'week') {
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                }
                else {
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }
                if (!groupedData[key]) {
                    groupedData[key] = { total: 0, count: 0 };
                }
                groupedData[key].total += parseFloat(cmd.totalAmount || '0');
                groupedData[key].count += 1;
            }
            const items = Object.entries(groupedData)
                .map(([date, data]) => ({
                date,
                total: Math.round(data.total * 100) / 100,
                commandCount: data.count,
                averageTicket: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
            }))
                .sort((a, b) => a.date.localeCompare(b.date));
            const totalRevenue = items.reduce((sum, item) => sum + item.total, 0);
            const totalCommands = items.reduce((sum, item) => sum + item.commandCount, 0);
            return {
                items,
                totals: {
                    total: Math.round(totalRevenue * 100) / 100,
                    commands: totalCommands,
                    averageTicket: totalCommands > 0 ? Math.round((totalRevenue / totalCommands) * 100) / 100 : 0,
                },
            };
        }
        /**
         * Relatorio de servicos
         */
        async getServicesReport(salonId, startDate, endDate) {
            // Get service items from closed commands
            const serviceItems = await this.db
                .select({
                referenceId: schema_1.commandItems.referenceId,
                description: schema_1.commandItems.description,
                quantity: schema_1.commandItems.quantity,
                totalPrice: schema_1.commandItems.totalPrice,
            })
                .from(schema_1.commandItems)
                .innerJoin(schema_1.commands, (0, drizzle_orm_1.eq)(schema_1.commandItems.commandId, schema_1.commands.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.eq)(schema_1.commandItems.type, 'SERVICE'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)));
            // Group by service
            const serviceData = {};
            let totalRevenue = 0;
            for (const item of serviceItems) {
                const key = item.referenceId || item.description;
                if (!serviceData[key]) {
                    serviceData[key] = { name: item.description, quantity: 0, revenue: 0 };
                }
                serviceData[key].quantity += parseFloat(item.quantity);
                serviceData[key].revenue += parseFloat(item.totalPrice);
                totalRevenue += parseFloat(item.totalPrice);
            }
            const items = Object.entries(serviceData)
                .map(([serviceId, data]) => ({
                serviceId,
                serviceName: data.name,
                quantity: data.quantity,
                revenue: Math.round(data.revenue * 100) / 100,
                averageTicket: data.quantity > 0 ? Math.round((data.revenue / data.quantity) * 100) / 100 : 0,
                percentOfTotal: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 10000) / 100 : 0,
            }))
                .sort((a, b) => b.revenue - a.revenue);
            return {
                items,
                total: Math.round(totalRevenue * 100) / 100,
            };
        }
        /**
         * Relatorio de produtos
         */
        async getProductsReport(salonId, startDate, endDate) {
            // Get product items from closed commands
            const productItems = await this.db
                .select({
                referenceId: schema_1.commandItems.referenceId,
                description: schema_1.commandItems.description,
                quantity: schema_1.commandItems.quantity,
                totalPrice: schema_1.commandItems.totalPrice,
            })
                .from(schema_1.commandItems)
                .innerJoin(schema_1.commands, (0, drizzle_orm_1.eq)(schema_1.commandItems.commandId, schema_1.commands.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.eq)(schema_1.commandItems.type, 'PRODUCT'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)));
            // Group by product
            const productData = {};
            let totalRevenue = 0;
            for (const item of productItems) {
                const key = item.referenceId || item.description;
                if (!productData[key]) {
                    productData[key] = { name: item.description, quantity: 0, revenue: 0 };
                }
                productData[key].quantity += parseFloat(item.quantity);
                productData[key].revenue += parseFloat(item.totalPrice);
                totalRevenue += parseFloat(item.totalPrice);
            }
            // Get current stock for each product
            const productIds = Object.keys(productData).filter((id) => id !== 'undefined');
            const productsStock = {};
            if (productIds.length > 0) {
                const stockData = await this.db
                    .select({ id: schema_1.products.id, stockRetail: schema_1.products.stockRetail, stockInternal: schema_1.products.stockInternal })
                    .from(schema_1.products)
                    .where((0, drizzle_orm_1.eq)(schema_1.products.salonId, salonId));
                for (const p of stockData) {
                    productsStock[String(p.id)] = p.stockRetail + p.stockInternal;
                }
            }
            const items = Object.entries(productData)
                .map(([productId, data]) => ({
                productId,
                productName: data.name,
                quantitySold: data.quantity,
                revenue: Math.round(data.revenue * 100) / 100,
                currentStock: productsStock[productId] || 0,
            }))
                .sort((a, b) => b.revenue - a.revenue);
            return {
                items,
                total: Math.round(totalRevenue * 100) / 100,
            };
        }
        /**
         * Relatorio de profissionais
         */
        async getProfessionalsReport(salonId, startDate, endDate) {
            // Get all professionals
            const professionals = await this.db
                .select({ id: schema_1.users.id, name: schema_1.users.name })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.users.role, 'STYLIST'), (0, drizzle_orm_1.eq)(schema_1.users.active, true)));
            const items = [];
            let totalRevenue = 0;
            let totalCommission = 0;
            for (const prof of professionals) {
                // Get revenue from command items where this professional was the performer
                const revenueResult = await this.db
                    .select({
                    total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commandItems.totalPrice}), 0)::text`,
                    count: (0, drizzle_orm_1.sql) `COUNT(*)::int`,
                })
                    .from(schema_1.commandItems)
                    .innerJoin(schema_1.commands, (0, drizzle_orm_1.eq)(schema_1.commandItems.commandId, schema_1.commands.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commandItems.performerId, prof.id), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate)));
                // Get paid commissions for this professional
                const commissionResult = await this.db
                    .select({
                    total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commissions.commissionValue}), 0)::text`,
                })
                    .from(schema_1.commissions)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commissions.professionalId, prof.id), (0, drizzle_orm_1.gte)(schema_1.commissions.createdAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commissions.createdAt, endDate)));
                const revenue = parseFloat(revenueResult[0]?.total || '0');
                const commission = parseFloat(commissionResult[0]?.total || '0');
                const appointments = revenueResult[0]?.count || 0;
                items.push({
                    id: prof.id,
                    name: prof.name,
                    appointments,
                    revenue: Math.round(revenue * 100) / 100,
                    commission: Math.round(commission * 100) / 100,
                    averageTicket: appointments > 0 ? Math.round((revenue / appointments) * 100) / 100 : 0,
                });
                totalRevenue += revenue;
                totalCommission += commission;
            }
            items.sort((a, b) => b.revenue - a.revenue);
            return {
                items,
                totals: {
                    revenue: Math.round(totalRevenue * 100) / 100,
                    commission: Math.round(totalCommission * 100) / 100,
                },
            };
        }
        /**
         * Relatorio de clientes
         */
        async getClientsReport(salonId, startDate, endDate) {
            // Get new clients in the period
            const newClientsResult = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)::int` })
                .from(schema_1.clients)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.clients.salonId, salonId), (0, drizzle_orm_1.gte)(schema_1.clients.createdAt, startDate), (0, drizzle_orm_1.lte)(schema_1.clients.createdAt, endDate)));
            const newClients = newClientsResult[0]?.count || 0;
            // Get clients who made purchases in the period
            const activeClientsResult = await this.db
                .select({
                clientId: schema_1.commands.clientId,
                count: (0, drizzle_orm_1.sql) `COUNT(*)::int`,
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.commands.totalNet}), 0)::text`,
            })
                .from(schema_1.commands)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.commands.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.commands.status, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.commands.cashierClosedAt, startDate), (0, drizzle_orm_1.lte)(schema_1.commands.cashierClosedAt, endDate), (0, drizzle_orm_1.sql) `${schema_1.commands.clientId} IS NOT NULL`))
                .groupBy(schema_1.commands.clientId);
            const returningClients = activeClientsResult.filter((c) => c.count > 1).length;
            const totalActiveClients = activeClientsResult.length;
            // Calculate metrics
            let totalSpent = 0;
            let totalVisits = 0;
            const topClientsData = [];
            for (const client of activeClientsResult) {
                if (client.clientId) {
                    const spent = parseFloat(client.total || '0');
                    totalSpent += spent;
                    totalVisits += client.count;
                    topClientsData.push({
                        id: client.clientId,
                        visits: client.count,
                        totalSpent: spent,
                    });
                }
            }
            // Sort and get top 10
            topClientsData.sort((a, b) => b.totalSpent - a.totalSpent);
            const topClientIds = topClientsData.slice(0, 10);
            // Get client names
            const topClients = [];
            for (const tc of topClientIds) {
                const clientData = await this.db
                    .select({ name: schema_1.clients.name })
                    .from(schema_1.clients)
                    .where((0, drizzle_orm_1.eq)(schema_1.clients.id, tc.id))
                    .limit(1);
                topClients.push({
                    id: tc.id,
                    name: clientData[0]?.name || 'Cliente',
                    visits: tc.visits,
                    totalSpent: Math.round(tc.totalSpent * 100) / 100,
                });
            }
            const averageTicket = totalVisits > 0 ? totalSpent / totalVisits : 0;
            const averageFrequency = totalActiveClients > 0 ? totalVisits / totalActiveClients : 0;
            const retentionRate = totalActiveClients > 0 ? (returningClients / totalActiveClients) * 100 : 0;
            return {
                newClients,
                returningClients,
                retentionRate: Math.round(retentionRate * 100) / 100,
                averageTicket: Math.round(averageTicket * 100) / 100,
                averageFrequency: Math.round(averageFrequency * 100) / 100,
                topClients,
            };
        }
        /**
         * Exporta relatorio generico em CSV
         */
        async exportReport(salonId, type, startDate, endDate) {
            let data = [];
            switch (type) {
                case 'sales': {
                    const report = await this.getSalesReport(salonId, startDate, endDate, 'day');
                    data = report.items.map((item) => ({
                        Data: item.date,
                        Comandas: item.commandCount,
                        Faturamento: item.total,
                        'Ticket Medio': item.averageTicket,
                    }));
                    break;
                }
                case 'services': {
                    const report = await this.getServicesReport(salonId, startDate, endDate);
                    data = report.items.map((item) => ({
                        Servico: item.serviceName,
                        Quantidade: item.quantity,
                        Receita: item.revenue,
                        'Ticket Medio': item.averageTicket,
                        '% do Total': item.percentOfTotal,
                    }));
                    break;
                }
                case 'products': {
                    const report = await this.getProductsReport(salonId, startDate, endDate);
                    data = report.items.map((item) => ({
                        Produto: item.productName,
                        'Qtd Vendida': item.quantitySold,
                        Receita: item.revenue,
                        'Estoque Atual': item.currentStock,
                    }));
                    break;
                }
                case 'professionals': {
                    const report = await this.getProfessionalsReport(salonId, startDate, endDate);
                    data = report.items.map((item) => ({
                        Profissional: item.name,
                        Atendimentos: item.appointments,
                        Receita: item.revenue,
                        Comissao: item.commission,
                        'Ticket Medio': item.averageTicket,
                    }));
                    break;
                }
                case 'clients': {
                    const report = await this.getClientsReport(salonId, startDate, endDate);
                    data = [
                        { Metrica: 'Novos Clientes', Valor: report.newClients },
                        { Metrica: 'Clientes Recorrentes', Valor: report.returningClients },
                        { Metrica: 'Taxa de Retencao (%)', Valor: report.retentionRate },
                        { Metrica: 'Ticket Medio (R$)', Valor: report.averageTicket },
                        { Metrica: 'Frequencia Media', Valor: report.averageFrequency },
                    ];
                    // Add top clients
                    report.topClients.forEach((client, index) => {
                        data.push({
                            Metrica: `Top ${index + 1}: ${client.name}`,
                            Valor: `${client.visits} visitas - R$ ${client.totalSpent}`,
                        });
                    });
                    break;
                }
            }
            return this.convertToCSV(data);
        }
        /**
         * Exporta transacoes com dados enriquecidos
         */
        async exportTransactions(salonId, startDate, endDate, format = 'json') {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.transactions.salonId, salonId)];
            if (startDate) {
                conditions.push((0, drizzle_orm_1.gte)(schema_1.transactions.date, startDate));
            }
            if (endDate) {
                conditions.push((0, drizzle_orm_1.lte)(schema_1.transactions.date, endDate));
            }
            const results = await this.db
                .select({
                id: schema_1.transactions.id,
                date: schema_1.transactions.date,
                type: schema_1.transactions.type,
                amount: schema_1.transactions.amount,
                category: schema_1.transactions.category,
                paymentMethod: schema_1.transactions.paymentMethod,
                description: schema_1.transactions.description,
                clientId: schema_1.transactions.clientId,
                salonId: schema_1.transactions.salonId,
            })
                .from(schema_1.transactions)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.date));
            const enrichedData = [];
            for (const tx of results) {
                let clientName = null;
                let salonName = null;
                if (tx.clientId) {
                    const [client] = await this.db
                        .select({ name: schema_1.clients.name })
                        .from(schema_1.clients)
                        .where((0, drizzle_orm_1.eq)(schema_1.clients.id, tx.clientId));
                    clientName = client?.name || null;
                }
                if (tx.salonId) {
                    const [salon] = await this.db
                        .select({ name: schema_1.salons.name })
                        .from(schema_1.salons)
                        .where((0, drizzle_orm_1.eq)(schema_1.salons.id, tx.salonId));
                    salonName = salon?.name || null;
                }
                enrichedData.push({
                    id: tx.id,
                    date: tx.date,
                    type: tx.type,
                    amount: tx.amount,
                    category: tx.category,
                    paymentMethod: tx.paymentMethod,
                    description: tx.description,
                    clientName,
                    salonName,
                });
            }
            if (format === 'csv') {
                return this.convertToCSV(enrichedData);
            }
            return enrichedData;
        }
        /**
         * Exporta dados fiscais (invoices) para contabilidade
         */
        async exportInvoices(salonId, startDate, endDate, format = 'json') {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.transactions.salonId, salonId)];
            if (startDate) {
                conditions.push((0, drizzle_orm_1.gte)(schema_1.transactions.date, startDate));
            }
            if (endDate) {
                conditions.push((0, drizzle_orm_1.lte)(schema_1.transactions.date, endDate));
            }
            const [salonData] = await this.db
                .select()
                .from(schema_1.salons)
                .where((0, drizzle_orm_1.eq)(schema_1.salons.id, salonId));
            const results = await this.db
                .select({
                id: schema_1.transactions.id,
                date: schema_1.transactions.date,
                type: schema_1.transactions.type,
                amount: schema_1.transactions.amount,
                category: schema_1.transactions.category,
                paymentMethod: schema_1.transactions.paymentMethod,
                description: schema_1.transactions.description,
                clientId: schema_1.transactions.clientId,
            })
                .from(schema_1.transactions)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.date));
            const enrichedData = [];
            for (const tx of results) {
                let clientName = null;
                let clientPhone = null;
                if (tx.clientId) {
                    const [client] = await this.db
                        .select({ name: schema_1.clients.name, phone: schema_1.clients.phone })
                        .from(schema_1.clients)
                        .where((0, drizzle_orm_1.eq)(schema_1.clients.id, tx.clientId));
                    clientName = client?.name || null;
                    clientPhone = client?.phone || null;
                }
                enrichedData.push({
                    id: tx.id,
                    date: tx.date,
                    type: tx.type,
                    amount: tx.amount,
                    category: tx.category,
                    paymentMethod: tx.paymentMethod,
                    description: tx.description,
                    clientName,
                    clientPhone,
                    salonName: salonData?.name || null,
                    salonTaxId: salonData?.taxId || null,
                    salonAddress: salonData?.address || null,
                });
            }
            if (format === 'csv') {
                return this.convertToCSV(enrichedData);
            }
            return enrichedData;
        }
        /**
         * Gera resumo financeiro completo para um periodo
         */
        async getFinancialSummary(salonId, startDate, endDate) {
            const txResults = await this.db
                .select()
                .from(schema_1.transactions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.transactions.salonId, salonId), (0, drizzle_orm_1.gte)(schema_1.transactions.date, startDate), (0, drizzle_orm_1.lte)(schema_1.transactions.date, endDate)));
            const incomeByCategory = {};
            const expenseByCategory = {};
            const paymentMethodBreakdown = {};
            let totalIncome = 0;
            let totalExpense = 0;
            for (const tx of txResults) {
                const amount = parseFloat(tx.amount);
                if (tx.type === 'INCOME') {
                    totalIncome += amount;
                    incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amount;
                }
                else {
                    totalExpense += amount;
                    expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + amount;
                }
                if (tx.paymentMethod) {
                    paymentMethodBreakdown[tx.paymentMethod] =
                        (paymentMethodBreakdown[tx.paymentMethod] || 0) + amount;
                }
            }
            const receivables = await this.db
                .select()
                .from(schema_1.accountsReceivable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.accountsReceivable.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.accountsReceivable.status, 'PENDING')));
            const pendingReceivables = receivables.reduce((sum, r) => sum + parseFloat(r.amount), 0);
            const payables = await this.db
                .select()
                .from(schema_1.accountsPayable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.accountsPayable.salonId, salonId), (0, drizzle_orm_1.eq)(schema_1.accountsPayable.status, 'PENDING')));
            const pendingPayables = payables.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            return {
                period: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                },
                totalIncome,
                totalExpense,
                netProfit: totalIncome - totalExpense,
                transactionCount: txResults.length,
                incomeByCategory,
                expenseByCategory,
                paymentMethodBreakdown,
                pendingReceivables,
                pendingPayables,
            };
        }
        /**
         * Converte array de objetos para CSV
         */
        convertToCSV(data) {
            if (data.length === 0) {
                return '';
            }
            const headers = Object.keys(data[0]);
            const csvRows = [headers.join(',')];
            for (const row of data) {
                const values = headers.map((header) => {
                    const value = row[header];
                    if (value === null || value === undefined) {
                        return '';
                    }
                    if (value instanceof Date) {
                        return value.toISOString();
                    }
                    const stringValue = String(value);
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                });
                csvRows.push(values.join(','));
            }
            return csvRows.join('\n');
        }
    };
    return ReportsService = _classThis;
})();
exports.ReportsService = ReportsService;
//# sourceMappingURL=reports.service.js.map
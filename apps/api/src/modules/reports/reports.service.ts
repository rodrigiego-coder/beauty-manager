import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import {
  transactions,
  clients,
  salons,
  accountsPayable,
  accountsReceivable,
  AccountPayable,
  commands,
  commandItems,
  users,
  products,
  commissions,
} from '../../database/schema';
import { eq, and, gte, lte, desc, sql, inArray } from 'drizzle-orm';

export interface TransactionExportData {
  [key: string]: number | Date | string | null;
  id: number;
  date: Date;
  type: string;
  amount: string;
  category: string;
  paymentMethod: string | null;
  description: string | null;
  clientName: string | null;
  salonName: string | null;
}

export interface InvoiceExportData {
  [key: string]: number | Date | string | null;
  id: number;
  date: Date;
  type: string;
  amount: string;
  category: string;
  paymentMethod: string | null;
  description: string | null;
  clientName: string | null;
  clientPhone: string | null;
  salonName: string | null;
  salonTaxId: string | null;
  salonAddress: string | null;
}

export interface FinancialSummary {
  period: { startDate: string; endDate: string };
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  paymentMethodBreakdown: Record<string, number>;
  pendingReceivables: number;
  pendingPayables: number;
}

export interface SalesReportItem {
  date: string;
  total: number;
  commandCount: number;
  averageTicket: number;
}

export interface ServiceReportItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  revenue: number;
  averageTicket: number;
  percentOfTotal: number;
}

export interface ProductReportItem {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  currentStock: number;
}

export interface ProfessionalReportItem {
  id: string;
  name: string;
  appointments: number;
  revenue: number;
  commission: number;
  averageTicket: number;
}

export interface ClientsReportSummary {
  newClients: number;
  returningClients: number;
  retentionRate: number;
  averageTicket: number;
  averageFrequency: number;
  topClients: Array<{
    id: string;
    name: string;
    visits: number;
    totalSpent: number;
  }>;
}

export type ExportFormat = 'json' | 'csv';

@Injectable()
export class ReportsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  /**
   * Relatorio de vendas por periodo
   */
  async getSalesReport(
    salonId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<{ items: SalesReportItem[]; totals: { total: number; commands: number; averageTicket: number } }> {
    // Get closed commands in the period
    const closedCommands = await this.db
      .select({
        id: commands.id,
        closedAt: commands.cashierClosedAt,
        totalAmount: commands.totalNet,
      })
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
        ),
      )
      .orderBy(desc(commands.cashierClosedAt));

    // Group by date
    const groupedData: Record<string, { total: number; count: number }> = {};

    for (const cmd of closedCommands) {
      if (!cmd.closedAt) continue;

      let key: string;
      const date = new Date(cmd.closedAt);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { total: 0, count: 0 };
      }
      groupedData[key].total += parseFloat(cmd.totalAmount || '0');
      groupedData[key].count += 1;
    }

    const items: SalesReportItem[] = Object.entries(groupedData)
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
  async getServicesReport(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ items: ServiceReportItem[]; total: number }> {
    // Get service items from closed commands
    const serviceItems = await this.db
      .select({
        referenceId: commandItems.referenceId,
        description: commandItems.description,
        quantity: commandItems.quantity,
        totalPrice: commandItems.totalPrice,
      })
      .from(commandItems)
      .innerJoin(commands, eq(commandItems.commandId, commands.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          eq(commandItems.type, 'SERVICE'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
        ),
      );

    // Group by service
    const serviceData: Record<string, { name: string; quantity: number; revenue: number }> = {};
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

    const items: ServiceReportItem[] = Object.entries(serviceData)
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
  async getProductsReport(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ items: ProductReportItem[]; total: number }> {
    // Get product items from closed commands
    const productItems = await this.db
      .select({
        referenceId: commandItems.referenceId,
        description: commandItems.description,
        quantity: commandItems.quantity,
        totalPrice: commandItems.totalPrice,
      })
      .from(commandItems)
      .innerJoin(commands, eq(commandItems.commandId, commands.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          eq(commandItems.type, 'PRODUCT'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
        ),
      );

    // Group by product
    const productData: Record<string, { name: string; quantity: number; revenue: number }> = {};
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
    const productsStock: Record<string, number> = {};

    if (productIds.length > 0) {
      const stockData = await this.db
        .select({ id: products.id, stockRetail: products.stockRetail, stockInternal: products.stockInternal })
        .from(products)
        .where(eq(products.salonId, salonId));

      for (const p of stockData) {
        productsStock[String(p.id)] = p.stockRetail + p.stockInternal;
      }
    }

    const items: ProductReportItem[] = Object.entries(productData)
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
  async getProfessionalsReport(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ items: ProfessionalReportItem[]; totals: { revenue: number; commission: number } }> {
    // Get all professionals
    const professionals = await this.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(and(eq(users.salonId, salonId), eq(users.role, 'STYLIST'), eq(users.active, true)));

    const items: ProfessionalReportItem[] = [];
    let totalRevenue = 0;
    let totalCommission = 0;

    for (const prof of professionals) {
      // Get revenue from command items where this professional was the performer
      const revenueResult = await this.db
        .select({
          total: sql<string>`COALESCE(SUM(${commandItems.totalPrice}), 0)::text`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(commandItems)
        .innerJoin(commands, eq(commandItems.commandId, commands.id))
        .where(
          and(
            eq(commandItems.performerId, prof.id),
            eq(commands.status, 'CLOSED'),
            gte(commands.cashierClosedAt, startDate),
            lte(commands.cashierClosedAt, endDate),
          ),
        );

      // Get paid commissions for this professional
      const commissionResult = await this.db
        .select({
          total: sql<string>`COALESCE(SUM(${commissions.commissionValue}), 0)::text`,
        })
        .from(commissions)
        .where(
          and(
            eq(commissions.professionalId, prof.id),
            gte(commissions.createdAt, startDate),
            lte(commissions.createdAt, endDate),
          ),
        );

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
  async getClientsReport(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClientsReportSummary> {
    // Get new clients in the period
    const newClientsResult = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate),
        ),
      );
    const newClients = newClientsResult[0]?.count || 0;

    // Get clients who made purchases in the period
    const activeClientsResult = await this.db
      .select({
        clientId: commands.clientId,
        count: sql<number>`COUNT(*)::int`,
        total: sql<string>`COALESCE(SUM(${commands.totalNet}), 0)::text`,
      })
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
          sql`${commands.clientId} IS NOT NULL`,
        ),
      )
      .groupBy(commands.clientId);

    const returningClients = activeClientsResult.filter((c) => c.count > 1).length;
    const totalActiveClients = activeClientsResult.length;

    // Calculate metrics
    let totalSpent = 0;
    let totalVisits = 0;

    const topClientsData: Array<{
      id: string;
      visits: number;
      totalSpent: number;
    }> = [];

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
    const topClients: Array<{ id: string; name: string; visits: number; totalSpent: number }> = [];
    for (const tc of topClientIds) {
      const clientData = await this.db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, tc.id))
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
  async exportReport(
    salonId: string,
    type: 'sales' | 'services' | 'products' | 'professionals' | 'clients',
    startDate: Date,
    endDate: Date,
  ): Promise<string> {
    let data: Record<string, unknown>[] = [];

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
  async exportTransactions(
    salonId: string,
    startDate?: Date,
    endDate?: Date,
    format: ExportFormat = 'json',
  ): Promise<TransactionExportData[] | string> {
    const conditions = [eq(transactions.salonId, salonId)];

    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }

    const results = await this.db
      .select({
        id: transactions.id,
        date: transactions.date,
        type: transactions.type,
        amount: transactions.amount,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        clientId: transactions.clientId,
        salonId: transactions.salonId,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));

    const enrichedData: TransactionExportData[] = [];
    for (const tx of results) {
      let clientName: string | null = null;
      let salonName: string | null = null;

      if (tx.clientId) {
        const [client] = await this.db
          .select({ name: clients.name })
          .from(clients)
          .where(eq(clients.id, tx.clientId));
        clientName = client?.name || null;
      }

      if (tx.salonId) {
        const [salon] = await this.db
          .select({ name: salons.name })
          .from(salons)
          .where(eq(salons.id, tx.salonId));
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
  async exportInvoices(
    salonId: string,
    startDate?: Date,
    endDate?: Date,
    format: ExportFormat = 'json',
  ): Promise<InvoiceExportData[] | string> {
    const conditions = [eq(transactions.salonId, salonId)];

    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }

    const [salonData] = await this.db
      .select()
      .from(salons)
      .where(eq(salons.id, salonId));

    const results = await this.db
      .select({
        id: transactions.id,
        date: transactions.date,
        type: transactions.type,
        amount: transactions.amount,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        clientId: transactions.clientId,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));

    const enrichedData: InvoiceExportData[] = [];
    for (const tx of results) {
      let clientName: string | null = null;
      let clientPhone: string | null = null;

      if (tx.clientId) {
        const [client] = await this.db
          .select({ name: clients.name, phone: clients.phone })
          .from(clients)
          .where(eq(clients.id, tx.clientId));
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
  async getFinancialSummary(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialSummary> {
    const txResults = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.salonId, salonId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ),
      );

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    const paymentMethodBreakdown: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of txResults) {
      const amount = parseFloat(tx.amount);

      if (tx.type === 'INCOME') {
        totalIncome += amount;
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amount;
      } else {
        totalExpense += amount;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + amount;
      }

      if (tx.paymentMethod) {
        paymentMethodBreakdown[tx.paymentMethod] =
          (paymentMethodBreakdown[tx.paymentMethod] || 0) + amount;
      }
    }

    const receivables = await this.db
      .select({
        remainingAmount: accountsReceivable.remainingAmount,
      })
      .from(accountsReceivable)
      .where(
        and(
          eq(accountsReceivable.salonId, salonId),
          inArray(accountsReceivable.status, ['OPEN', 'OVERDUE'] as any),
        ),
      );
    const pendingReceivables = receivables.reduce(
      (sum, r) => sum + parseFloat(r.remainingAmount),
      0,
    );

    const payables = await this.db
      .select()
      .from(accountsPayable)
      .where(
        and(
          eq(accountsPayable.salonId, salonId),
          eq(accountsPayable.status, 'PENDING'),
        ),
      );
    const pendingPayables = payables.reduce(
      (sum: number, p: AccountPayable) => sum + parseFloat(p.amount),
      0,
    );

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
  private convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
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
}

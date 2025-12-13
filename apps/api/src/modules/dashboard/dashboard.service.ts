import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import {
  clients,
  products,
  commands,
  commandItems,
  commandPayments,
  cashRegisters,
} from '../../database/schema';

export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

export interface RevenueByPaymentMethod {
  cash: number;
  creditCard: number;
  debitCard: number;
  pix: number;
  other: number;
}

export interface CommandsByStatus {
  open: number;
  inService: number;
  waitingPayment: number;
  closed: number;
  canceled: number;
}

export interface TopService {
  name: string;
  quantity: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
}

export interface CashRegisterStatus {
  isOpen: boolean;
  id?: string;
  openedAt?: Date;
  openingBalance?: number;
  totalSales?: number;
  totalCash?: number;
  totalCard?: number;
  totalPix?: number;
  expectedBalance?: number;
}

export interface DashboardStats {
  // Faturamento
  totalRevenue: number;
  previousRevenue: number;
  revenueGrowth: number;
  revenueByPaymentMethod: RevenueByPaymentMethod;
  todaySales: number;

  // Comandas
  totalCommands: number;
  openCommands: number;
  averageTicket: number;
  commandsByStatus: CommandsByStatus;

  // Clientes
  totalClients: number;
  newClients: number;
  returningClients: number;

  // Servicos e Produtos
  topServices: TopService[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];

  // Caixa
  cashRegister: CashRegisterStatus;

  // Periodo
  period: DashboardPeriod;
  periodStart: string;
  periodEnd: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  async getStats(salonId: string, period: DashboardPeriod = 'today'): Promise<DashboardStats> {
    const { startDate, endDate, previousStartDate, previousEndDate } = this.getPeriodDates(period);

    // Buscar todas as estatisticas em paralelo
    const [
      revenueData,
      previousRevenueData,
      commandsData,
      clientsData,
      topServicesData,
      topProductsData,
      lowStockData,
      cashRegisterData,
      todaySalesData,
    ] = await Promise.all([
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

  private getPeriodDates(period: DashboardPeriod) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

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

  private async getRevenueData(salonId: string, startDate: Date, endDate: Date) {
    // Buscar comandas fechadas no periodo
    const closedCommands = await this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
        ),
      );

    const totalRevenue = closedCommands.reduce(
      (sum, cmd) => sum + parseFloat(cmd.totalNet || '0'),
      0,
    );

    // Buscar pagamentos das comandas fechadas no periodo
    const commandIds = closedCommands.map(cmd => cmd.id);

    let payments: { method: string; amount: string }[] = [];
    if (commandIds.length > 0) {
      payments = await this.db
        .select({
          method: commandPayments.method,
          amount: commandPayments.amount,
        })
        .from(commandPayments)
        .where(
          sql`${commandPayments.commandId} IN ${commandIds.length > 0 ? sql`(${sql.join(commandIds.map(id => sql`${id}`), sql`, `)})` : sql`(NULL)`}`,
        );
    }

    // Agrupar por metodo de pagamento
    const byPaymentMethod: RevenueByPaymentMethod = {
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

  private async getCommandsData(salonId: string, startDate: Date, endDate: Date) {
    // Buscar todas as comandas criadas no periodo
    const allCommands = await this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          gte(commands.openedAt, startDate),
          lte(commands.openedAt, endDate),
        ),
      );

    // Comandas abertas (independente do periodo)
    const openCommandsList = await this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          sql`${commands.status} IN ('OPEN', 'IN_SERVICE', 'WAITING_PAYMENT')`,
        ),
      );

    const commandsByStatus: CommandsByStatus = {
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

  private async getClientsData(salonId: string, startDate: Date, endDate: Date) {
    // Total de clientes ativos
    const allClients = await this.db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          eq(clients.active, true),
        ),
      );

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

  private async getTopServices(salonId: string, startDate: Date, endDate: Date): Promise<TopService[]> {
    // Buscar comandas fechadas no periodo
    const closedCommands = await this.db
      .select({ id: commands.id })
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
        ),
      );

    if (closedCommands.length === 0) {
      return [];
    }

    const commandIds = closedCommands.map(c => c.id);

    // Buscar itens do tipo SERVICE dessas comandas
    const serviceItems = await this.db
      .select({
        description: commandItems.description,
        quantity: commandItems.quantity,
        totalPrice: commandItems.totalPrice,
      })
      .from(commandItems)
      .where(
        and(
          sql`${commandItems.commandId} IN ${sql`(${sql.join(commandIds.map(id => sql`${id}`), sql`, `)})`}`,
          eq(commandItems.type, 'SERVICE'),
          sql`${commandItems.canceledAt} IS NULL`,
        ),
      );

    // Agrupar por nome do servico
    const serviceMap = new Map<string, { quantity: number; revenue: number }>();

    serviceItems.forEach(item => {
      const name = item.description;
      const qty = parseFloat(item.quantity || '1');
      const rev = parseFloat(item.totalPrice || '0');

      if (serviceMap.has(name)) {
        const current = serviceMap.get(name)!;
        current.quantity += qty;
        current.revenue += rev;
      } else {
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

  private async getTopProducts(salonId: string, startDate: Date, endDate: Date): Promise<TopProduct[]> {
    // Buscar comandas fechadas no periodo
    const closedCommands = await this.db
      .select({ id: commands.id })
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startDate),
          lte(commands.cashierClosedAt, endDate),
        ),
      );

    if (closedCommands.length === 0) {
      return [];
    }

    const commandIds = closedCommands.map(c => c.id);

    // Buscar itens do tipo PRODUCT dessas comandas
    const productItems = await this.db
      .select({
        description: commandItems.description,
        quantity: commandItems.quantity,
        totalPrice: commandItems.totalPrice,
      })
      .from(commandItems)
      .where(
        and(
          sql`${commandItems.commandId} IN ${sql`(${sql.join(commandIds.map(id => sql`${id}`), sql`, `)})`}`,
          eq(commandItems.type, 'PRODUCT'),
          sql`${commandItems.canceledAt} IS NULL`,
        ),
      );

    // Agrupar por nome do produto
    const productMap = new Map<string, { quantity: number; revenue: number }>();

    productItems.forEach(item => {
      const name = item.description;
      const qty = parseFloat(item.quantity || '1');
      const rev = parseFloat(item.totalPrice || '0');

      if (productMap.has(name)) {
        const current = productMap.get(name)!;
        current.quantity += qty;
        current.revenue += rev;
      } else {
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

  private async getLowStockProducts(salonId: string): Promise<LowStockProduct[]> {
    const allProducts = await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
        ),
      );

    return allProducts
      .filter(p => p.currentStock <= p.minStock)
      .map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.currentStock,
        minStock: p.minStock,
      }))
      .sort((a, b) => a.currentStock - b.currentStock);
  }

  private async getCashRegisterStatus(salonId: string): Promise<CashRegisterStatus> {
    // Buscar caixa aberto
    const openCashRegister = await this.db
      .select()
      .from(cashRegisters)
      .where(
        and(
          eq(cashRegisters.salonId, salonId),
          eq(cashRegisters.status, 'OPEN'),
        ),
      )
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

  private async getTodaySales(salonId: string): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const todayCommands = await this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startOfDay),
          lte(commands.cashierClosedAt, endOfDay),
        ),
      );

    return todayCommands.reduce(
      (sum, cmd) => sum + parseFloat(cmd.totalNet || '0'),
      0,
    );
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, lt, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import {
  clients,
  products,
  commands,
  commandItems,
  commandPayments,
  cashRegisters,
  appointments,
  users,
} from '../../database/schema';
import { ProfessionalDashboardDto } from './dto/professional-dashboard.dto';
import { spNow, spMidnightToUtc } from '../../common/date-range';

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
    // All dates are computed in America/Sao_Paulo and converted to UTC
    // so that queries on "timestamp without time zone" (stored as UTC) are correct.
    const { year, month, day, dayOfWeek } = spNow(); // month is 1-indexed
    const m = month - 1; // convert to 0-indexed for spMidnightToUtc

    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (period) {
      case 'today':
        startDate = spMidnightToUtc(year, m, day);
        endDate = spMidnightToUtc(year, m, day + 1);
        previousStartDate = spMidnightToUtc(year, m, day - 1);
        previousEndDate = startDate;
        break;

      case 'week': {
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = spMidnightToUtc(year, m, day - diffToMonday);
        endDate = spMidnightToUtc(year, m, day + 1);
        previousStartDate = spMidnightToUtc(year, m, day - diffToMonday - 7);
        previousEndDate = startDate;
        break;
      }

      case 'month':
        startDate = spMidnightToUtc(year, m, 1);
        endDate = spMidnightToUtc(year, m, day + 1);
        previousStartDate = spMidnightToUtc(year, m - 1, 1);
        previousEndDate = startDate;
        break;

      case 'year':
        startDate = spMidnightToUtc(year, 0, 1);
        endDate = spMidnightToUtc(year, m, day + 1);
        previousStartDate = spMidnightToUtc(year - 1, 0, 1);
        previousEndDate = spMidnightToUtc(year, 0, 1);
        break;

      default:
        startDate = spMidnightToUtc(year, m, day);
        endDate = spMidnightToUtc(year, m, day + 1);
        previousStartDate = spMidnightToUtc(year, m, day - 1);
        previousEndDate = startDate;
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
          lt(commands.cashierClosedAt, endDate),
        ),
      );

    const totalRevenue = closedCommands.reduce(
      (sum, cmd) => sum + parseFloat(cmd.totalNet || '0'),
      0,
    );

    // Buscar pagamentos das comandas fechadas no periodo
    // AUDITORIA: Usa netAmount (líquido após taxas) para bater com totalRevenue
    const commandIds = closedCommands.map(cmd => cmd.id);

    let payments: { method: string | null; amount: string; netAmount: string | null }[] = [];
    if (commandIds.length > 0) {
      payments = await this.db
        .select({
          method: commandPayments.method,
          amount: commandPayments.amount,
          netAmount: commandPayments.netAmount,
        })
        .from(commandPayments)
        .where(
          sql`${commandPayments.commandId} IN ${commandIds.length > 0 ? sql`(${sql.join(commandIds.map(id => sql`${id}`), sql`, `)})` : sql`(NULL)`}`,
        );
    }

    // Agrupar por metodo de pagamento (usa netAmount para consistência com totalRevenue)
    const byPaymentMethod: RevenueByPaymentMethod = {
      cash: 0,
      creditCard: 0,
      debitCard: 0,
      pix: 0,
      other: 0,
    };

    payments.forEach(p => {
      const amount = parseFloat(p.netAmount || p.amount);
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
          lt(commands.openedAt, endDate),
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
      return createdAt >= startDate && createdAt < endDate;
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
          lt(commands.cashierClosedAt, endDate),
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
          lt(commands.cashierClosedAt, endDate),
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
    const { year, month, day } = spNow();
    const m = month - 1;
    const startOfDay = spMidnightToUtc(year, m, day);
    const endOfDay = spMidnightToUtc(year, m, day + 1);

    const todayCommands = await this.db
      .select()
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, startOfDay),
          lt(commands.cashierClosedAt, endOfDay),
        ),
      );

    return todayCommands.reduce(
      (sum, cmd) => sum + parseFloat(cmd.totalNet || '0'),
      0,
    );
  }

  /**
   * =====================================================
   * DASHBOARD DO PROFISSIONAL
   * CRÍTICO: Sempre filtra por professionalId para isolamento
   * =====================================================
   */
  async getProfessionalDashboard(
    salonId: string,
    professionalId: string,
  ): Promise<ProfessionalDashboardDto> {
    const sp = spNow();
    const m = sp.month - 1; // 0-indexed
    // Date strings for appointment.date comparisons (YYYY-MM-DD, no TZ needed)
    const todayStr = `${sp.year}-${String(sp.month).padStart(2, '0')}-${String(sp.day).padStart(2, '0')}`;

    const weekAgo = new Date(sp.year, m, sp.day - 7);
    const weekStartStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;

    const monthStartStr = `${sp.year}-${String(sp.month).padStart(2, '0')}-01`;
    // Last day of month
    const lastDay = new Date(sp.year, m + 1, 0).getDate();
    const monthEndStr = `${sp.year}-${String(sp.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // UTC ranges for timestamp queries
    const monthStartUtc = spMidnightToUtc(sp.year, m, 1);
    const monthEndUtc = spMidnightToUtc(sp.year, m + 1, 1);

    // Buscar dados do profissional (nome e taxa de comissão)
    const [professional] = await this.db
      .select({
        name: users.name,
        commissionRate: users.commissionRate,
      })
      .from(users)
      .where(eq(users.id, professionalId))
      .limit(1);

    const commissionRate = parseFloat(professional?.commissionRate || '0.50');

    // CRÍTICO: Todos os queries filtram por professionalId
    const [
      todayAppts,
      weekAppts,
      monthAppts,
      upcomingAppts,
      monthRevenue,
    ] = await Promise.all([
      // Agendamentos de hoje
      this.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.salonId, salonId),
            eq(appointments.professionalId, professionalId),
            eq(appointments.date, todayStr),
          ),
        ),

      // Agendamentos da semana
      this.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.salonId, salonId),
            eq(appointments.professionalId, professionalId),
            gte(appointments.date, weekStartStr),
            lte(appointments.date, todayStr), // date string comparison, not timestamp
          ),
        ),

      // Agendamentos do mês (para performance)
      this.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.salonId, salonId),
            eq(appointments.professionalId, professionalId),
            gte(appointments.date, monthStartStr),
            lte(appointments.date, monthEndStr),
          ),
        ),

      // Próximos agendamentos (hoje e futuros)
      this.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.salonId, salonId),
            eq(appointments.professionalId, professionalId),
            gte(appointments.date, todayStr),
            sql`${appointments.status} NOT IN ('CANCELLED', 'NO_SHOW')`,
          ),
        )
        .orderBy(appointments.date, appointments.time)
        .limit(10),

      // Faturamento do mês (serviços executados pelo profissional)
      this.getProfessionalMonthRevenue(salonId, professionalId, monthStartUtc, monthEndUtc),
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
  private async getProfessionalMonthRevenue(
    salonId: string,
    professionalId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<number> {
    // Buscar comandas fechadas no mês
    const closedCommands = await this.db
      .select({ id: commands.id })
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, monthStart),
          lt(commands.cashierClosedAt, monthEnd),
        ),
      );

    if (closedCommands.length === 0) {
      return 0;
    }

    const commandIds = closedCommands.map(c => c.id);

    // Buscar itens de serviço executados pelo profissional
    const items = await this.db
      .select({
        totalPrice: commandItems.totalPrice,
      })
      .from(commandItems)
      .where(
        and(
          sql`${commandItems.commandId} IN ${sql`(${sql.join(commandIds.map(id => sql`${id}`), sql`, `)})`}`,
          eq(commandItems.performerId, professionalId),
          eq(commandItems.type, 'SERVICE'),
          sql`${commandItems.canceledAt} IS NULL`,
        ),
      );

    return items.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice || '0'),
      0,
    );
  }
}

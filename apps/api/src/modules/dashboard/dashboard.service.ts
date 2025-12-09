import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import {
  appointments,
  clients,
  products,
  transactions,
  accountsPayable,
  accountsReceivable,
} from '../../database/schema';

export interface DashboardStats {
  // Cards principais
  appointmentsToday: number;
  activeClients: number;
  monthlyRevenue: number;
  lowStockProducts: number;

  // Financeiro
  pendingPayables: number;
  pendingReceivables: number;

  // Gráfico receitas x despesas (últimos 6 meses)
  revenueChart: { name: string; receitas: number; despesas: number }[];

  // Top serviços
  topServices: { name: string; value: number }[];
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  async getStats(salonId: string): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];

    // 1. Agendamentos de hoje
    const todayAppointments = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          eq(appointments.date, today),
        ),
      );
    const appointmentsToday = todayAppointments.length;

    // 2. Clientes ativos
    const allClients = await this.db
      .select()
      .from(clients)
      .where(eq(clients.salonId, salonId));
    const activeClients = allClients.length;

    // 3. Receita do mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthTransactions = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.salonId, salonId),
          eq(transactions.type, 'INCOME'),
          gte(transactions.date, firstDayOfMonth),
          lte(transactions.date, lastDayOfMonth),
        ),
      );
    const monthlyRevenue = monthTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.amount),
      0,
    );

    // 4. Produtos com estoque baixo
    const lowStockList = await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
        ),
      );
    const lowStockProducts = lowStockList.filter(
      (p) => p.currentStock <= p.minStock,
    ).length;

    // 5. Contas a pagar pendentes
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
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );

    // 6. Contas a receber pendentes
    const receivables = await this.db
      .select()
      .from(accountsReceivable)
      .where(
        and(
          eq(accountsReceivable.salonId, salonId),
          eq(accountsReceivable.status, 'PENDING'),
        ),
      );
    const pendingReceivables = receivables.reduce(
      (sum, r) => sum + parseFloat(r.amount),
      0,
    );

    // 7. Gráfico últimos 6 meses
    const revenueChart = await this.getLast6MonthsChart(salonId);

    // 8. Top serviços
    const topServices = await this.getTopServices(salonId);

    return {
      appointmentsToday,
      activeClients,
      monthlyRevenue,
      lowStockProducts,
      pendingPayables,
      pendingReceivables,
      revenueChart,
      topServices,
    };
  }

  private async getLast6MonthsChart(
    salonId: string,
  ): Promise<{ name: string; receitas: number; despesas: number }[]> {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const result: { name: string; receitas: number; despesas: number }[] = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthTx = await this.db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.salonId, salonId),
            gte(transactions.date, firstDay),
            lte(transactions.date, lastDay),
          ),
        );

      const receitas = monthTx
        .filter((tx) => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      const despesas = monthTx
        .filter((tx) => tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      result.push({
        name: months[date.getMonth()],
        receitas,
        despesas,
      });
    }

    return result;
  }

  private async getTopServices(
    salonId: string,
  ): Promise<{ name: string; value: number }[]> {
    const allAppointments = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          eq(appointments.status, 'confirmed'),
        ),
      );

    const serviceCount: Record<string, number> = {};
    allAppointments.forEach((apt) => {
      serviceCount[apt.service] = (serviceCount[apt.service] || 0) + 1;
    });

    return Object.entries(serviceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }
}
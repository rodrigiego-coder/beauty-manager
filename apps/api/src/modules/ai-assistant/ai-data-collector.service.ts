import { Injectable } from '@nestjs/common';
import { db } from '../../database/connection';
import {
  commands,
  clients,
  appointments,
  products,
  users,
  commissions,
  cashRegisters,
  commandItems,
  clientHairProfiles,
  clientNotesAi,
} from '../../database/schema';
import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm';

interface OwnerData {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthPercent: number;
  averageTicket: number;
  totalClients: number;
  newClientsThisMonth: number;
  atRiskClients: Array<{ name: string; phone: string | null; lastVisitDays: number }>;
  lowStockProducts: Array<{ name: string; currentStock: number; minStock: number }>;
  pendingCommissions: number;
  todayAppointments: number;
  teamRanking: Array<{ name: string; revenue: number; odela?: string }>;
  bestSellingServices: Array<{ name: string; quantity: number }>;
  cashRegisterOpen: boolean;
  cashRegisterBalance: number;
}

interface ManagerData {
  todayAppointments: number;
  pendingConfirmations: number;
  lowStockProducts: Array<{ name: string; currentStock: number }>;
  pendingCommissions: number;
  todayRevenue: number;
  openCommands: number;
}

interface ReceptionistData {
  todayAppointments: Array<{ time: string; clientName: string; serviceName: string; professionalName: string }>;
  pendingConfirmations: number;
  birthdayClients: Array<{ name: string; phone: string | null }>;
  openCommands: number;
}

interface StylistData {
  myTodayAppointments: Array<{ time: string; clientName: string; serviceName: string }>;
  myMonthRevenue: number;
  myCommission: number;
  myRanking: number;
  totalProfessionals: number;
}

interface ClientInfo {
  client: { id: string; name: string; phone: string | null; email: string | null };
  hairProfile: any | null;
  lastVisit: Date | string | null;
  totalVisits: number;
  averageTicket: number;
  preferences: string[];
  allergies: string[];
  notes: string[];
}

@Injectable()
export class AIDataCollectorService {
  // ==================== OWNER DATA ====================
  async collectOwnerData(salonId: string): Promise<OwnerData> {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalClients,
      newClientsThisMonth,
      atRiskClients,
      lowStockProducts,
      pendingCommissions,
      todayAppointments,
      teamRanking,
      bestSellingServices,
      cashRegister,
      monthCommandsCount,
    ] = await Promise.all([
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
  async collectManagerData(salonId: string): Promise<ManagerData> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      todayAppointments,
      pendingConfirmations,
      lowStockProducts,
      pendingCommissions,
      todayRevenue,
      openCommands,
    ] = await Promise.all([
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
  async collectReceptionistData(salonId: string): Promise<ReceptionistData> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const [
      todayAppointments,
      pendingConfirmations,
      birthdayClients,
      openCommands,
    ] = await Promise.all([
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
  async collectStylistData(salonId: string, odela: string): Promise<StylistData> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      myTodayAppointments,
      myMonthRevenue,
      myCommission,
      ranking,
    ] = await Promise.all([
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
  async collectClientInfo(salonId: string, clientId: string): Promise<ClientInfo> {
    const [clientResult] = await db
      .select({
        id: clients.id,
        name: clients.name,
        phone: clients.phone,
        email: clients.email,
        lastVisitDate: clients.lastVisitDate,
        totalVisits: clients.totalVisits,
      })
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.salonId, salonId)));

    if (!clientResult) {
      throw new Error('Cliente não encontrado');
    }

    const [hairProfile] = await db
      .select()
      .from(clientHairProfiles)
      .where(eq(clientHairProfiles.clientId, clientId));

    const purchasesResult = await db
      .select({ total: commands.totalNet })
      .from(commands)
      .where(and(eq(commands.clientId, clientId), eq(commands.status, 'CLOSED')));

    const notesResult = await db
      .select({ noteType: clientNotesAi.noteType, content: clientNotesAi.content })
      .from(clientNotesAi)
      .where(and(eq(clientNotesAi.clientId, clientId), eq(clientNotesAi.salonId, salonId)));

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

  private async getRevenue(salonId: string, start: Date, end: Date): Promise<number> {
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${commands.totalNet}), 0)` })
      .from(commands)
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, start),
          lte(commands.cashierClosedAt, end),
        ),
      );
    return parseFloat(result[0]?.total || '0');
  }

  private async getTotalClients(salonId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.salonId, salonId));
    return result[0]?.count || 0;
  }

  private async getNewClients(salonId: string, since: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(clients)
      .where(and(eq(clients.salonId, salonId), gte(clients.createdAt, since)));
    return result[0]?.count || 0;
  }

  private async getAtRiskClients(
    salonId: string,
    days: number,
  ): Promise<Array<{ name: string; phone: string | null; lastVisitDays: number }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const result = await db
      .select({
        name: clients.name,
        phone: clients.phone,
        lastVisitDate: clients.lastVisitDate,
      })
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          sql`${clients.lastVisitDate} < ${cutoffStr}`,
        ),
      )
      .orderBy(clients.lastVisitDate)
      .limit(10);

    return result.map((c) => ({
      name: c.name || 'Sem nome',
      phone: c.phone,
      lastVisitDays: c.lastVisitDate
        ? Math.floor((Date.now() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
    }));
  }

  private async getLowStockProducts(
    salonId: string,
  ): Promise<Array<{ name: string; currentStock: number; minStock: number }>> {
    // Buscar todos os produtos ativos do salão
    const result = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.salonId, salonId),
          eq(products.active, true),
        ),
      );

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

  private async getPendingCommissions(salonId: string): Promise<number> {
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${commissions.commissionValue}), 0)` })
      .from(commissions)
      .where(and(eq(commissions.salonId, salonId), eq(commissions.status, 'PENDING')));
    return parseFloat(result[0]?.total || '0');
  }

  private async getTodayAppointmentsCount(salonId: string, today: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          eq(appointments.date, today),
        ),
      );
    return result[0]?.count || 0;
  }

  private async getTeamRanking(
    salonId: string,
    since: Date,
  ): Promise<Array<{ name: string; revenue: number; odela?: string }>> {
    const result = await db
      .select({
        odela: commandItems.performerId,
        name: users.name,
        total: sql<string>`COALESCE(SUM(${commandItems.totalPrice}), 0)`,
      })
      .from(commandItems)
      .innerJoin(commands, eq(commandItems.commandId, commands.id))
      .leftJoin(users, eq(commandItems.performerId, users.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          gte(commands.cashierClosedAt, since),
        ),
      )
      .groupBy(commandItems.performerId, users.name)
      .orderBy(desc(sql`SUM(${commandItems.totalPrice})`))
      .limit(10);

    return result.map((r) => ({
      name: r.name || 'Profissional',
      revenue: parseFloat(r.total || '0'),
      odela: r.odela || undefined,
    }));
  }

  private async getBestSellingServices(
    salonId: string,
    since: Date,
  ): Promise<Array<{ name: string; quantity: number }>> {
    // Since commandItems uses description instead of serviceId, we group by description
    const result = await db
      .select({
        name: commandItems.description,
        qty: sql<number>`COUNT(*)`,
      })
      .from(commandItems)
      .innerJoin(commands, eq(commandItems.commandId, commands.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          eq(commandItems.type, 'SERVICE'),
          gte(commands.cashierClosedAt, since),
        ),
      )
      .groupBy(commandItems.description)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(5);

    return result.map((r) => ({
      name: r.name,
      quantity: r.qty || 0,
    }));
  }

  private async getCurrentCashRegister(
    salonId: string,
  ): Promise<{ balance: number } | null> {
    const [result] = await db
      .select({
        openingBalance: cashRegisters.openingBalance,
        totalDeposits: cashRegisters.totalDeposits,
        totalWithdrawals: cashRegisters.totalWithdrawals,
        totalSales: cashRegisters.totalSales,
      })
      .from(cashRegisters)
      .where(and(eq(cashRegisters.salonId, salonId), eq(cashRegisters.status, 'OPEN')));

    if (!result) return null;

    const balance =
      parseFloat(result.openingBalance || '0') +
      parseFloat(result.totalDeposits || '0') +
      parseFloat(result.totalSales || '0') -
      parseFloat(result.totalWithdrawals || '0');

    return { balance };
  }

  private async getCommandsCount(salonId: string, since: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(commands)
      .where(
        and(eq(commands.salonId, salonId), eq(commands.status, 'CLOSED'), gte(commands.cashierClosedAt, since)),
      );
    return result[0]?.count || 0;
  }

  private async getPendingConfirmations(salonId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(eq(appointments.salonId, salonId), eq(appointments.confirmationStatus, 'PENDING')));
    return result[0]?.count || 0;
  }

  private async getOpenCommandsCount(salonId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(commands)
      .where(and(eq(commands.salonId, salonId), eq(commands.status, 'OPEN')));
    return result[0]?.count || 0;
  }

  private async getTodayAppointmentsList(
    salonId: string,
    today: string,
  ): Promise<Array<{ time: string; clientName: string; serviceName: string; professionalName: string }>> {
    const result = await db
      .select({
        time: appointments.time,
        clientName: clients.name,
        service: appointments.service,
        professionalName: users.name,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(users, eq(appointments.professionalId, users.id))
      .where(
        and(
          eq(appointments.salonId, salonId),
          eq(appointments.date, today),
        ),
      )
      .orderBy(appointments.time);

    return result.map((a) => ({
      time: a.time || '--:--',
      clientName: a.clientName || 'Cliente',
      serviceName: a.service || 'Serviço',
      professionalName: a.professionalName || 'Profissional',
    }));
  }

  private async getBirthdayClients(
    salonId: string,
  ): Promise<Array<{ name: string; phone: string | null }>> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const result = await db
      .select({ name: clients.name, phone: clients.phone })
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          sql`EXTRACT(MONTH FROM ${clients.birthDate}) = ${month}`,
          sql`EXTRACT(DAY FROM ${clients.birthDate}) = ${day}`,
        ),
      );

    return result.map((c) => ({
      name: c.name || 'Cliente',
      phone: c.phone,
    }));
  }

  private async getStylistTodayAppointments(
    salonId: string,
    odela: string,
    today: string,
  ): Promise<Array<{ time: string; clientName: string; serviceName: string }>> {
    const result = await db
      .select({
        time: appointments.time,
        clientName: clients.name,
        service: appointments.service,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .where(
        and(
          eq(appointments.salonId, salonId),
          eq(appointments.professionalId, odela),
          eq(appointments.date, today),
        ),
      )
      .orderBy(appointments.time);

    return result.map((a) => ({
      time: a.time || '--:--',
      clientName: a.clientName || 'Cliente',
      serviceName: a.service || 'Serviço',
    }));
  }

  private async getStylistMonthRevenue(salonId: string, odela: string, since: Date): Promise<number> {
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${commandItems.totalPrice}), 0)` })
      .from(commandItems)
      .innerJoin(commands, eq(commandItems.commandId, commands.id))
      .where(
        and(
          eq(commands.salonId, salonId),
          eq(commands.status, 'CLOSED'),
          eq(commandItems.performerId, odela),
          gte(commands.cashierClosedAt, since),
        ),
      );
    return parseFloat(result[0]?.total || '0');
  }

  private async getStylistPendingCommission(salonId: string, odela: string): Promise<number> {
    const result = await db
      .select({ total: sql<string>`COALESCE(SUM(${commissions.commissionValue}), 0)` })
      .from(commissions)
      .where(
        and(
          eq(commissions.salonId, salonId),
          eq(commissions.professionalId, odela),
          eq(commissions.status, 'PENDING'),
        ),
      );
    return parseFloat(result[0]?.total || '0');
  }
}

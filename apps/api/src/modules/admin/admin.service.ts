import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, count, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '../../database/connection';
import {
  salons,
  salonSubscriptions,
  subscriptionInvoices,
  subscriptionEvents,
  plans,
  users,
} from '../../database/schema';
import { SalonSubscriptionsService } from '../subscriptions/salon-subscriptions.service';

export interface DashboardMetrics {
  totalSalons: number;
  activeSalons: number;
  activeSubscriptions: number;
  trialingSalons: number;
  suspendedSalons: number;
  mrr: number;
  arr: number;
  churnRate: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueThisMonth: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly subscriptionsService: SalonSubscriptionsService,
  ) {}

  /**
   * Get admin dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total salons
    const totalSalonsResult = await db
      .select({ count: count() })
      .from(salons);
    const totalSalons = totalSalonsResult[0].count;

    // Active salons
    const activeSalonsResult = await db
      .select({ count: count() })
      .from(salons)
      .where(eq(salons.active, true));
    const activeSalons = activeSalonsResult[0].count;

    // Active subscriptions
    const activeSubsResult = await db
      .select({ count: count() })
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.status, 'ACTIVE'));
    const activeSubscriptions = activeSubsResult[0].count;

    // Trialing salons
    const trialingResult = await db
      .select({ count: count() })
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.status, 'TRIALING'));
    const trialingSalons = trialingResult[0].count;

    // Suspended salons
    const suspendedResult = await db
      .select({ count: count() })
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.status, 'SUSPENDED'));
    const suspendedSalons = suspendedResult[0].count;

    // MRR calculation (sum of monthly revenue from active subscriptions)
    const mrrResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CASE WHEN ${salonSubscriptions.billingPeriod} = 'MONTHLY' THEN ${plans.priceMonthly}::numeric ELSE ${plans.priceYearly}::numeric / 12 END), 0)`,
      })
      .from(salonSubscriptions)
      .innerJoin(plans, eq(salonSubscriptions.planId, plans.id))
      .where(eq(salonSubscriptions.status, 'ACTIVE'));
    const mrr = Number(mrrResult[0]?.total || 0);

    // Pending invoices count
    const pendingInvoicesResult = await db
      .select({ count: count() })
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.status, 'PENDING'));
    const pendingInvoices = pendingInvoicesResult[0].count;

    // Overdue invoices count
    const overdueInvoicesResult = await db
      .select({ count: count() })
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.status, 'OVERDUE'));
    const overdueInvoices = overdueInvoicesResult[0].count;

    // Revenue this month (paid invoices)
    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${subscriptionInvoices.totalAmount}::numeric), 0)`,
      })
      .from(subscriptionInvoices)
      .where(
        and(
          eq(subscriptionInvoices.status, 'PAID'),
          gte(subscriptionInvoices.paidAt, startOfMonth),
          lte(subscriptionInvoices.paidAt, endOfMonth)
        )
      );
    const revenueThisMonth = Number(revenueResult[0]?.total || 0);

    return {
      totalSalons,
      activeSalons,
      activeSubscriptions,
      trialingSalons,
      suspendedSalons,
      mrr,
      arr: mrr * 12,
      churnRate: totalSalons > 0 ? (suspendedSalons / totalSalons) * 100 : 0,
      pendingInvoices,
      overdueInvoices,
      revenueThisMonth,
    };
  }

  /**
   * List all salons with subscription info
   */
  async listSalons(filters?: {
    status?: string;
    search?: string;
  }): Promise<any[]> {
    const conditions = [];

    if (filters?.status === 'active') {
      conditions.push(eq(salons.active, true));
    } else if (filters?.status === 'inactive') {
      conditions.push(eq(salons.active, false));
    }

    const result = await db
      .select({
        salon: salons,
        subscription: salonSubscriptions,
        plan: plans,
      })
      .from(salons)
      .leftJoin(salonSubscriptions, eq(salons.id, salonSubscriptions.salonId))
      .leftJoin(plans, eq(salonSubscriptions.planId, plans.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(salons.createdAt));

    // Filter by search if provided
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      return result.filter(
        (r: { salon: { name: string; email: string | null } }) =>
          r.salon.name.toLowerCase().includes(search) ||
          r.salon.email?.toLowerCase().includes(search)
      );
    }

    return result;
  }

  /**
   * Get salon details with full subscription info
   */
  async getSalonDetails(salonId: string): Promise<any> {
    const result = await db
      .select({
        salon: salons,
        subscription: salonSubscriptions,
        plan: plans,
      })
      .from(salons)
      .leftJoin(salonSubscriptions, eq(salons.id, salonSubscriptions.salonId))
      .leftJoin(plans, eq(salonSubscriptions.planId, plans.id))
      .where(eq(salons.id, salonId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Salão não encontrado');
    }

    // Get users count
    const usersResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.salonId, salonId));

    // Get invoices
    const invoices = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.salonId, salonId))
      .orderBy(desc(subscriptionInvoices.createdAt))
      .limit(10);

    // Get events
    let events: any[] = [];
    if (result[0].subscription) {
      events = await db
        .select()
        .from(subscriptionEvents)
        .where(eq(subscriptionEvents.subscriptionId, result[0].subscription.id))
        .orderBy(desc(subscriptionEvents.createdAt))
        .limit(20);
    }

    return {
      ...result[0],
      usersCount: usersResult[0].count,
      invoices,
      events,
    };
  }

  /**
   * Suspend a salon's subscription
   */
  async suspendSalon(salonId: string, reason?: string): Promise<void> {
    const subscription = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.salonId, salonId))
      .limit(1);

    if (subscription.length === 0) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    await db
      .update(salonSubscriptions)
      .set({
        status: 'SUSPENDED',
        notes: reason || 'Suspenso pelo administrador',
        updatedAt: new Date(),
      })
      .where(eq(salonSubscriptions.id, subscription[0].id));

    // Log event
    await db.insert(subscriptionEvents).values({
      subscriptionId: subscription[0].id,
      type: 'SUSPENDED',
      previousValue: subscription[0].status,
      newValue: 'SUSPENDED',
      metadata: { reason },
    });
  }

  /**
   * Activate a salon's subscription
   */
  async activateSalon(salonId: string): Promise<void> {
    const subscription = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.salonId, salonId))
      .limit(1);

    if (subscription.length === 0) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db
      .update(salonSubscriptions)
      .set({
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      })
      .where(eq(salonSubscriptions.id, subscription[0].id));

    // Log event
    await db.insert(subscriptionEvents).values({
      subscriptionId: subscription[0].id,
      type: 'REACTIVATED',
      previousValue: subscription[0].status,
      newValue: 'ACTIVE',
    });
  }

  /**
   * Update subscription manually
   */
  async updateSubscription(
    salonId: string,
    data: {
      planId?: string;
      status?: string;
      billingPeriod?: string;
      notes?: string;
    }
  ): Promise<void> {
    const subscription = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.salonId, salonId))
      .limit(1);

    if (subscription.length === 0) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.planId) updateData.planId = data.planId;
    if (data.status) updateData.status = data.status;
    if (data.billingPeriod) updateData.billingPeriod = data.billingPeriod;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await db
      .update(salonSubscriptions)
      .set(updateData)
      .where(eq(salonSubscriptions.id, subscription[0].id));
  }

  /**
   * List all subscriptions
   */
  async listSubscriptions(filters?: {
    status?: string;
    planId?: string;
  }): Promise<any[]> {
    return this.subscriptionsService.findAll(filters);
  }

  /**
   * List all invoices
   */
  async listInvoices(filters?: {
    status?: string;
    salonId?: string;
  }): Promise<any[]> {
    return this.subscriptionsService.findAllInvoices(filters);
  }

  /**
   * Mark invoice as paid manually
   */
  async markInvoiceAsPaid(invoiceId: string): Promise<void> {
    await this.subscriptionsService.markInvoiceAsPaid(invoiceId, {
      method: 'MANUAL',
    });
  }

  /**
   * Get all subscription events
   */
  async listEvents(filters?: {
    type?: string;
    subscriptionId?: string;
  }): Promise<any[]> {
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(subscriptionEvents.type, filters.type));
    }
    if (filters?.subscriptionId) {
      conditions.push(eq(subscriptionEvents.subscriptionId, filters.subscriptionId));
    }

    const result = await db
      .select({
        event: subscriptionEvents,
        subscription: salonSubscriptions,
        salon: salons,
      })
      .from(subscriptionEvents)
      .innerJoin(salonSubscriptions, eq(subscriptionEvents.subscriptionId, salonSubscriptions.id))
      .innerJoin(salons, eq(salonSubscriptions.salonId, salons.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(subscriptionEvents.createdAt))
      .limit(100);

    return result;
  }
}

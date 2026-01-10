import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../database/connection';
import {
  salonSubscriptions,
  subscriptionInvoices,
  invoicePayments,
  subscriptionEvents,
  plans,
  salons,
  SalonSubscription,
  SubscriptionInvoice,
  Plan,
} from '../../database/schema';
import {
  StartTrialDto,
  ChangePlanDto,
  CancelSubscriptionDto,
  PayInvoiceDto,
  InvoiceFiltersDto,
} from './dto';

@Injectable()
export class SalonSubscriptionsService {
  /**
   * Get current subscription for a salon
   */
  async getCurrentSubscription(salonId: string): Promise<{
    subscription: SalonSubscription | null;
    plan: Plan | null;
    limits: { users: number; clients: number };
  }> {
    try {
      // Primeiro busca a assinatura
      const subscriptionResult = await db
        .select()
        .from(salonSubscriptions)
        .where(eq(salonSubscriptions.salonId, salonId))
        .limit(1);

      if (subscriptionResult.length === 0) {
        return { subscription: null, plan: null, limits: { users: 1, clients: 50 } };
      }

      const subscription = subscriptionResult[0];

      // Depois busca o plano separadamente (evita problemas de INNER JOIN)
      let plan: Plan | null = null;
      if (subscription.planId) {
        const planResult = await db
          .select()
          .from(plans)
          .where(eq(plans.id, subscription.planId))
          .limit(1);
        plan = planResult[0] || null;
      }

      // Se não encontrar o plano, usa valores padrão
      const defaultLimits = { users: 1, clients: 50 };

      return {
        subscription,
        plan,
        limits: plan
          ? {
              users: subscription.maxUsersOverride || plan.maxUsers,
              clients: plan.maxClients,
            }
          : defaultLimits,
      };
    } catch (error) {
      // Em caso de erro no banco, retorna como se não tivesse assinatura
      console.error(`Erro ao buscar assinatura do salão ${salonId}:`, error);
      return { subscription: null, plan: null, limits: { users: 1, clients: 50 } };
    }
  }

  /**
   * Start trial for a new salon
   */
  async startTrial(salonId: string, dto: StartTrialDto, userId?: string): Promise<SalonSubscription> {
    // Check if subscription already exists
    const existing = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.salonId, salonId))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Salão já possui uma assinatura');
    }

    // Get plan
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, dto.planId))
      .limit(1);

    if (plan.length === 0) {
      throw new NotFoundException('Plano não encontrado');
    }

    const trialDays = dto.trialDays || plan[0].trialDays || 14;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    // Create subscription
    const result = await db
      .insert(salonSubscriptions)
      .values({
        salonId,
        planId: dto.planId,
        status: 'TRIALING',
        billingPeriod: 'MONTHLY',
        startsAt: now,
        trialEndsAt: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
      })
      .returning();

    // Log event
    await this.logEvent(result[0].id, 'CREATED', null, 'TRIALING', userId, {
      planId: dto.planId,
      trialDays,
    });

    return result[0];
  }

  /**
   * Change subscription plan
   */
  async changePlan(
    salonId: string,
    dto: ChangePlanDto,
    userId?: string
  ): Promise<SalonSubscription> {
    const { subscription, plan: currentPlan } = await this.getCurrentSubscription(salonId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    // Get new plan
    const newPlan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, dto.newPlanId))
      .limit(1);

    if (newPlan.length === 0) {
      throw new NotFoundException('Plano não encontrado');
    }

    const now = new Date();
    const billingPeriod = dto.billingPeriod || subscription.billingPeriod;
    const periodLength = billingPeriod === 'YEARLY' ? 365 : 30;
    const newPeriodEnd = new Date(now.getTime() + periodLength * 24 * 60 * 60 * 1000);

    const oldPlanId = subscription.planId;

    // Update subscription
    const result = await db
      .update(salonSubscriptions)
      .set({
        planId: dto.newPlanId,
        billingPeriod,
        status: subscription.status === 'TRIALING' ? 'TRIALING' : 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        updatedAt: now,
      })
      .where(eq(salonSubscriptions.id, subscription.id))
      .returning();

    // Log event
    await this.logEvent(subscription.id, 'PLAN_CHANGED', oldPlanId, dto.newPlanId, userId, {
      billingPeriod,
      oldPlanCode: currentPlan?.code,
      newPlanCode: newPlan[0].code,
    });

    return result[0];
  }

  /**
   * Cancel subscription
   */
  async cancel(
    salonId: string,
    dto: CancelSubscriptionDto,
    userId?: string
  ): Promise<SalonSubscription> {
    const { subscription } = await this.getCurrentSubscription(salonId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (subscription.status === 'CANCELED') {
      throw new BadRequestException('Assinatura já está cancelada');
    }

    const now = new Date();
    const cancelAtEnd = dto.cancelAtPeriodEnd !== false;

    const result = await db
      .update(salonSubscriptions)
      .set({
        cancelAtPeriodEnd: cancelAtEnd,
        canceledAt: cancelAtEnd ? null : now,
        status: cancelAtEnd ? subscription.status : 'CANCELED',
        notes: dto.reason ? `Motivo: ${dto.reason}` : subscription.notes,
        updatedAt: now,
      })
      .where(eq(salonSubscriptions.id, subscription.id))
      .returning();

    // Log event
    await this.logEvent(subscription.id, 'CANCELED', subscription.status, 'CANCELED', userId, {
      cancelAtPeriodEnd: cancelAtEnd,
      reason: dto.reason,
    });

    return result[0];
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivate(
    salonId: string,
    _dto: CancelSubscriptionDto,
    userId?: string
  ): Promise<SalonSubscription> {
    const { subscription } = await this.getCurrentSubscription(salonId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (subscription.status !== 'CANCELED' && !subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Assinatura não está cancelada');
    }

    const now = new Date();
    const periodLength = subscription.billingPeriod === 'YEARLY' ? 365 : 30;
    const newPeriodEnd = new Date(now.getTime() + periodLength * 24 * 60 * 60 * 1000);

    const result = await db
      .update(salonSubscriptions)
      .set({
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        canceledAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        updatedAt: now,
      })
      .where(eq(salonSubscriptions.id, subscription.id))
      .returning();

    // Log event
    await this.logEvent(subscription.id, 'REACTIVATED', 'CANCELED', 'ACTIVE', userId);

    return result[0];
  }

  /**
   * Get invoices for a salon
   */
  async getInvoices(salonId: string, filters?: InvoiceFiltersDto): Promise<SubscriptionInvoice[]> {
    const conditions = [eq(subscriptionInvoices.salonId, salonId)];

    if (filters?.status) {
      conditions.push(eq(subscriptionInvoices.status, filters.status));
    }
    if (filters?.startDate) {
      conditions.push(gte(subscriptionInvoices.dueDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(subscriptionInvoices.dueDate, filters.endDate));
    }

    const result = await db
      .select()
      .from(subscriptionInvoices)
      .where(and(...conditions))
      .orderBy(desc(subscriptionInvoices.createdAt));

    return result;
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string, salonId: string): Promise<SubscriptionInvoice> {
    const result = await db
      .select()
      .from(subscriptionInvoices)
      .where(
        and(
          eq(subscriptionInvoices.id, invoiceId),
          eq(subscriptionInvoices.salonId, salonId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Fatura não encontrada');
    }

    return result[0];
  }

  /**
   * Create invoice for subscription
   */
  async createInvoice(
    subscriptionId: string,
    salonId: string,
    amount: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SubscriptionInvoice> {
    // Generate invoice number
    const year = new Date().getFullYear();
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptionInvoices);
    const count = Number(countResult[0].count) + 1;
    const invoiceNumber = `INV-${year}-${String(count).padStart(6, '0')}`;

    // Due date is 5 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    const result = await db
      .insert(subscriptionInvoices)
      .values({
        subscriptionId,
        salonId,
        invoiceNumber,
        referencePeriodStart: periodStart,
        referencePeriodEnd: periodEnd,
        dueDate,
        totalAmount: String(amount),
        status: 'PENDING',
      })
      .returning();

    // Log event
    await this.logEvent(subscriptionId, 'INVOICE_CREATED', null, invoiceNumber, null, {
      amount,
      dueDate,
    });

    return result[0];
  }

  /**
   * Initiate payment for invoice
   */
  async initiatePayment(
    invoiceId: string,
    salonId: string,
    dto: PayInvoiceDto
  ): Promise<{
    invoice: SubscriptionInvoice;
    pixData?: { qrCode: string; qrCodeBase64: string; expiresAt: Date };
    checkoutUrl?: string;
  }> {
    const invoice = await this.getInvoiceById(invoiceId, salonId);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Fatura já está paga');
    }

    if (invoice.status === 'CANCELED') {
      throw new BadRequestException('Fatura cancelada');
    }

    // For now, simulate payment initiation
    // In production, this would call MercadoPago API
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min expiration

    if (dto.method === 'PIX') {
      // Generate mock PIX data (replace with real MP integration)
      const pixCode = `00020126580014br.gov.bcb.pix0136${invoice.id}520400005303986540${invoice.totalAmount}5802BR`;
      const pixQrCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // Placeholder

      const updated = await db
        .update(subscriptionInvoices)
        .set({
          paymentMethod: 'PIX',
          pixQrCode: pixCode,
          pixQrCodeBase64,
          pixExpiresAt: expiresAt,
          updatedAt: now,
        })
        .where(eq(subscriptionInvoices.id, invoiceId))
        .returning();

      return {
        invoice: updated[0],
        pixData: {
          qrCode: pixCode,
          qrCodeBase64: pixQrCodeBase64,
          expiresAt,
        },
      };
    }

    // For card payments, would redirect to checkout
    return {
      invoice,
      checkoutUrl: `/checkout/${invoiceId}`,
    };
  }

  /**
   * Mark invoice as paid (called from webhook or manually)
   */
  async markInvoiceAsPaid(
    invoiceId: string,
    paymentData?: {
      mercadoPagoPaymentId?: string;
      method?: string;
      amount?: number;
    }
  ): Promise<SubscriptionInvoice> {
    const result = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.id, invoiceId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException('Fatura não encontrada');
    }

    const invoice = result[0];
    const now = new Date();

    // Update invoice
    const updated = await db
      .update(subscriptionInvoices)
      .set({
        status: 'PAID',
        paidAt: now,
        mercadoPagoPaymentId: paymentData?.mercadoPagoPaymentId,
        updatedAt: now,
      })
      .where(eq(subscriptionInvoices.id, invoiceId))
      .returning();

    // Create payment record
    await db.insert(invoicePayments).values({
      invoiceId,
      amount: paymentData?.amount ? String(paymentData.amount) : invoice.totalAmount,
      method: paymentData?.method || invoice.paymentMethod || 'MANUAL',
      status: 'CONFIRMED',
      paidAt: now,
      mercadoPagoPaymentId: paymentData?.mercadoPagoPaymentId,
    });

    // Activate subscription if in trial or past_due
    const subscription = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.id, invoice.subscriptionId))
      .limit(1);

    if (subscription.length > 0) {
      const sub = subscription[0];
      if (sub.status === 'TRIALING' || sub.status === 'PAST_DUE') {
        const periodEnd = new Date(now);
        if (sub.billingPeriod === 'YEARLY') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await db
          .update(salonSubscriptions)
          .set({
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            updatedAt: now,
          })
          .where(eq(salonSubscriptions.id, sub.id));

        // Log event
        await this.logEvent(sub.id, 'INVOICE_PAID', 'PENDING', 'PAID', null, {
          invoiceId,
          amount: invoice.totalAmount,
        });
      }
    }

    return updated[0];
  }

  /**
   * Check subscription validity
   */
  async isSubscriptionValid(salonId: string): Promise<{
    valid: boolean;
    status: string;
    daysRemaining: number;
    message: string;
    canAccess: boolean;
  }> {
    const { subscription } = await this.getCurrentSubscription(salonId);

    if (!subscription) {
      return {
        valid: false,
        status: 'NO_SUBSCRIPTION',
        daysRemaining: 0,
        message: 'Nenhuma assinatura encontrada',
        canAccess: false,
      };
    }

    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    switch (subscription.status) {
      case 'ACTIVE':
        if (subscription.cancelAtPeriodEnd) {
          return {
            valid: true,
            status: 'ACTIVE_CANCELING',
            daysRemaining: Math.max(0, daysRemaining),
            message: `Assinatura será cancelada em ${periodEnd.toLocaleDateString('pt-BR')}`,
            canAccess: true,
          };
        }
        return {
          valid: true,
          status: 'ACTIVE',
          daysRemaining: Math.max(0, daysRemaining),
          message: 'Assinatura ativa',
          canAccess: true,
        };

      case 'TRIALING':
        const trialEnd = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : periodEnd;
        const trialDaysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (trialDaysRemaining > 0) {
          return {
            valid: true,
            status: 'TRIALING',
            daysRemaining: trialDaysRemaining,
            message: `Período de teste: ${trialDaysRemaining} dias restantes`,
            canAccess: true,
          };
        }
        return {
          valid: false,
          status: 'TRIAL_EXPIRED',
          daysRemaining: 0,
          message: 'Período de teste expirado',
          canAccess: false,
        };

      case 'PAST_DUE':
        // 7 day grace period
        const graceEnd = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        const graceDaysRemaining = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (graceDaysRemaining > 0) {
          return {
            valid: true,
            status: 'PAST_DUE',
            daysRemaining: graceDaysRemaining,
            message: `Pagamento pendente. ${graceDaysRemaining} dias para regularizar`,
            canAccess: true,
          };
        }
        return {
          valid: false,
          status: 'PAST_DUE_EXPIRED',
          daysRemaining: 0,
          message: 'Conta suspensa por falta de pagamento',
          canAccess: false,
        };

      case 'SUSPENDED':
        return {
          valid: false,
          status: 'SUSPENDED',
          daysRemaining: 0,
          message: 'Assinatura suspensa',
          canAccess: false,
        };

      case 'CANCELED':
        if (daysRemaining > 0) {
          return {
            valid: true,
            status: 'CANCELED',
            daysRemaining,
            message: `Assinatura cancelada. Acesso até ${periodEnd.toLocaleDateString('pt-BR')}`,
            canAccess: true,
          };
        }
        return {
          valid: false,
          status: 'CANCELED',
          daysRemaining: 0,
          message: 'Assinatura cancelada e expirada',
          canAccess: false,
        };

      default:
        return {
          valid: false,
          status: 'UNKNOWN',
          daysRemaining: 0,
          message: 'Status desconhecido',
          canAccess: false,
        };
    }
  }

  /**
   * Log subscription event
   */
  private async logEvent(
    subscriptionId: string,
    type: string,
    previousValue: any,
    newValue: any,
    performedById?: string | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await db.insert(subscriptionEvents).values({
      subscriptionId,
      type,
      previousValue: previousValue ? String(previousValue) : null,
      newValue: newValue ? String(newValue) : null,
      performedById: performedById || null,
      metadata: metadata || {},
    });
  }

  /**
   * Get subscription events
   */
  async getEvents(subscriptionId: string): Promise<any[]> {
    return db
      .select()
      .from(subscriptionEvents)
      .where(eq(subscriptionEvents.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionEvents.createdAt));
  }

  /**
   * Update subscription status (for jobs)
   */
  async updateStatus(subscriptionId: string, newStatus: string): Promise<void> {
    const result = await db
      .select()
      .from(salonSubscriptions)
      .where(eq(salonSubscriptions.id, subscriptionId))
      .limit(1);

    if (result.length === 0) return;

    const subscription = result[0];
    const oldStatus = subscription.status;

    await db
      .update(salonSubscriptions)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(salonSubscriptions.id, subscriptionId));

    await this.logEvent(subscriptionId, 'STATUS_CHANGED', oldStatus, newStatus);
  }

  /**
   * Get all subscriptions (for admin)
   */
  async findAll(filters?: {
    status?: string;
    planId?: string;
  }): Promise<any[]> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(salonSubscriptions.status, filters.status));
    }
    if (filters?.planId) {
      conditions.push(eq(salonSubscriptions.planId, filters.planId));
    }

    const result = await db
      .select({
        subscription: salonSubscriptions,
        plan: plans,
        salon: salons,
      })
      .from(salonSubscriptions)
      .innerJoin(plans, eq(salonSubscriptions.planId, plans.id))
      .innerJoin(salons, eq(salonSubscriptions.salonId, salons.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(salonSubscriptions.createdAt));

    return result;
  }

  /**
   * Get all invoices (for admin)
   */
  async findAllInvoices(filters?: {
    status?: string;
    salonId?: string;
  }): Promise<any[]> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(subscriptionInvoices.status, filters.status));
    }
    if (filters?.salonId) {
      conditions.push(eq(subscriptionInvoices.salonId, filters.salonId));
    }

    const result = await db
      .select({
        invoice: subscriptionInvoices,
        salon: salons,
      })
      .from(subscriptionInvoices)
      .innerJoin(salons, eq(subscriptionInvoices.salonId, salons.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(subscriptionInvoices.createdAt));

    return result;
  }
}

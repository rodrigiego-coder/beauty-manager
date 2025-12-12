import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';

@Injectable()
export class SubscriptionsService {
  constructor(
   @Inject('DATABASE_CONNECTION') private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Busca a assinatura ativa de um salão
   */
  async findBySalonId(salonId: string) {
    const result = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.salonId, salonId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Verifica se a assinatura está ativa e válida
   */
  async isSubscriptionValid(salonId: string): Promise<{
    valid: boolean;
    status: string;
    daysRemaining: number;
    message: string;
  }> {
    const subscription = await this.findBySalonId(salonId);

    if (!subscription) {
      return {
        valid: false,
        status: 'NO_SUBSCRIPTION',
        daysRemaining: 0,
        message: 'Nenhuma assinatura encontrada',
      };
    }

    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Verifica status da assinatura
    switch (subscription.status) {
      case 'ACTIVE':
        return {
          valid: true,
          status: 'ACTIVE',
          daysRemaining,
          message: 'Assinatura ativa',
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
          };
        }
        return {
          valid: false,
          status: 'TRIAL_EXPIRED',
          daysRemaining: 0,
          message: 'Período de teste expirado',
        };

      case 'PAST_DUE':
        // Permite acesso durante período de carência (7 dias)
        const gracePeriodEnd = subscription.gracePeriodEndsAt 
          ? new Date(subscription.gracePeriodEndsAt) 
          : new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        if (now < gracePeriodEnd) {
          const graceDaysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            valid: true,
            status: 'PAST_DUE',
            daysRemaining: graceDaysRemaining,
            message: `Pagamento pendente. ${graceDaysRemaining} dias para regularizar`,
          };
        }
        return {
          valid: false,
          status: 'SUSPENDED',
          daysRemaining: 0,
          message: 'Assinatura suspensa por falta de pagamento',
        };

      case 'CANCELED':
        // Permite acesso até o fim do período pago
        if (daysRemaining > 0) {
          return {
            valid: true,
            status: 'CANCELED',
            daysRemaining,
            message: `Assinatura cancelada. Acesso até ${periodEnd.toLocaleDateString('pt-BR')}`,
          };
        }
        return {
          valid: false,
          status: 'CANCELED',
          daysRemaining: 0,
          message: 'Assinatura cancelada',
        };

      case 'SUSPENDED':
        return {
          valid: false,
          status: 'SUSPENDED',
          daysRemaining: 0,
          message: 'Assinatura suspensa',
        };

      default:
        return {
          valid: false,
          status: 'UNKNOWN',
          daysRemaining: 0,
          message: 'Status de assinatura desconhecido',
        };
    }
  }

  /**
   * Cria uma nova assinatura para um salão
   */
  async create(data: {
    salonId: string;
    planId: number;
    trialDays?: number;
  }) {
    const now = new Date();
    const trialDays = data.trialDays ?? 7;
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const result = await this.db
      .insert(schema.subscriptions)
      .values({
        salonId: data.salonId,
        planId: data.planId,
        status: 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialEndsAt: trialEnd,
      })
      .returning();

    return result[0];
  }

  /**
   * Ativa a assinatura após pagamento
   */
  async activate(subscriptionId: number) {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    const result = await this.db
      .update(schema.subscriptions)
      .set({
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      })
      .where(eq(schema.subscriptions.id, subscriptionId))
      .returning();

    return result[0];
  }

  /**
   * Marca como pagamento atrasado
   */
  async markAsPastDue(subscriptionId: number) {
    const now = new Date();
    const gracePeriodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias de carência

    const result = await this.db
      .update(schema.subscriptions)
      .set({
        status: 'PAST_DUE',
        gracePeriodEndsAt: gracePeriodEnd,
        updatedAt: now,
      })
      .where(eq(schema.subscriptions.id, subscriptionId))
      .returning();

    return result[0];
  }

  /**
   * Suspende a assinatura
   */
  async suspend(subscriptionId: number) {
    const result = await this.db
      .update(schema.subscriptions)
      .set({
        status: 'SUSPENDED',
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, subscriptionId))
      .returning();

    return result[0];
  }

  /**
   * Cancela a assinatura
   */
  async cancel(subscriptionId: number) {
    const result = await this.db
      .update(schema.subscriptions)
      .set({
        status: 'CANCELED',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, subscriptionId))
      .returning();

    return result[0];
  }

  /**
   * Lista todos os planos disponíveis
   */
  async getPlans() {
    return this.db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.active, true));
  }

  /**
   * Busca um plano por ID
   */
  async getPlanById(planId: number) {
    const result = await this.db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.id, planId))
      .limit(1);

    return result[0] || null;
  }
}
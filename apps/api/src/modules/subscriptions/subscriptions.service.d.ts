import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
export declare class SubscriptionsService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    /**
     * Busca a assinatura ativa de um salão
     */
    findBySalonId(salonId: string): Promise<{
        id: number;
        salonId: string;
        planId: number;
        status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date | null;
        trialEndsAt: Date | null;
        gracePeriodEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Verifica se a assinatura está ativa e válida
     */
    isSubscriptionValid(salonId: string): Promise<{
        valid: boolean;
        status: string;
        daysRemaining: number;
        message: string;
    }>;
    /**
     * Cria uma nova assinatura para um salão
     */
    create(data: {
        salonId: string;
        planId: number;
        trialDays?: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        planId: number;
        status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";
        trialEndsAt: Date | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date | null;
        gracePeriodEndsAt: Date | null;
    } | undefined>;
    /**
     * Ativa a assinatura após pagamento
     */
    activate(subscriptionId: number): Promise<{
        id: number;
        salonId: string;
        planId: number;
        status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date | null;
        trialEndsAt: Date | null;
        gracePeriodEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * Marca como pagamento atrasado
     */
    markAsPastDue(subscriptionId: number): Promise<{
        id: number;
        salonId: string;
        planId: number;
        status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date | null;
        trialEndsAt: Date | null;
        gracePeriodEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * Suspende a assinatura
     */
    suspend(subscriptionId: number): Promise<{
        id: number;
        salonId: string;
        planId: number;
        status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date | null;
        trialEndsAt: Date | null;
        gracePeriodEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * Cancela a assinatura
     */
    cancel(subscriptionId: number): Promise<{
        id: number;
        salonId: string;
        planId: number;
        status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date | null;
        trialEndsAt: Date | null;
        gracePeriodEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    /**
     * Lista todos os planos disponíveis
     */
    getPlans(): Promise<{
        id: number;
        name: string;
        code: "FREE" | "BASIC" | "PRO" | "PREMIUM";
        description: string | null;
        monthlyPrice: string;
        yearlyPrice: string | null;
        features: schema.PlanFeatures;
        trialDays: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * Busca um plano por ID
     */
    getPlanById(planId: number): Promise<{
        id: number;
        name: string;
        code: "FREE" | "BASIC" | "PRO" | "PREMIUM";
        description: string | null;
        monthlyPrice: string;
        yearlyPrice: string | null;
        features: schema.PlanFeatures;
        trialDays: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
//# sourceMappingURL=subscriptions.service.d.ts.map
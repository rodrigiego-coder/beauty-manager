import { SalonSubscriptionsService } from './salon-subscriptions.service';
import { PlansService } from '../plans/plans.service';
import { StartTrialDto, ChangePlanDto, CancelSubscriptionDto, PayInvoiceDto, InvoiceFiltersDto } from './dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly plansService;
    constructor(subscriptionsService: SalonSubscriptionsService, plansService: PlansService);
    /**
     * GET /subscriptions/plans - Lista todos os planos disponiveis (público)
     */
    getPlans(): Promise<{
        id: string;
        name: string;
        code: string;
        description: string | null;
        priceMonthly: string;
        priceYearly: string | null;
        currency: string;
        maxUsers: number;
        maxClients: number;
        maxSalons: number;
        features: string[] | null;
        hasFiscal: boolean;
        hasAutomation: boolean;
        hasReports: boolean;
        hasAI: boolean;
        trialDays: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * GET /subscriptions/current - Retorna a assinatura atual do salao
     */
    getCurrentSubscription(user: any): Promise<{
        subscription: null;
        plan: null;
        limits: {
            users: number;
            clients: number;
        };
        usage: {
            usersCount: number;
            clientsCount: number;
        };
        status: {
            valid: boolean;
            status: string;
            message: string;
            canAccess: boolean;
        };
    } | {
        subscription: {
            id: string;
            salonId: string;
            planId: string;
            status: string;
            billingPeriod: string;
            startsAt: Date;
            trialEndsAt: Date | null;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
            canceledAt: Date | null;
        };
        plan: {
            id: string;
            code: string;
            name: string;
            description: string | null;
            priceMonthly: string;
            priceYearly: string | null;
            maxUsers: number;
            maxClients: number;
            features: string[] | null;
            hasFiscal: boolean;
            hasAutomation: boolean;
            hasReports: boolean;
            hasAI: boolean;
        } | null;
        limits: {
            users: number;
            clients: number;
        };
        usage: {
            usersCount: number;
            clientsCount: number;
        };
        status: {
            valid: boolean;
            status: string;
            daysRemaining: number;
            message: string;
            canAccess: boolean;
        };
    }>;
    /**
     * GET /subscriptions/status - Retorna o status da assinatura
     */
    getSubscriptionStatus(user: any): Promise<{
        valid: boolean;
        status: string;
        daysRemaining: number;
        message: string;
        canAccess: boolean;
    }>;
    /**
     * POST /subscriptions/start-trial - Iniciar periodo de teste
     */
    startTrial(user: any, dto: StartTrialDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        planId: string;
        status: string;
        billingPeriod: string;
        startsAt: Date;
        trialEndsAt: Date | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        canceledAt: Date | null;
        maxUsersOverride: number | null;
        mercadoPagoCustomerId: string | null;
        mercadoPagoSubscriptionId: string | null;
        notes: string | null;
    }>;
    /**
     * POST /subscriptions/change-plan - Trocar de plano
     */
    changePlan(user: any, dto: ChangePlanDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        planId: string;
        status: string;
        billingPeriod: string;
        startsAt: Date;
        trialEndsAt: Date | null;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        canceledAt: Date | null;
        maxUsersOverride: number | null;
        mercadoPagoCustomerId: string | null;
        mercadoPagoSubscriptionId: string | null;
        notes: string | null;
    }>;
    /**
     * POST /subscriptions/cancel - Cancelar assinatura
     */
    cancelSubscription(user: any, dto: CancelSubscriptionDto): Promise<{
        success: boolean;
        message: string;
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salonId: string;
            planId: string;
            status: string;
            billingPeriod: string;
            startsAt: Date;
            trialEndsAt: Date | null;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
            canceledAt: Date | null;
            maxUsersOverride: number | null;
            mercadoPagoCustomerId: string | null;
            mercadoPagoSubscriptionId: string | null;
            notes: string | null;
        };
    }>;
    /**
     * POST /subscriptions/reactivate - Reativar assinatura
     */
    reactivateSubscription(user: any, dto: CancelSubscriptionDto): Promise<{
        success: boolean;
        message: string;
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salonId: string;
            planId: string;
            status: string;
            billingPeriod: string;
            startsAt: Date;
            trialEndsAt: Date | null;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
            canceledAt: Date | null;
            maxUsersOverride: number | null;
            mercadoPagoCustomerId: string | null;
            mercadoPagoSubscriptionId: string | null;
            notes: string | null;
        };
    }>;
    /**
     * GET /subscriptions/invoices - Listar faturas
     */
    getInvoices(user: any, filters: InvoiceFiltersDto): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        subscriptionId: string;
        invoiceNumber: string;
        referencePeriodStart: Date;
        referencePeriodEnd: Date;
        dueDate: Date;
        totalAmount: string;
        paymentMethod: string | null;
        mercadoPagoPaymentId: string | null;
        mercadoPagoPreferenceId: string | null;
        pixQrCode: string | null;
        pixQrCodeBase64: string | null;
        pixExpiresAt: Date | null;
        paidAt: Date | null;
    }[]>;
    /**
     * GET /subscriptions/invoices/:id - Detalhes de uma fatura
     */
    getInvoice(user: any, invoiceId: string): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        salonId: string;
        status: string;
        subscriptionId: string;
        invoiceNumber: string;
        referencePeriodStart: Date;
        referencePeriodEnd: Date;
        dueDate: Date;
        totalAmount: string;
        paymentMethod: string | null;
        mercadoPagoPaymentId: string | null;
        mercadoPagoPreferenceId: string | null;
        pixQrCode: string | null;
        pixQrCodeBase64: string | null;
        pixExpiresAt: Date | null;
        paidAt: Date | null;
    }>;
    /**
     * POST /subscriptions/invoices/:id/pay - Iniciar pagamento
     */
    payInvoice(user: any, invoiceId: string, dto: PayInvoiceDto): Promise<{
        invoice: import("../../database").SubscriptionInvoice;
        pixData?: {
            qrCode: string;
            qrCodeBase64: string;
            expiresAt: Date;
        };
        checkoutUrl?: string;
    }>;
    /**
     * GET /subscriptions/events - Historico de eventos
     */
    getEvents(user: any): Promise<any[]>;
}
//# sourceMappingURL=subscriptions.controller.d.ts.map
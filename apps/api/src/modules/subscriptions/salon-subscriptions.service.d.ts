import { SalonSubscription, SubscriptionInvoice, Plan } from '../../database/schema';
import { StartTrialDto, ChangePlanDto, CancelSubscriptionDto, PayInvoiceDto, InvoiceFiltersDto } from './dto';
export declare class SalonSubscriptionsService {
    /**
     * Get current subscription for a salon
     */
    getCurrentSubscription(salonId: string): Promise<{
        subscription: SalonSubscription | null;
        plan: Plan | null;
        limits: {
            users: number;
            clients: number;
        };
        usage: {
            usersCount: number;
            clientsCount: number;
        };
    }>;
    /**
     * Start trial for a new salon
     */
    startTrial(salonId: string, dto: StartTrialDto, userId?: string): Promise<SalonSubscription>;
    /**
     * Change subscription plan
     */
    changePlan(salonId: string, dto: ChangePlanDto, userId?: string): Promise<SalonSubscription>;
    /**
     * Cancel subscription
     */
    cancel(salonId: string, dto: CancelSubscriptionDto, userId?: string): Promise<SalonSubscription>;
    /**
     * Reactivate a canceled subscription
     */
    reactivate(salonId: string, _dto: CancelSubscriptionDto, userId?: string): Promise<SalonSubscription>;
    /**
     * Get invoices for a salon
     */
    getInvoices(salonId: string, filters?: InvoiceFiltersDto): Promise<SubscriptionInvoice[]>;
    /**
     * Get invoice by ID
     */
    getInvoiceById(invoiceId: string, salonId: string): Promise<SubscriptionInvoice>;
    /**
     * Create invoice for subscription
     */
    createInvoice(subscriptionId: string, salonId: string, amount: number, periodStart: Date, periodEnd: Date): Promise<SubscriptionInvoice>;
    /**
     * Initiate payment for invoice
     */
    initiatePayment(invoiceId: string, salonId: string, dto: PayInvoiceDto): Promise<{
        invoice: SubscriptionInvoice;
        pixData?: {
            qrCode: string;
            qrCodeBase64: string;
            expiresAt: Date;
        };
        checkoutUrl?: string;
    }>;
    /**
     * Mark invoice as paid (called from webhook or manually)
     */
    markInvoiceAsPaid(invoiceId: string, paymentData?: {
        mercadoPagoPaymentId?: string;
        method?: string;
        amount?: number;
    }): Promise<SubscriptionInvoice>;
    /**
     * Check subscription validity
     */
    isSubscriptionValid(salonId: string): Promise<{
        valid: boolean;
        status: string;
        daysRemaining: number;
        message: string;
        canAccess: boolean;
    }>;
    /**
     * Log subscription event
     */
    private logEvent;
    /**
     * Get subscription events
     */
    getEvents(subscriptionId: string): Promise<any[]>;
    /**
     * Update subscription status (for jobs)
     */
    updateStatus(subscriptionId: string, newStatus: string): Promise<void>;
    /**
     * Get all subscriptions (for admin)
     */
    findAll(filters?: {
        status?: string;
        planId?: string;
    }): Promise<any[]>;
    /**
     * Get all invoices (for admin)
     */
    findAllInvoices(filters?: {
        status?: string;
        salonId?: string;
    }): Promise<any[]>;
}
//# sourceMappingURL=salon-subscriptions.service.d.ts.map
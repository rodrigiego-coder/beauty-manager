import { SalonSubscriptionsService } from '../subscriptions/salon-subscriptions.service';
import { AuditService } from '../audit/audit.service';
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
export declare class AdminService {
    private readonly subscriptionsService;
    private readonly auditService;
    constructor(subscriptionsService: SalonSubscriptionsService, auditService: AuditService);
    /**
     * Get admin dashboard metrics
     */
    getDashboardMetrics(): Promise<DashboardMetrics>;
    /**
     * List all salons with subscription info
     */
    listSalons(filters?: {
        status?: string;
        search?: string;
    }): Promise<any[]>;
    /**
     * Get salon details with full subscription info
     */
    getSalonDetails(salonId: string): Promise<any>;
    /**
     * Suspend a salon's subscription
     */
    suspendSalon(salonId: string, reason?: string, adminUserId?: string, ipAddress?: string): Promise<void>;
    /**
     * Activate a salon's subscription
     */
    activateSalon(salonId: string, adminUserId?: string, ipAddress?: string): Promise<void>;
    /**
     * Update subscription manually
     */
    updateSubscription(salonId: string, data: {
        planId?: string;
        status?: string;
        billingPeriod?: string;
        notes?: string;
    }): Promise<void>;
    /**
     * List all subscriptions
     */
    listSubscriptions(filters?: {
        status?: string;
        planId?: string;
    }): Promise<any[]>;
    /**
     * List all invoices
     */
    listInvoices(filters?: {
        status?: string;
        salonId?: string;
    }): Promise<any[]>;
    /**
     * Mark invoice as paid manually
     */
    markInvoiceAsPaid(invoiceId: string): Promise<void>;
    /**
     * Get all subscription events
     */
    listEvents(filters?: {
        type?: string;
        subscriptionId?: string;
    }): Promise<any[]>;
}
//# sourceMappingURL=admin.service.d.ts.map
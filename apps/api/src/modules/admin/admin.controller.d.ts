import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    /**
     * GET /admin/dashboard - Dashboard metrics
     */
    getDashboard(): Promise<import("./admin.service").DashboardMetrics>;
    /**
     * GET /admin/salons - List all salons
     */
    listSalons(status?: string, search?: string): Promise<any[]>;
    /**
     * GET /admin/salons/:id - Salon details
     */
    getSalonDetails(salonId: string): Promise<any>;
    /**
     * POST /admin/salons/:id/suspend - Suspend salon
     */
    suspendSalon(salonId: string, body: {
        reason?: string;
    }, adminUserId: string, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * POST /admin/salons/:id/activate - Activate salon
     */
    activateSalon(salonId: string, adminUserId: string, request: any): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * PATCH /admin/salons/:id/subscription - Update subscription manually
     */
    updateSubscription(salonId: string, body: {
        planId?: string;
        status?: string;
        billingPeriod?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * GET /admin/subscriptions - List all subscriptions
     */
    listSubscriptions(status?: string, planId?: string): Promise<any[]>;
    /**
     * GET /admin/invoices - List all invoices
     */
    listInvoices(status?: string, salonId?: string): Promise<any[]>;
    /**
     * POST /admin/invoices/:id/mark-paid - Mark invoice as paid
     */
    markInvoiceAsPaid(invoiceId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * GET /admin/events - List subscription events
     */
    listEvents(type?: string, subscriptionId?: string): Promise<any[]>;
}
//# sourceMappingURL=admin.controller.d.ts.map
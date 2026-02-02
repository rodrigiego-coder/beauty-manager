export declare class SubscriptionJobs {
    private readonly logger;
    /**
     * Check trial expirations - runs daily at 6 AM
     */
    checkTrialExpiration(): Promise<void>;
    /**
     * Check overdue invoices - runs daily at 7 AM
     */
    checkOverdueInvoices(): Promise<void>;
    /**
     * Suspend overdue subscriptions - runs daily at 8 AM
     * Suspends subscriptions that are PAST_DUE for more than 7 days
     */
    suspendOverdueSubscriptions(): Promise<void>;
    /**
     * Generate monthly invoices - runs on the 1st of each month at 1 AM
     */
    generateMonthlyInvoices(): Promise<void>;
    /**
     * Check for subscriptions ending soon (for yearly subscriptions) - runs weekly on Sunday at 10 AM
     */
    checkYearlyRenewals(): Promise<void>;
    /**
     * Process canceled subscriptions at period end - runs daily at midnight
     */
    processScheduledCancellations(): Promise<void>;
}
//# sourceMappingURL=subscription.jobs.d.ts.map
import { LoyaltyService } from './loyalty.service';
export declare class LoyaltyJobs {
    private readonly loyaltyService;
    private readonly logger;
    constructor(loyaltyService: LoyaltyService);
    /**
     * Processa pontos expirados diariamente às 2AM
     */
    processExpiredPoints(): Promise<void>;
    /**
     * Processa pontos de aniversário diariamente às 8AM
     */
    processBirthdayPoints(): Promise<void>;
    /**
     * Processa vouchers expirados diariamente às 3AM
     */
    processExpiredVouchers(): Promise<void>;
    /**
     * Gera relatório semanal (toda segunda às 7AM)
     */
    generateWeeklyReport(): Promise<void>;
}
//# sourceMappingURL=loyalty.jobs.d.ts.map
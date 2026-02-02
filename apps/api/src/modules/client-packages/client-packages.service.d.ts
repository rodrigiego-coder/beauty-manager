import { Database, ClientPackage, ClientPackageBalance, ClientPackageUsage } from '../../database';
/**
 * Balance with service details
 */
export interface BalanceWithService extends ClientPackageBalance {
    serviceName: string;
    servicePrice: string;
}
/**
 * Usage record with details
 */
export interface UsageWithDetails extends ClientPackageUsage {
    serviceName?: string;
    professionalName?: string;
}
/**
 * Client package with balances
 */
export interface ClientPackageWithBalances extends ClientPackage {
    packageName: string;
    balances: BalanceWithService[];
}
/**
 * DTO for consuming a session
 */
export interface ConsumeSessionDto {
    salonId: string;
    clientPackageId: number;
    serviceId: number;
    commandId?: string;
    commandItemId?: string;
    professionalId?: string;
    notes?: string;
}
export declare class ClientPackagesService {
    private db;
    constructor(db: Database);
    /**
     * List all packages for a client
     */
    findByClient(clientId: string): Promise<ClientPackage[]>;
    /**
     * List active packages with balances for a client
     */
    findActiveByClientWithBalances(clientId: string): Promise<ClientPackageWithBalances[]>;
    /**
     * Get balances for a client package with service details
     */
    getBalancesWithServices(clientPackageId: number): Promise<BalanceWithService[]>;
    /**
     * Find client package by ID
     */
    findById(id: number): Promise<ClientPackage | null>;
    /**
     * Find client package by ID with balances
     */
    findByIdWithBalances(id: number): Promise<ClientPackageWithBalances | null>;
    /**
     * Purchase a package for a client (creates balances for each service)
     */
    purchasePackage(clientId: string, packageId: number, salonId: string): Promise<ClientPackageWithBalances>;
    /**
     * Consume a session from a package (decrements balance, creates usage record)
     */
    consumeSession(data: ConsumeSessionDto): Promise<{
        balance: ClientPackageBalance;
        usage: ClientPackageUsage;
        message: string;
    }>;
    /**
     * Revert a consumed session (for cancellations/refunds)
     */
    revertSession(usageId: number, notes?: string): Promise<{
        balance: ClientPackageBalance;
        usage: ClientPackageUsage;
        message: string;
    }>;
    /**
     * Check if client has valid package for a specific service
     */
    hasValidPackageForService(clientId: string, serviceId: number): Promise<{
        hasPackage: boolean;
        clientPackage?: ClientPackage;
        balance?: ClientPackageBalance;
        remainingSessions?: number;
    }>;
    /**
     * Get usage history for a client package
     */
    getUsageHistory(clientPackageId: number): Promise<UsageWithDetails[]>;
    /**
     * Cancel a client package
     */
    cancel(id: number): Promise<ClientPackage | null>;
    /**
     * Get client statistics
     */
    getClientStats(clientId: string): Promise<{
        totalPackages: number;
        activePackages: number;
        totalSessionsUsed: number;
        totalSessionsRemaining: number;
    }>;
    /**
     * @deprecated Use findActiveByClientWithBalances instead
     */
    findActiveByClient(clientId: string): Promise<ClientPackage[]>;
    /**
     * @deprecated Use consumeSession instead
     */
    useSession(clientPackageId: number): Promise<{
        clientPackage: ClientPackage;
        message: string;
    }>;
}
//# sourceMappingURL=client-packages.service.d.ts.map
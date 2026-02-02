import { ClientPackagesService, ConsumeSessionDto } from './client-packages.service';
export declare class ClientPackagesController {
    private readonly clientPackagesService;
    constructor(clientPackagesService: ClientPackagesService);
    /**
     * GET /client-packages/client/:clientId
     * List all packages for a client
     */
    findByClient(clientId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        clientId: string;
        packageId: number;
        remainingSessions: number;
        purchaseDate: Date;
        expirationDate: string;
    }[]>;
    /**
     * GET /client-packages/client/:clientId/active
     * List active packages with balances for a client
     */
    findActiveByClient(clientId: string): Promise<import("./client-packages.service").ClientPackageWithBalances[]>;
    /**
     * GET /client-packages/client/:clientId/stats
     * Get client package statistics
     */
    getClientStats(clientId: string): Promise<{
        totalPackages: number;
        activePackages: number;
        totalSessionsUsed: number;
        totalSessionsRemaining: number;
    }>;
    /**
     * GET /client-packages/:id
     * Find client package by ID
     */
    findById(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        clientId: string;
        packageId: number;
        remainingSessions: number;
        purchaseDate: Date;
        expirationDate: string;
    }>;
    /**
     * GET /client-packages/:id/balances
     * Get balances for a client package
     */
    getBalances(id: number): Promise<import("./client-packages.service").ClientPackageWithBalances>;
    /**
     * GET /client-packages/:id/history
     * Get usage history for a client package
     */
    getUsageHistory(id: number): Promise<import("./client-packages.service").UsageWithDetails[]>;
    /**
     * POST /client-packages/purchase
     * Purchase a package for a client
     */
    purchase(data: {
        clientId: string;
        packageId: number;
        salonId: string;
    }): Promise<import("./client-packages.service").ClientPackageWithBalances>;
    /**
     * POST /client-packages/consume
     * Consume a session from a package
     */
    consumeSession(data: ConsumeSessionDto): Promise<{
        balance: import("../../database").ClientPackageBalance;
        usage: import("../../database").ClientPackageUsage;
        message: string;
    }>;
    /**
     * POST /client-packages/:id/use
     * Use a session from the package (legacy endpoint)
     * @deprecated Use POST /client-packages/consume instead
     */
    useSession(id: number): Promise<{
        clientPackage: import("../../database").ClientPackage;
        message: string;
    }>;
    /**
     * POST /client-packages/usages/:usageId/revert
     * Revert a consumed session
     */
    revertSession(usageId: number, data: {
        notes?: string;
    }): Promise<{
        balance: import("../../database").ClientPackageBalance;
        usage: import("../../database").ClientPackageUsage;
        message: string;
    }>;
    /**
     * POST /client-packages/check-service
     * Check if client has valid package for a service
     */
    checkService(data: {
        clientId: string;
        serviceId: number;
    }): Promise<{
        hasPackage: boolean;
        clientPackage?: import("../../database").ClientPackage;
        balance?: import("../../database").ClientPackageBalance;
        remainingSessions?: number;
    }>;
    /**
     * DELETE /client-packages/:id
     * Cancel a client package
     */
    cancel(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=client-packages.controller.d.ts.map
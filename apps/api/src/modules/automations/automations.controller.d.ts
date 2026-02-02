import { AutomationsService } from './automations.service';
export declare class AutomationsController {
    private readonly automationsService;
    constructor(automationsService: AutomationsService);
    /**
     * POST /automations/run
     * Executa todas as automações manualmente (para testes)
     */
    runManually(): Promise<{
        message: string;
        notifications: {
            lowStock: number;
            dueBills: number;
            churnRisk: number;
        };
    }>;
    /**
     * POST /automations/check-stock
     * Verifica estoque baixo manualmente
     */
    checkLowStock(): Promise<{
        message: string;
    }>;
    /**
     * POST /automations/check-bills
     * Verifica contas a vencer manualmente
     */
    checkDueBills(): Promise<{
        message: string;
    }>;
    /**
     * POST /automations/check-clients
     * Verifica clientes inativos manualmente
     */
    checkInactiveClients(): Promise<{
        message: string;
    }>;
    /**
     * POST /automations/remove-churn/:clientId
     * Remove flag de churn risk de um cliente
     */
    removeChurnRisk(clientId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=automations.controller.d.ts.map
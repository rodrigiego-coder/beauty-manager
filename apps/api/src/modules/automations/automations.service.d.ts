import { Database } from '../../database';
import { NotificationsService } from '../notifications';
export declare class AutomationsService {
    private db;
    private notificationsService;
    private readonly logger;
    constructor(db: Database, notificationsService: NotificationsService);
    /**
     * Cron Job: Roda todo dia às 08:00
     * - Verifica estoque baixo
     * - Verifica contas a vencer
     * - Identifica clientes inativos (churn risk)
     */
    runDailyAutomations(): Promise<void>;
    /**
     * Verifica produtos com estoque baixo
     */
    checkLowStock(): Promise<number>;
    /**
     * Verifica contas a pagar vencendo nos próximos 3 dias
     */
    checkDueBills(): Promise<number>;
    /**
     * Identifica clientes sem visita há mais de 60 dias e marca como churn risk
     */
    checkInactiveClients(): Promise<number>;
    /**
     * Marca cliente como risco de churn e cria notificação
     */
    private markAsChurnRisk;
    /**
     * Endpoint para rodar automações manualmente (para testes)
     */
    runManually(): Promise<{
        lowStock: number;
        dueBills: number;
        churnRisk: number;
    }>;
    /**
     * Remove flag de churn risk de um cliente (quando ele volta)
     */
    removeChurnRisk(clientId: string): Promise<void>;
}
//# sourceMappingURL=automations.service.d.ts.map
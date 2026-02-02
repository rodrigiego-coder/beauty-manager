import { ProductSubscriptionsService } from './product-subscriptions.service';
export declare class ProductSubscriptionsJobs {
    private readonly service;
    constructor(service: ProductSubscriptionsService);
    /**
     * Job diario as 06:00 - Processa entregas do dia
     * Cria registros de entrega para assinaturas com nextDeliveryDate = hoje
     */
    processDailyDeliveries(): Promise<void>;
    /**
     * Job diario as 08:00 - Envia lembretes de entrega
     * Notifica clientes sobre entregas do dia
     */
    sendDeliveryReminders(): Promise<void>;
    /**
     * Job diario a meia-noite - Verifica assinaturas expiradas
     */
    checkExpiredSubscriptions(): Promise<void>;
}
//# sourceMappingURL=product-subscriptions.jobs.d.ts.map
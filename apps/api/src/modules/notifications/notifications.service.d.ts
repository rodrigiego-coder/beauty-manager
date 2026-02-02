import { Database, Notification, NewNotification } from '../../database';
export declare class NotificationsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todas as notificações
     */
    findAll(): Promise<Notification[]>;
    /**
     * Lista notificações não lidas
     */
    findUnread(): Promise<Notification[]>;
    /**
     * Conta notificações não lidas
     */
    countUnread(): Promise<number>;
    /**
     * Busca notificação por ID
     */
    findById(id: number): Promise<Notification | null>;
    /**
     * Cria uma nova notificação
     */
    create(data: NewNotification): Promise<Notification>;
    /**
     * Marca notificação como lida
     */
    markAsRead(id: number): Promise<Notification | null>;
    /**
     * Marca todas como lidas
     */
    markAllAsRead(): Promise<number>;
    /**
     * Remove notificação
     */
    delete(id: number): Promise<boolean>;
    /**
     * Remove notificações antigas (mais de 30 dias)
     */
    cleanOld(): Promise<number>;
    /**
     * Cria notificação de estoque baixo
     */
    createStockLowNotification(productId: number, productName: string, currentStock: number, minStock: number): Promise<Notification>;
    /**
     * Cria notificação de cliente inativo
     */
    createClientInactiveNotification(clientId: string, clientName: string, daysSinceLastVisit: number): Promise<Notification>;
    /**
     * Cria notificação de conta a pagar vencendo
     */
    createBillDueNotification(billId: number, supplierName: string, amount: string, dueDate: string): Promise<Notification>;
    /**
     * Cria notificação de risco de churn
     */
    createChurnRiskNotification(clientId: string, clientName: string): Promise<Notification>;
}
//# sourceMappingURL=notifications.service.d.ts.map
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    /**
     * GET /notifications
     * Lista todas as notificações
     */
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        salonId: string | null;
        type: "STOCK_LOW" | "CLIENT_INACTIVE" | "BILL_DUE" | "APPOINTMENT_REMINDER" | "CHURN_RISK";
        title: string;
        referenceType: string | null;
        referenceId: string | null;
        message: string;
        read: boolean;
    }[]>;
    /**
     * GET /notifications/unread
     * Lista notificações não lidas
     */
    findUnread(): Promise<{
        id: number;
        createdAt: Date;
        salonId: string | null;
        type: "STOCK_LOW" | "CLIENT_INACTIVE" | "BILL_DUE" | "APPOINTMENT_REMINDER" | "CHURN_RISK";
        title: string;
        referenceType: string | null;
        referenceId: string | null;
        message: string;
        read: boolean;
    }[]>;
    /**
     * GET /notifications/count
     * Conta notificações não lidas
     */
    countUnread(): Promise<{
        unreadCount: number;
    }>;
    /**
     * GET /notifications/:id
     * Busca notificação por ID
     */
    findById(id: number): Promise<{
        id: number;
        createdAt: Date;
        salonId: string | null;
        type: "STOCK_LOW" | "CLIENT_INACTIVE" | "BILL_DUE" | "APPOINTMENT_REMINDER" | "CHURN_RISK";
        title: string;
        referenceType: string | null;
        referenceId: string | null;
        message: string;
        read: boolean;
    }>;
    /**
     * PATCH /notifications/:id/read
     * Marca notificação como lida
     */
    markAsRead(id: number): Promise<{
        id: number;
        createdAt: Date;
        salonId: string | null;
        type: "STOCK_LOW" | "CLIENT_INACTIVE" | "BILL_DUE" | "APPOINTMENT_REMINDER" | "CHURN_RISK";
        title: string;
        referenceType: string | null;
        referenceId: string | null;
        message: string;
        read: boolean;
    }>;
    /**
     * POST /notifications/read-all
     * Marca todas como lidas
     */
    markAllAsRead(): Promise<{
        message: string;
    }>;
    /**
     * DELETE /notifications/:id
     * Remove notificação
     */
    delete(id: number): Promise<{
        message: string;
    }>;
    /**
     * POST /notifications/clean
     * Remove notificações antigas (mais de 30 dias)
     */
    cleanOld(): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notifications.controller.d.ts.map
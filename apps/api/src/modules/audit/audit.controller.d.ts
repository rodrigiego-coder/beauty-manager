import { AuditService, AuditAction } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    /**
     * GET /audit/salon/:salonId
     * Lista todos os logs de auditoria de um salão
     */
    findBySalon(salonId: string): Promise<{
        id: number;
        salonId: string | null;
        metadata: Record<string, unknown> | null;
        userId: string | null;
        userName: string | null;
        userRole: string | null;
        action: "DELETE" | "CREATE" | "UPDATE" | "PUBLIC_ACCESS" | "TOKEN_VALIDATED" | "WHATSAPP_SENT" | "WHATSAPP_FAILED" | "CRITICAL_OVERRIDE" | "STOCK_CONSUMED";
        entity: string;
        entityId: string;
        oldValues: Record<string, unknown> | null;
        newValues: Record<string, unknown> | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
    /**
     * GET /audit/entity/:entity
     * Lista logs de auditoria por entidade (opcionalmente filtrando por entityId)
     */
    findByEntity(entity: string, entityId?: string): Promise<{
        id: number;
        salonId: string | null;
        metadata: Record<string, unknown> | null;
        userId: string | null;
        userName: string | null;
        userRole: string | null;
        action: "DELETE" | "CREATE" | "UPDATE" | "PUBLIC_ACCESS" | "TOKEN_VALIDATED" | "WHATSAPP_SENT" | "WHATSAPP_FAILED" | "CRITICAL_OVERRIDE" | "STOCK_CONSUMED";
        entity: string;
        entityId: string;
        oldValues: Record<string, unknown> | null;
        newValues: Record<string, unknown> | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
    /**
     * GET /audit/user/:userId
     * Lista logs de auditoria por usuário
     */
    findByUser(userId: string): Promise<{
        id: number;
        salonId: string | null;
        metadata: Record<string, unknown> | null;
        userId: string | null;
        userName: string | null;
        userRole: string | null;
        action: "DELETE" | "CREATE" | "UPDATE" | "PUBLIC_ACCESS" | "TOKEN_VALIDATED" | "WHATSAPP_SENT" | "WHATSAPP_FAILED" | "CRITICAL_OVERRIDE" | "STOCK_CONSUMED";
        entity: string;
        entityId: string;
        oldValues: Record<string, unknown> | null;
        newValues: Record<string, unknown> | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
    /**
     * GET /audit/period
     * Lista logs de auditoria por período
     */
    findByPeriod(startDate: string, endDate: string, salonId?: string): Promise<{
        id: number;
        salonId: string | null;
        metadata: Record<string, unknown> | null;
        userId: string | null;
        userName: string | null;
        userRole: string | null;
        action: "DELETE" | "CREATE" | "UPDATE" | "PUBLIC_ACCESS" | "TOKEN_VALIDATED" | "WHATSAPP_SENT" | "WHATSAPP_FAILED" | "CRITICAL_OVERRIDE" | "STOCK_CONSUMED";
        entity: string;
        entityId: string;
        oldValues: Record<string, unknown> | null;
        newValues: Record<string, unknown> | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
    /**
     * GET /audit/action/:action
     * Lista logs de auditoria por tipo de ação
     */
    findByAction(action: AuditAction, salonId?: string): Promise<{
        id: number;
        salonId: string | null;
        metadata: Record<string, unknown> | null;
        userId: string | null;
        userName: string | null;
        userRole: string | null;
        action: "DELETE" | "CREATE" | "UPDATE" | "PUBLIC_ACCESS" | "TOKEN_VALIDATED" | "WHATSAPP_SENT" | "WHATSAPP_FAILED" | "CRITICAL_OVERRIDE" | "STOCK_CONSUMED";
        entity: string;
        entityId: string;
        oldValues: Record<string, unknown> | null;
        newValues: Record<string, unknown> | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
    /**
     * GET /audit/history/:entity/:entityId
     * Busca histórico completo de alterações de um registro específico
     */
    getEntityHistory(entity: string, entityId: string): Promise<{
        id: number;
        salonId: string | null;
        metadata: Record<string, unknown> | null;
        userId: string | null;
        userName: string | null;
        userRole: string | null;
        action: "DELETE" | "CREATE" | "UPDATE" | "PUBLIC_ACCESS" | "TOKEN_VALIDATED" | "WHATSAPP_SENT" | "WHATSAPP_FAILED" | "CRITICAL_OVERRIDE" | "STOCK_CONSUMED";
        entity: string;
        entityId: string;
        oldValues: Record<string, unknown> | null;
        newValues: Record<string, unknown> | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
}
//# sourceMappingURL=audit.controller.d.ts.map
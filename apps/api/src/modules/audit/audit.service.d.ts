import { Database } from '../../database/database.module';
import { AuditLog } from '../../database/schema';
/**
 * Tipos de entidade auditáveis
 */
export type AuditEntityType = 'triage' | 'appointment' | 'command' | 'notification' | 'stock' | 'client' | 'service' | 'user' | 'salon' | 'recipe' | 'override' | 'clients' | 'products' | 'transactions' | 'appointments' | 'accounts-payable' | 'accounts-receivable' | 'users' | 'packages' | 'client-packages';
/**
 * Ações de auditoria (compatível com enum do banco)
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLIC_ACCESS' | 'TOKEN_VALIDATED' | 'WHATSAPP_SENT' | 'WHATSAPP_FAILED' | 'CRITICAL_OVERRIDE' | 'STOCK_CONSUMED';
/**
 * Interface para parâmetros de log de auditoria
 * Mantém compatibilidade com código existente (entity, oldValues, newValues)
 * E também aceita novos nomes (entityType, before, after)
 */
export interface AuditLogParams {
    salonId?: string;
    entity?: string;
    entityType?: AuditEntityType;
    entityId?: string;
    action: AuditAction | string;
    userId?: string;
    userName?: string;
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    before?: Record<string, any>;
    after?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class AuditService {
    private db;
    private readonly logger;
    constructor(db: Database);
    /**
     * Registra uma ação de auditoria no banco de dados
     * IMPORTANTE: Este método NUNCA deve lançar exceções para não interromper operações
     */
    log(params: AuditLogParams): Promise<AuditLog | null>;
    /**
     * Log simplificado para acesso público (triagem, etc.)
     */
    logPublicAccess(params: {
        salonId: string;
        entityType: AuditEntityType;
        entityId: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Log para envio de WhatsApp
     */
    logWhatsAppSent(params: {
        salonId: string;
        notificationId: string;
        appointmentId?: string;
        recipientPhone: string;
        notificationType: string;
        providerId?: string;
        success: boolean;
        error?: string;
    }): Promise<void>;
    /**
     * Log para override de triagem com risco crítico
     */
    logCriticalOverride(params: {
        salonId: string;
        triageId: string;
        appointmentId: string;
        userId: string;
        userName: string;
        userRole: string;
        ipAddress?: string;
        reason: string;
        riskLevel: string;
        blockers: string[];
    }): Promise<void>;
    /**
     * Log para consumo de estoque
     */
    logStockConsumption(params: {
        salonId: string;
        productId: number;
        commandItemId: string;
        quantityConsumed: number;
        stockBefore: number;
        stockAfter: number;
        recipeVersion?: number;
    }): Promise<void>;
    /**
     * Busca histórico de uma entidade específica
     */
    getEntityHistory(entity: string, entityId: string): Promise<AuditLog[]>;
    /**
     * Busca logs por entidade (opcionalmente filtrando por entityId)
     * Usado pelo controller para API REST
     */
    findByEntity(entity: string, entityId?: string, limit?: number): Promise<AuditLog[]>;
    /**
     * Busca logs por salão
     */
    findBySalon(salonId: string, limit?: number): Promise<AuditLog[]>;
    /**
     * Busca logs por usuário
     */
    findByUser(userId: string, limit?: number): Promise<AuditLog[]>;
    /**
     * Busca logs por tipo de ação
     */
    findByAction(action: string, salonId?: string, limit?: number): Promise<AuditLog[]>;
    /**
     * Busca logs por período
     */
    findByPeriod(startDate: Date, endDate: Date, salonId?: string, limit?: number): Promise<AuditLog[]>;
    /**
     * Busca overrides críticos (para relatórios de compliance)
     */
    findCriticalOverrides(salonId: string, startDate?: Date): Promise<AuditLog[]>;
}
//# sourceMappingURL=audit.service.d.ts.map
import { Injectable, Inject, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import { auditLogs, AuditLog } from '../../database/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

/**
 * Tipos de entidade auditáveis
 */
export type AuditEntityType =
  | 'triage'
  | 'appointment'
  | 'command'
  | 'notification'
  | 'stock'
  | 'client'
  | 'service'
  | 'user'
  | 'salon'
  | 'recipe'
  | 'override'
  | 'clients'
  | 'products'
  | 'transactions'
  | 'appointments'
  | 'accounts-payable'
  | 'accounts-receivable'
  | 'users'
  | 'packages'
  | 'client-packages';

/**
 * Ações de auditoria (compatível com enum do banco)
 */
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLIC_ACCESS'
  | 'TOKEN_VALIDATED'
  | 'WHATSAPP_SENT'
  | 'WHATSAPP_FAILED'
  | 'CRITICAL_OVERRIDE'
  | 'STOCK_CONSUMED';

/**
 * Interface para parâmetros de log de auditoria
 * Mantém compatibilidade com código existente (entity, oldValues, newValues)
 * E também aceita novos nomes (entityType, before, after)
 */
export interface AuditLogParams {
  salonId?: string;
  // Entidade - aceita ambos os nomes
  entity?: string;
  entityType?: AuditEntityType;
  entityId?: string;
  // Ação
  action: AuditAction | string;
  // Usuário
  userId?: string;
  userName?: string;
  userRole?: string;
  // Rastreabilidade
  ipAddress?: string;
  userAgent?: string;
  // Valores - aceita ambos os nomes
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
  // Metadados extras
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  /**
   * Registra uma ação de auditoria no banco de dados
   * IMPORTANTE: Este método NUNCA deve lançar exceções para não interromper operações
   */
  async log(params: AuditLogParams): Promise<AuditLog | null> {
    try {
      // Normaliza os nomes dos campos para compatibilidade
      const entity = params.entity || params.entityType || 'unknown';
      const oldValues = params.oldValues || params.before;
      const newValues = params.newValues || params.after;

      const [result] = await this.db
        .insert(auditLogs)
        .values({
          salonId: params.salonId,
          userId: params.userId,
          userName: params.userName,
          userRole: params.userRole,
          action: params.action as any,
          entity,
          entityId: params.entityId || 'unknown',
          oldValues,
          newValues,
          metadata: params.metadata,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        })
        .returning();

      return result;
    } catch (error) {
      // Audit log NUNCA deve quebrar a operação principal
      this.logger.error(`Falha ao registrar audit log: ${error}`, {
        entity: params.entity || params.entityType,
        action: params.action,
        entityId: params.entityId,
      });
      return null;
    }
  }

  /**
   * Log simplificado para acesso público (triagem, etc.)
   */
  async logPublicAccess(params: {
    salonId: string;
    entityType: AuditEntityType;
    entityId: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      salonId: params.salonId,
      entity: params.entityType,
      entityId: params.entityId,
      action: 'PUBLIC_ACCESS',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata,
    });
  }

  /**
   * Log para envio de WhatsApp
   */
  async logWhatsAppSent(params: {
    salonId: string;
    notificationId: string;
    appointmentId?: string;
    recipientPhone: string;
    notificationType: string;
    providerId?: string;
    success: boolean;
    error?: string;
  }): Promise<void> {
    await this.log({
      salonId: params.salonId,
      entity: 'notification',
      entityId: params.notificationId,
      action: params.success ? 'WHATSAPP_SENT' : 'WHATSAPP_FAILED',
      metadata: {
        appointmentId: params.appointmentId,
        recipientPhone: params.recipientPhone.substring(0, 6) + '***', // Mascara telefone
        notificationType: params.notificationType,
        providerId: params.providerId,
        error: params.error,
      },
    });
  }

  /**
   * Log para override de triagem com risco crítico
   */
  async logCriticalOverride(params: {
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
  }): Promise<void> {
    await this.log({
      salonId: params.salonId,
      entity: 'override',
      entityId: params.triageId,
      action: 'CRITICAL_OVERRIDE',
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      ipAddress: params.ipAddress,
      oldValues: { blocked: true },
      newValues: { blocked: false },
      metadata: {
        appointmentId: params.appointmentId,
        reason: params.reason,
        riskLevel: params.riskLevel,
        blockers: params.blockers,
      },
    });
  }

  /**
   * Log para consumo de estoque
   */
  async logStockConsumption(params: {
    salonId: string;
    productId: number;
    commandItemId: string;
    quantityConsumed: number;
    stockBefore: number;
    stockAfter: number;
    recipeVersion?: number;
  }): Promise<void> {
    await this.log({
      salonId: params.salonId,
      entity: 'stock',
      entityId: params.productId.toString(),
      action: 'STOCK_CONSUMED',
      oldValues: { stockInternal: params.stockBefore },
      newValues: { stockInternal: params.stockAfter },
      metadata: {
        commandItemId: params.commandItemId,
        quantityConsumed: params.quantityConsumed,
        recipeVersion: params.recipeVersion,
      },
    });
  }

  // ==================== QUERIES ====================

  /**
   * Busca histórico de uma entidade específica
   */
  async getEntityHistory(entity: string, entityId: string): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entity, entity),
          eq(auditLogs.entityId, entityId),
        ),
      )
      .orderBy(desc(auditLogs.timestamp));
  }

  /**
   * Busca logs por entidade (opcionalmente filtrando por entityId)
   * Usado pelo controller para API REST
   */
  async findByEntity(entity: string, entityId?: string, limit = 100): Promise<AuditLog[]> {
    const conditions = [eq(auditLogs.entity, entity)];

    if (entityId) {
      conditions.push(eq(auditLogs.entityId, entityId));
    }

    return this.db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Busca logs por salão
   */
  async findBySalon(salonId: string, limit = 100): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.salonId, salonId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Busca logs por usuário
   */
  async findByUser(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Busca logs por tipo de ação
   */
  async findByAction(action: string, salonId?: string, limit = 100): Promise<AuditLog[]> {
    const conditions = [eq(auditLogs.action, action as any)];

    if (salonId) {
      conditions.push(eq(auditLogs.salonId, salonId));
    }

    return this.db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Busca logs por período
   */
  async findByPeriod(
    startDate: Date,
    endDate: Date,
    salonId?: string,
    limit = 500,
  ): Promise<AuditLog[]> {
    const conditions = [
      gte(auditLogs.timestamp, startDate),
      lte(auditLogs.timestamp, endDate),
    ];

    if (salonId) {
      conditions.push(eq(auditLogs.salonId, salonId));
    }

    return this.db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  /**
   * Busca overrides críticos (para relatórios de compliance)
   */
  async findCriticalOverrides(salonId: string, startDate?: Date): Promise<AuditLog[]> {
    const conditions = [
      eq(auditLogs.salonId, salonId),
      eq(auditLogs.action, 'CRITICAL_OVERRIDE' as any),
    ];

    if (startDate) {
      conditions.push(gte(auditLogs.timestamp, startDate));
    }

    return this.db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp));
  }
}

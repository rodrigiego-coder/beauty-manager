import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import { auditLogs, AuditLog } from '../../database/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogData {
  salonId?: string;
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  /**
   * Registra uma ação de auditoria no banco de dados
   */
  async log(data: AuditLogData): Promise<AuditLog> {
    const [result] = await this.db
      .insert(auditLogs)
      .values({
        salonId: data.salonId,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      })
      .returning();

    return result;
  }

  /**
   * Busca todos os logs de auditoria de um salão
   */
  async findBySalon(salonId: string): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.salonId, salonId))
      .orderBy(desc(auditLogs.timestamp));
  }

  /**
   * Busca logs de auditoria por entidade específica
   */
  async findByEntity(entity: string, entityId?: string): Promise<AuditLog[]> {
    if (entityId) {
      return this.db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.entity, entity), eq(auditLogs.entityId, entityId)))
        .orderBy(desc(auditLogs.timestamp));
    }

    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entity, entity))
      .orderBy(desc(auditLogs.timestamp));
  }

  /**
   * Busca logs de auditoria por usuário
   */
  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp));
  }

  /**
   * Busca logs de auditoria por período
   */
  async findByPeriod(startDate: Date, endDate: Date, salonId?: string): Promise<AuditLog[]> {
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
      .orderBy(desc(auditLogs.timestamp));
  }

  /**
   * Busca logs de auditoria por tipo de ação
   */
  async findByAction(action: AuditAction, salonId?: string): Promise<AuditLog[]> {
    const conditions = [eq(auditLogs.action, action)];

    if (salonId) {
      conditions.push(eq(auditLogs.salonId, salonId));
    }

    return this.db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp));
  }

  /**
   * Busca histórico completo de alterações de um registro específico
   */
  async getEntityHistory(entity: string, entityId: string): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entity, entity), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.timestamp));
  }
}

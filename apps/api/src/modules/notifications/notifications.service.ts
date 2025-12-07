import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, notifications, Notification, NewNotification } from '../../database';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todas as notificações
   */
  async findAll(): Promise<Notification[]> {
    return this.db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Lista notificações não lidas
   */
  async findUnread(): Promise<Notification[]> {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.read, false))
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Conta notificações não lidas
   */
  async countUnread(): Promise<number> {
    const unread = await this.findUnread();
    return unread.length;
  }

  /**
   * Busca notificação por ID
   */
  async findById(id: number): Promise<Notification | null> {
    const result = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria uma nova notificação
   */
  async create(data: NewNotification): Promise<Notification> {
    const result = await this.db
      .insert(notifications)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(id: number): Promise<Notification | null> {
    const result = await this.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(): Promise<number> {
    const result = await this.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.read, false))
      .returning();

    return result.length;
  }

  /**
   * Remove notificação
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Remove notificações antigas (mais de 30 dias)
   */
  async cleanOld(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const all = await this.findAll();
    const oldNotifications = all.filter(n => new Date(n.createdAt) < thirtyDaysAgo);

    for (const notification of oldNotifications) {
      await this.delete(notification.id);
    }

    return oldNotifications.length;
  }

  /**
   * Cria notificação de estoque baixo
   */
  async createStockLowNotification(
    productId: number,
    productName: string,
    currentStock: number,
    minStock: number,
  ): Promise<Notification> {
    return this.create({
      type: 'STOCK_LOW',
      title: 'Estoque Baixo',
      message: `O produto "${productName}" está com estoque baixo: ${currentStock} unidades (mínimo: ${minStock})`,
      referenceId: productId.toString(),
      referenceType: 'product',
    });
  }

  /**
   * Cria notificação de cliente inativo
   */
  async createClientInactiveNotification(
    clientId: string,
    clientName: string,
    daysSinceLastVisit: number,
  ): Promise<Notification> {
    return this.create({
      type: 'CLIENT_INACTIVE',
      title: 'Cliente Inativo',
      message: `O cliente "${clientName || 'Sem nome'}" não visita o salão há ${daysSinceLastVisit} dias`,
      referenceId: clientId,
      referenceType: 'client',
    });
  }

  /**
   * Cria notificação de conta a pagar vencendo
   */
  async createBillDueNotification(
    billId: number,
    supplierName: string,
    amount: string,
    dueDate: string,
  ): Promise<Notification> {
    return this.create({
      type: 'BILL_DUE',
      title: 'Conta a Vencer',
      message: `Conta de "${supplierName}" no valor de R$ ${amount} vence em ${dueDate}`,
      referenceId: billId.toString(),
      referenceType: 'bill',
    });
  }

  /**
   * Cria notificação de risco de churn
   */
  async createChurnRiskNotification(
    clientId: string,
    clientName: string,
  ): Promise<Notification> {
    return this.create({
      type: 'CHURN_RISK',
      title: 'Risco de Perda de Cliente',
      message: `O cliente "${clientName || 'Sem nome'}" foi marcado como risco de churn. Considere entrar em contato.`,
      referenceId: clientId,
      referenceType: 'client',
    });
  }
}

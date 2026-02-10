import { Injectable, Inject } from '@nestjs/common';
import { eq, and, lte, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, accountsReceivable, AccountReceivable, NewAccountReceivable, clients } from '../../database';

@Injectable()
export class AccountsReceivableService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todas as contas a receber
   */
  async findAll(): Promise<AccountReceivable[]> {
    return this.db
      .select()
      .from(accountsReceivable)
      .orderBy(desc(accountsReceivable.dueDate));
  }

  /**
   * Busca conta por ID
   */
  async findById(id: string): Promise<AccountReceivable | null> {
    const result = await this.db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria uma nova conta a receber (fiado)
   */
  async create(data: NewAccountReceivable): Promise<AccountReceivable> {
    const result = await this.db
      .insert(accountsReceivable)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza uma conta a receber
   */
  async update(id: string, data: Partial<NewAccountReceivable>): Promise<AccountReceivable | null> {
    const result = await this.db
      .update(accountsReceivable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(accountsReceivable.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Remove uma conta a receber
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(accountsReceivable)
      .where(eq(accountsReceivable.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Marca uma conta como recebida
   */
  async markAsPaid(id: string): Promise<AccountReceivable | null> {
    return this.update(id, {
      status: 'SETTLED',
      paidAmount: undefined, // will be set by caller or defaults
      settledAt: new Date(),
    } as any);
  }

  /**
   * Lista contas pendentes (OPEN) filtradas por salonId
   */
  async findPending(salonId: string): Promise<AccountReceivable[]> {
    return this.db
      .select()
      .from(accountsReceivable)
      .where(
        and(
          eq(accountsReceivable.salonId, salonId),
          eq(accountsReceivable.status, 'OPEN'),
        ),
      )
      .orderBy(accountsReceivable.dueDate);
  }

  /**
   * Lista contas pendentes com dados do cliente (para tela de detalhes)
   */
  async findPendingWithClient(salonId: string) {
    const accounts = await this.findPending(salonId);
    const result = [];

    for (const account of accounts) {
      let clientName: string | null = null;
      let clientPhone: string | null = null;

      if (account.clientId) {
        const clientResult = await this.db
          .select({ name: clients.name, phone: clients.phone })
          .from(clients)
          .where(eq(clients.id, account.clientId))
          .limit(1);

        if (clientResult[0]) {
          clientName = clientResult[0].name;
          clientPhone = clientResult[0].phone;
        }
      }

      result.push({
        ...account,
        clientName: clientName || 'Cliente removido',
        clientPhone,
      });
    }

    return result;
  }

  /**
   * Lista contas vencidas (atualiza status para OVERDUE se necessário)
   */
  async findOverdue(): Promise<AccountReceivable[]> {
    const now = new Date();

    // Primeiro atualiza status das vencidas
    await this.db
      .update(accountsReceivable)
      .set({ status: 'OVERDUE', updatedAt: new Date() })
      .where(
        and(
          eq(accountsReceivable.status, 'OPEN'),
          lte(accountsReceivable.dueDate, now),
        ),
      );

    // Retorna todas as vencidas
    return this.db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.status, 'OVERDUE'))
      .orderBy(accountsReceivable.dueDate);
  }

  /**
   * Lista contas por cliente
   */
  async findByClient(clientId: string): Promise<AccountReceivable[]> {
    return this.db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.clientId, clientId))
      .orderBy(desc(accountsReceivable.dueDate));
  }

  /**
   * Lista contas por status
   */
  async findByStatus(status: string): Promise<AccountReceivable[]> {
    return this.db
      .select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.status, status))
      .orderBy(accountsReceivable.dueDate);
  }

  /**
   * Calcula total a receber (usa remainingAmount, não totalAmount)
   */
  async getTotalPending(salonId: string): Promise<number> {
    const pending = await this.findPending(salonId);
    return pending.reduce((sum, account) => sum + parseFloat(account.remainingAmount), 0);
  }

  /**
   * Lista contas a receber com dados do cliente
   */
  async findAllWithClient(): Promise<(AccountReceivable & { client?: { name: string | null; phone: string } })[]> {
    const accounts = await this.findAll();
    const result = [];

    for (const account of accounts) {
      let client: { name: string | null; phone: string } | undefined;

      if (account.clientId) {
        const clientResult = await this.db
          .select()
          .from(clients)
          .where(eq(clients.id, account.clientId))
          .limit(1);

        client = clientResult[0] ? { name: clientResult[0].name, phone: clientResult[0].phone } : undefined;
      }

      result.push({
        ...account,
        client,
      });
    }

    return result;
  }
}

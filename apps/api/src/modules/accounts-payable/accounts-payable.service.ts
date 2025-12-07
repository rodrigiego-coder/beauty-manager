import { Injectable, Inject } from '@nestjs/common';
import { eq, and, lte, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, accountsPayable, AccountPayable, NewAccountPayable } from '../../database';

@Injectable()
export class AccountsPayableService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todas as contas a pagar
   */
  async findAll(): Promise<AccountPayable[]> {
    return this.db
      .select()
      .from(accountsPayable)
      .orderBy(desc(accountsPayable.dueDate));
  }

  /**
   * Busca conta por ID
   */
  async findById(id: number): Promise<AccountPayable | null> {
    const result = await this.db
      .select()
      .from(accountsPayable)
      .where(eq(accountsPayable.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria uma nova conta a pagar
   */
  async create(data: NewAccountPayable): Promise<AccountPayable> {
    const result = await this.db
      .insert(accountsPayable)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza uma conta a pagar
   */
  async update(id: number, data: Partial<NewAccountPayable>): Promise<AccountPayable | null> {
    const result = await this.db
      .update(accountsPayable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(accountsPayable.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Remove uma conta a pagar
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(accountsPayable)
      .where(eq(accountsPayable.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Marca uma conta como paga
   */
  async markAsPaid(id: number): Promise<AccountPayable | null> {
    return this.update(id, { status: 'PAID' });
  }

  /**
   * Lista contas pendentes
   */
  async findPending(): Promise<AccountPayable[]> {
    return this.db
      .select()
      .from(accountsPayable)
      .where(eq(accountsPayable.status, 'PENDING'))
      .orderBy(accountsPayable.dueDate);
  }

  /**
   * Lista contas vencidas (atualiza status para OVERDUE se necessário)
   */
  async findOverdue(): Promise<AccountPayable[]> {
    const today = new Date().toISOString().split('T')[0];

    // Primeiro atualiza status das vencidas
    await this.db
      .update(accountsPayable)
      .set({ status: 'OVERDUE', updatedAt: new Date() })
      .where(
        and(
          eq(accountsPayable.status, 'PENDING'),
          lte(accountsPayable.dueDate, today),
        ),
      );

    // Retorna todas as vencidas
    return this.db
      .select()
      .from(accountsPayable)
      .where(eq(accountsPayable.status, 'OVERDUE'))
      .orderBy(accountsPayable.dueDate);
  }

  /**
   * Lista contas por status
   */
  async findByStatus(status: 'PENDING' | 'PAID' | 'OVERDUE'): Promise<AccountPayable[]> {
    return this.db
      .select()
      .from(accountsPayable)
      .where(eq(accountsPayable.status, status))
      .orderBy(accountsPayable.dueDate);
  }

  /**
   * Calcula total pendente
   */
  async getTotalPending(): Promise<number> {
    const pending = await this.findPending();
    return pending.reduce((sum, account) => sum + parseFloat(account.amount), 0);
  }
}

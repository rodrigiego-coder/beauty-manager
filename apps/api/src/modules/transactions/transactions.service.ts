import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, transactions, Transaction, NewTransaction } from '../../database';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todas as transações
   */
  async findAll(): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));
  }

  /**
   * Busca transação por ID
   */
  async findById(id: number): Promise<Transaction | null> {
    const result = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria uma nova transação
   */
  async create(data: NewTransaction): Promise<Transaction> {
    const result = await this.db
      .insert(transactions)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza uma transação
   */
  async update(id: number, data: Partial<NewTransaction>): Promise<Transaction | null> {
    const result = await this.db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Remove uma transação
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Lista transações por período
   */
  async findByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ),
      )
      .orderBy(desc(transactions.date));
  }

  /**
   * Lista transações por tipo (INCOME ou EXPENSE)
   */
  async findByType(type: 'INCOME' | 'EXPENSE'): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.type, type))
      .orderBy(desc(transactions.date));
  }

  /**
   * Calcula o resumo financeiro de um período
   */
  async getSummary(startDate?: Date, endDate?: Date): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    let query = this.db.select().from(transactions);

    if (startDate && endDate) {
      const filtered = await this.db
        .select()
        .from(transactions)
        .where(
          and(
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        );

      return this.calculateSummary(filtered);
    }

    const all = await query;
    return this.calculateSummary(all);
  }

  private calculateSummary(txs: Transaction[]): {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  } {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of txs) {
      const amount = parseFloat(tx.amount);
      if (tx.type === 'INCOME') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: txs.length,
    };
  }

  /**
   * Lista transações por cliente
   */
  async findByClient(clientId: string): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.clientId, clientId))
      .orderBy(desc(transactions.date));
  }

  /**
   * Lista transações por agendamento
   */
  async findByAppointment(appointmentId: string): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.appointmentId, appointmentId))
      .orderBy(desc(transactions.date));
  }
}

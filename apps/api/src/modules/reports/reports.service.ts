import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import {
  transactions,
  clients,
  salons,
  accountsPayable,
  accountsReceivable,
  AccountPayable,
  AccountReceivable,
} from '../../database/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface TransactionExportData {
  [key: string]: number | Date | string | null;
  id: number;
  date: Date;
  type: string;
  amount: string;
  category: string;
  paymentMethod: string | null;
  description: string | null;
  clientName: string | null;
  salonName: string | null;
}

export interface InvoiceExportData {
  [key: string]: number | Date | string | null;
  id: number;
  date: Date;
  type: string;
  amount: string;
  category: string;
  paymentMethod: string | null;
  description: string | null;
  clientName: string | null;
  clientPhone: string | null;
  salonName: string | null;
  salonTaxId: string | null; // CNPJ
  salonAddress: string | null;
}

export interface FinancialSummary {
  period: { startDate: string; endDate: string };
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  paymentMethodBreakdown: Record<string, number>;
  pendingReceivables: number;
  pendingPayables: number;
}

export type ExportFormat = 'json' | 'csv';

@Injectable()
export class ReportsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: Database) {}

  /**
   * Exporta transações com dados enriquecidos
   */
  async exportTransactions(
    salonId: string,
    startDate?: Date,
    endDate?: Date,
    format: ExportFormat = 'json',
  ): Promise<TransactionExportData[] | string> {
    const conditions = [eq(transactions.salonId, salonId)];

    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }

    const results = await this.db
      .select({
        id: transactions.id,
        date: transactions.date,
        type: transactions.type,
        amount: transactions.amount,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        clientId: transactions.clientId,
        salonId: transactions.salonId,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));

    // Enriquece com dados de cliente e salão
    const enrichedData: TransactionExportData[] = [];
    for (const tx of results) {
      let clientName: string | null = null;
      let salonName: string | null = null;

      if (tx.clientId) {
        const [client] = await this.db
          .select({ name: clients.name })
          .from(clients)
          .where(eq(clients.id, tx.clientId));
        clientName = client?.name || null;
      }

      if (tx.salonId) {
        const [salon] = await this.db
          .select({ name: salons.name })
          .from(salons)
          .where(eq(salons.id, tx.salonId));
        salonName = salon?.name || null;
      }

      enrichedData.push({
        id: tx.id,
        date: tx.date,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        description: tx.description,
        clientName,
        salonName,
      });
    }

    if (format === 'csv') {
      return this.convertToCSV(enrichedData);
    }

    return enrichedData;
  }

  /**
   * Exporta dados fiscais (invoices) para contabilidade
   */
  async exportInvoices(
    salonId: string,
    startDate?: Date,
    endDate?: Date,
    format: ExportFormat = 'json',
  ): Promise<InvoiceExportData[] | string> {
    const conditions = [eq(transactions.salonId, salonId)];

    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }

    // Busca dados do salão para informações fiscais
    const [salonData] = await this.db
      .select()
      .from(salons)
      .where(eq(salons.id, salonId));

    const results = await this.db
      .select({
        id: transactions.id,
        date: transactions.date,
        type: transactions.type,
        amount: transactions.amount,
        category: transactions.category,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        clientId: transactions.clientId,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date));

    const enrichedData: InvoiceExportData[] = [];
    for (const tx of results) {
      let clientName: string | null = null;
      let clientPhone: string | null = null;

      if (tx.clientId) {
        const [client] = await this.db
          .select({ name: clients.name, phone: clients.phone })
          .from(clients)
          .where(eq(clients.id, tx.clientId));
        clientName = client?.name || null;
        clientPhone = client?.phone || null;
      }

      enrichedData.push({
        id: tx.id,
        date: tx.date,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        description: tx.description,
        clientName,
        clientPhone,
        salonName: salonData?.name || null,
        salonTaxId: salonData?.taxId || null,
        salonAddress: salonData?.address || null,
      });
    }

    if (format === 'csv') {
      return this.convertToCSV(enrichedData);
    }

    return enrichedData;
  }

  /**
   * Gera resumo financeiro completo para um período
   */
  async getFinancialSummary(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialSummary> {
    const txResults = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.salonId, salonId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ),
      );

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    const paymentMethodBreakdown: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of txResults) {
      const amount = parseFloat(tx.amount);

      if (tx.type === 'INCOME') {
        totalIncome += amount;
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + amount;
      } else {
        totalExpense += amount;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + amount;
      }

      if (tx.paymentMethod) {
        paymentMethodBreakdown[tx.paymentMethod] =
          (paymentMethodBreakdown[tx.paymentMethod] || 0) + amount;
      }
    }

    // Busca contas a receber pendentes
    const receivables = await this.db
      .select()
      .from(accountsReceivable)
      .where(
        and(
          eq(accountsReceivable.salonId, salonId),
          eq(accountsReceivable.status, 'PENDING'),
        ),
      );
    const pendingReceivables = receivables.reduce(
      (sum: number, r: AccountReceivable) => sum + parseFloat(r.amount),
      0,
    );

    // Busca contas a pagar pendentes
    const payables = await this.db
      .select()
      .from(accountsPayable)
      .where(
        and(
          eq(accountsPayable.salonId, salonId),
          eq(accountsPayable.status, 'PENDING'),
        ),
      );
    const pendingPayables = payables.reduce(
      (sum: number, p: AccountPayable) => sum + parseFloat(p.amount),
      0,
    );

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      transactionCount: txResults.length,
      incomeByCategory,
      expenseByCategory,
      paymentMethodBreakdown,
      pendingReceivables,
      pendingPayables,
    };
  }

  /**
   * Converte array de objetos para CSV
   */
  private convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        // Escapa aspas duplas e envolve em aspas se contiver vírgulas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

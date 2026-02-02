import { Database, Transaction, NewTransaction } from '../../database';
export declare class TransactionsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todas as transações
     */
    findAll(): Promise<Transaction[]>;
    /**
     * Busca transação por ID
     */
    findById(id: number): Promise<Transaction | null>;
    /**
     * Cria uma nova transação
     */
    create(data: NewTransaction): Promise<Transaction>;
    /**
     * Atualiza uma transação
     */
    update(id: number, data: Partial<NewTransaction>): Promise<Transaction | null>;
    /**
     * Remove uma transação
     */
    delete(id: number): Promise<boolean>;
    /**
     * Lista transações por período
     */
    findByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]>;
    /**
     * Lista transações por tipo (INCOME ou EXPENSE)
     */
    findByType(type: 'INCOME' | 'EXPENSE'): Promise<Transaction[]>;
    /**
     * Calcula o resumo financeiro de um período
     */
    getSummary(startDate?: Date, endDate?: Date): Promise<{
        totalIncome: number;
        totalExpense: number;
        balance: number;
        transactionCount: number;
    }>;
    private calculateSummary;
    /**
     * Lista transações por cliente
     */
    findByClient(clientId: string): Promise<Transaction[]>;
    /**
     * Lista transações por agendamento
     */
    findByAppointment(appointmentId: string): Promise<Transaction[]>;
}
//# sourceMappingURL=transactions.service.d.ts.map
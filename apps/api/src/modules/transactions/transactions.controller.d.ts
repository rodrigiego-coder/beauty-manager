import { TransactionsService } from './transactions.service';
import { NewTransaction } from '../../database';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    /**
     * GET /transactions
     * Lista todas as transações
     */
    findAll(): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }[]>;
    /**
     * GET /transactions/summary
     * Retorna resumo financeiro
     */
    getSummary(startDate?: string, endDate?: string): Promise<{
        totalIncome: number;
        totalExpense: number;
        balance: number;
        transactionCount: number;
    }>;
    /**
     * GET /transactions/period
     * Lista transações por período
     */
    findByPeriod(startDate: string, endDate: string): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }[]>;
    /**
     * GET /transactions/type/:type
     * Lista transações por tipo
     */
    findByType(type: 'INCOME' | 'EXPENSE'): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }[]>;
    /**
     * GET /transactions/client/:clientId
     * Lista transações por cliente
     */
    findByClient(clientId: string): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }[]>;
    /**
     * GET /transactions/:id
     * Busca transação por ID
     */
    findById(id: number): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }>;
    /**
     * POST /transactions
     * Cria uma nova transação
     */
    create(data: NewTransaction): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }>;
    /**
     * PATCH /transactions/:id
     * Atualiza uma transação
     */
    update(id: number, data: Partial<NewTransaction>): Promise<{
        date: Date;
        id: number;
        description: string | null;
        createdAt: Date;
        salonId: string | null;
        paymentMethod: string | null;
        amount: string;
        type: "INCOME" | "EXPENSE";
        clientId: string | null;
        category: string;
        appointmentId: string | null;
    }>;
    /**
     * DELETE /transactions/:id
     * Remove uma transação
     */
    delete(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=transactions.controller.d.ts.map
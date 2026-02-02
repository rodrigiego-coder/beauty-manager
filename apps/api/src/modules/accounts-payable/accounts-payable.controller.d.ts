import { AccountsPayableService } from './accounts-payable.service';
import { NewAccountPayable } from '../../database';
export declare class AccountsPayableController {
    private readonly accountsPayableService;
    constructor(accountsPayableService: AccountsPayableService);
    /**
     * GET /accounts-payable
     * Lista todas as contas a pagar
     */
    findAll(): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }[]>;
    /**
     * GET /accounts-payable/pending
     * Lista contas pendentes
     */
    findPending(): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }[]>;
    /**
     * GET /accounts-payable/overdue
     * Lista contas vencidas
     */
    findOverdue(): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }[]>;
    /**
     * GET /accounts-payable/total-pending
     * Retorna o total pendente
     */
    getTotalPending(): Promise<{
        totalPending: number;
    }>;
    /**
     * GET /accounts-payable/status/:status
     * Lista contas por status
     */
    findByStatus(status: 'PENDING' | 'PAID' | 'OVERDUE'): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }[]>;
    /**
     * GET /accounts-payable/:id
     * Busca conta por ID
     */
    findById(id: number): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }>;
    /**
     * POST /accounts-payable
     * Cria uma nova conta a pagar
     */
    create(data: NewAccountPayable): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }>;
    /**
     * PATCH /accounts-payable/:id
     * Atualiza uma conta a pagar
     */
    update(id: number, data: Partial<NewAccountPayable>): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }>;
    /**
     * PATCH /accounts-payable/:id/pay
     * Marca uma conta como paga
     */
    markAsPaid(id: number): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        category: string | null;
        supplierName: string;
    }>;
    /**
     * DELETE /accounts-payable/:id
     * Remove uma conta a pagar
     */
    delete(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=accounts-payable.controller.d.ts.map
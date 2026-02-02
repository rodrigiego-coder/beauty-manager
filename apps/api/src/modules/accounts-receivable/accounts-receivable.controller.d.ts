import { AccountsReceivableService } from './accounts-receivable.service';
import { NewAccountReceivable } from '../../database';
export declare class AccountsReceivableController {
    private readonly accountsReceivableService;
    constructor(accountsReceivableService: AccountsReceivableService);
    /**
     * GET /accounts-receivable
     * Lista todas as contas a receber
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
        clientId: string;
    }[]>;
    /**
     * GET /accounts-receivable/with-client
     * Lista contas a receber com dados do cliente
     */
    findAllWithClient(): Promise<({
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        clientId: string;
    } & {
        client?: {
            name: string | null;
            phone: string;
        };
    })[]>;
    /**
     * GET /accounts-receivable/pending
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
        clientId: string;
    }[]>;
    /**
     * GET /accounts-receivable/overdue
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
        clientId: string;
    }[]>;
    /**
     * GET /accounts-receivable/total-pending
     * Retorna o total a receber
     */
    getTotalPending(): Promise<{
        totalPending: number;
    }>;
    /**
     * GET /accounts-receivable/status/:status
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
        clientId: string;
    }[]>;
    /**
     * GET /accounts-receivable/client/:clientId
     * Lista contas por cliente
     */
    findByClient(clientId: string): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        clientId: string;
    }[]>;
    /**
     * GET /accounts-receivable/:id
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
        clientId: string;
    }>;
    /**
     * POST /accounts-receivable
     * Cria uma nova conta a receber (fiado)
     */
    create(data: NewAccountReceivable): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        clientId: string;
    }>;
    /**
     * PATCH /accounts-receivable/:id
     * Atualiza uma conta a receber
     */
    update(id: number, data: Partial<NewAccountReceivable>): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        salonId: string | null;
        status: "PENDING" | "PAID" | "OVERDUE";
        dueDate: string;
        amount: string;
        clientId: string;
    }>;
    /**
     * PATCH /accounts-receivable/:id/pay
     * Marca uma conta como recebida
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
        clientId: string;
    }>;
    /**
     * DELETE /accounts-receivable/:id
     * Remove uma conta a receber
     */
    delete(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=accounts-receivable.controller.d.ts.map
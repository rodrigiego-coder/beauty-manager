import { Database, AccountPayable, NewAccountPayable } from '../../database';
export declare class AccountsPayableService {
    private db;
    constructor(db: Database);
    /**
     * Lista todas as contas a pagar
     */
    findAll(): Promise<AccountPayable[]>;
    /**
     * Busca conta por ID
     */
    findById(id: number): Promise<AccountPayable | null>;
    /**
     * Cria uma nova conta a pagar
     */
    create(data: NewAccountPayable): Promise<AccountPayable>;
    /**
     * Atualiza uma conta a pagar
     */
    update(id: number, data: Partial<NewAccountPayable>): Promise<AccountPayable | null>;
    /**
     * Remove uma conta a pagar
     */
    delete(id: number): Promise<boolean>;
    /**
     * Marca uma conta como paga
     */
    markAsPaid(id: number): Promise<AccountPayable | null>;
    /**
     * Lista contas pendentes
     */
    findPending(): Promise<AccountPayable[]>;
    /**
     * Lista contas vencidas (atualiza status para OVERDUE se necessário)
     */
    findOverdue(): Promise<AccountPayable[]>;
    /**
     * Lista contas por status
     */
    findByStatus(status: 'PENDING' | 'PAID' | 'OVERDUE'): Promise<AccountPayable[]>;
    /**
     * Calcula total pendente
     */
    getTotalPending(): Promise<number>;
}
//# sourceMappingURL=accounts-payable.service.d.ts.map
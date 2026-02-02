import { Database, AccountReceivable, NewAccountReceivable } from '../../database';
export declare class AccountsReceivableService {
    private db;
    constructor(db: Database);
    /**
     * Lista todas as contas a receber
     */
    findAll(): Promise<AccountReceivable[]>;
    /**
     * Busca conta por ID
     */
    findById(id: number): Promise<AccountReceivable | null>;
    /**
     * Cria uma nova conta a receber (fiado)
     */
    create(data: NewAccountReceivable): Promise<AccountReceivable>;
    /**
     * Atualiza uma conta a receber
     */
    update(id: number, data: Partial<NewAccountReceivable>): Promise<AccountReceivable | null>;
    /**
     * Remove uma conta a receber
     */
    delete(id: number): Promise<boolean>;
    /**
     * Marca uma conta como recebida
     */
    markAsPaid(id: number): Promise<AccountReceivable | null>;
    /**
     * Lista contas pendentes
     */
    findPending(): Promise<AccountReceivable[]>;
    /**
     * Lista contas vencidas (atualiza status para OVERDUE se necessário)
     */
    findOverdue(): Promise<AccountReceivable[]>;
    /**
     * Lista contas por cliente
     */
    findByClient(clientId: string): Promise<AccountReceivable[]>;
    /**
     * Lista contas por status
     */
    findByStatus(status: 'PENDING' | 'PAID' | 'OVERDUE'): Promise<AccountReceivable[]>;
    /**
     * Calcula total a receber
     */
    getTotalPending(): Promise<number>;
    /**
     * Lista contas a receber com dados do cliente
     */
    findAllWithClient(): Promise<(AccountReceivable & {
        client?: {
            name: string | null;
            phone: string;
        };
    })[]>;
}
//# sourceMappingURL=accounts-receivable.service.d.ts.map
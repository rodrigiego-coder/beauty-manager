import { Database, Client, NewClient } from '../../database';
export interface FindAllOptions {
    salonId: string;
    search?: string;
    includeInactive?: boolean;
}
export interface ClientStats {
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
    recurringClients: number;
    churnRiskCount: number;
}
export interface ClientHistory {
    commands: {
        id: string;
        code: string | null;
        cardNumber: string;
        status: string;
        totalNet: string | null;
        openedAt: Date;
        closedAt: Date | null;
    }[];
    totalSpent: number;
    averageTicket: number;
    totalVisits: number;
}
export declare class ClientsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todos os clientes de um salão com filtros
     */
    findAll(options: FindAllOptions): Promise<Client[]>;
    /**
     * Busca cliente por ID
     */
    findById(id: string): Promise<Client | null>;
    /**
     * Busca cliente pelo telefone
     */
    findByPhone(phone: string, salonId?: string): Promise<Client | null>;
    /**
     * Busca clientes por termo (nome, email ou telefone)
     */
    search(salonId: string, term: string, includeInactive?: boolean): Promise<Client[]>;
    /**
     * Cria um novo cliente
     */
    create(data: NewClient): Promise<Client>;
    /**
     * Cria ou retorna cliente existente pelo telefone
     */
    findOrCreate(phone: string, salonId: string, name?: string): Promise<Client>;
    /**
     * Atualiza dados do cliente
     */
    update(id: string, data: Partial<NewClient>): Promise<Client | null>;
    /**
     * Soft delete - desativa cliente
     */
    delete(id: string): Promise<Client | null>;
    /**
     * Reativa cliente
     */
    reactivate(id: string): Promise<Client | null>;
    /**
     * Atualiza o status da IA para um cliente
     */
    setAiActive(id: string, active: boolean): Promise<Client | null>;
    /**
     * Verifica se a IA está ativa para um cliente
     */
    isAiActive(phone: string, salonId?: string): Promise<boolean>;
    /**
     * Atualiza a data da última visita e incrementa total de visitas
     */
    updateLastVisit(id: string): Promise<Client | null>;
    /**
     * Retorna estatísticas dos clientes
     */
    getStats(salonId: string): Promise<ClientStats>;
    /**
     * Retorna histórico de comandas do cliente
     */
    getHistory(clientId: string): Promise<ClientHistory>;
}
//# sourceMappingURL=clients.service.d.ts.map
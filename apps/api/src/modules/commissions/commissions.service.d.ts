import { Database } from '../../database/database.module';
export interface CommissionWithDetails {
    id: string;
    salonId: string;
    commandId: string;
    commandItemId: string;
    professionalId: string;
    itemDescription: string;
    itemValue: string;
    commissionPercentage: string;
    commissionValue: string;
    status: string;
    paidAt: Date | null;
    paidById: string | null;
    createdAt: Date;
    updatedAt: Date;
    professionalName?: string;
    commandCode?: string;
    commandCardNumber?: string;
    paidByName?: string;
}
export interface ProfessionalSummary {
    professionalId: string;
    professionalName: string;
    totalPending: number;
    totalPaid: number;
    pendingCount: number;
    paidCount: number;
}
export interface CommissionsSummary {
    totalPending: number;
    totalPaidThisMonth: number;
    professionalsWithPending: number;
}
export declare class CommissionsService {
    private db;
    constructor(db: Database);
    /**
     * Lista comissoes com filtros
     */
    findAll(salonId: string, filters?: {
        professionalId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<CommissionWithDetails[]>;
    /**
     * Busca uma comissao por ID
     */
    findById(salonId: string, id: string): Promise<CommissionWithDetails>;
    /**
     * Retorna resumo geral das comissoes
     */
    getSummary(salonId: string): Promise<CommissionsSummary>;
    /**
     * Retorna resumo por profissional
     */
    getSummaryByProfessional(salonId: string): Promise<ProfessionalSummary[]>;
    /**
     * Paga comissoes selecionadas
     */
    payCommissions(salonId: string, commissionIds: string[], paidById: string): Promise<{
        paid: number;
        total: number;
    }>;
    /**
     * Paga todas as comissoes pendentes de um profissional
     */
    payProfessionalCommissions(salonId: string, professionalId: string, paidById: string, startDate?: string, endDate?: string): Promise<{
        paid: number;
        total: number;
    }>;
    /**
     * Cria comissao para um item de comanda
     * Chamado pelo CommandsService ao fechar o caixa
     */
    createFromCommandItem(salonId: string, commandId: string, commandItemId: string, professionalId: string, itemDescription: string, itemValue: number, commissionPercentage: number): Promise<void>;
    /**
     * Cancela comissoes de uma comanda (usado quando comanda e cancelada)
     */
    cancelByCommand(commandId: string): Promise<void>;
}
//# sourceMappingURL=commissions.service.d.ts.map
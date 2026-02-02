import { CommissionsService } from './commissions.service';
import { PayCommissionsDto, PayProfessionalCommissionsDto, ListCommissionsQueryDto } from './dto';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    /**
     * GET /commissions
     * Lista comissoes do salao com filtros
     */
    findAll(user: {
        salonId: string;
    }, query: ListCommissionsQueryDto): Promise<import("./commissions.service").CommissionWithDetails[]>;
    /**
     * GET /commissions/summary
     * Resumo geral das comissoes
     */
    getSummary(user: {
        salonId: string;
    }): Promise<import("./commissions.service").CommissionsSummary>;
    /**
     * GET /commissions/by-professional
     * Resumo agrupado por profissional
     */
    getSummaryByProfessional(user: {
        salonId: string;
    }): Promise<import("./commissions.service").ProfessionalSummary[]>;
    /**
     * GET /commissions/:id
     * Detalhes de uma comissao
     */
    findById(user: {
        salonId: string;
    }, id: string): Promise<import("./commissions.service").CommissionWithDetails>;
    /**
     * POST /commissions/pay
     * Paga comissoes selecionadas
     */
    payCommissions(user: {
        salonId: string;
        id: string;
    }, dto: PayCommissionsDto): Promise<{
        paid: number;
        total: number;
    }>;
    /**
     * POST /commissions/pay-professional
     * Paga todas as comissoes pendentes de um profissional
     */
    payProfessionalCommissions(user: {
        salonId: string;
        id: string;
    }, dto: PayProfessionalCommissionsDto): Promise<{
        paid: number;
        total: number;
    }>;
}
//# sourceMappingURL=commissions.controller.d.ts.map
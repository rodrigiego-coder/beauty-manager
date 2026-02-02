import { DashboardService, DashboardPeriod } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    /**
     * GET /dashboard/stats
     * Retorna estatisticas do dashboard para o salao do usuario logado
     *
     * @param period - Periodo de consulta: today, week, month, year (default: today)
     */
    getStats(user: {
        salonId: string;
    }, period?: DashboardPeriod): Promise<import("./dashboard.service").DashboardStats>;
    /**
     * GET /dashboard/professional
     * Retorna dashboard do profissional logado
     * CRÍTICO: STYLIST só vê seus próprios dados
     */
    getProfessionalDashboard(user: {
        salonId: string;
        id: string;
    }): Promise<import("./dto/professional-dashboard.dto").ProfessionalDashboardDto>;
    private validatePeriod;
}
//# sourceMappingURL=dashboard.controller.d.ts.map
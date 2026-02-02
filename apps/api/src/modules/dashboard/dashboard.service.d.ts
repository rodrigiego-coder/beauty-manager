import { Database } from '../../database/database.module';
import { ProfessionalDashboardDto } from './dto/professional-dashboard.dto';
export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';
export interface RevenueByPaymentMethod {
    cash: number;
    creditCard: number;
    debitCard: number;
    pix: number;
    other: number;
}
export interface CommandsByStatus {
    open: number;
    inService: number;
    waitingPayment: number;
    closed: number;
    canceled: number;
}
export interface TopService {
    name: string;
    quantity: number;
    revenue: number;
}
export interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}
export interface LowStockProduct {
    id: number;
    name: string;
    currentStock: number;
    minStock: number;
}
export interface CashRegisterStatus {
    isOpen: boolean;
    id?: string;
    openedAt?: Date;
    openingBalance?: number;
    totalSales?: number;
    totalCash?: number;
    totalCard?: number;
    totalPix?: number;
    expectedBalance?: number;
}
export interface DashboardStats {
    totalRevenue: number;
    previousRevenue: number;
    revenueGrowth: number;
    revenueByPaymentMethod: RevenueByPaymentMethod;
    todaySales: number;
    totalCommands: number;
    openCommands: number;
    averageTicket: number;
    commandsByStatus: CommandsByStatus;
    totalClients: number;
    newClients: number;
    returningClients: number;
    topServices: TopService[];
    topProducts: TopProduct[];
    lowStockProducts: LowStockProduct[];
    cashRegister: CashRegisterStatus;
    period: DashboardPeriod;
    periodStart: string;
    periodEnd: string;
}
export declare class DashboardService {
    private db;
    constructor(db: Database);
    getStats(salonId: string, period?: DashboardPeriod): Promise<DashboardStats>;
    private getPeriodDates;
    private getRevenueData;
    private getCommandsData;
    private getClientsData;
    private getTopServices;
    private getTopProducts;
    private getLowStockProducts;
    private getCashRegisterStatus;
    private getTodaySales;
    /**
     * =====================================================
     * DASHBOARD DO PROFISSIONAL
     * CRÍTICO: Sempre filtra por professionalId para isolamento
     * =====================================================
     */
    getProfessionalDashboard(salonId: string, professionalId: string): Promise<ProfessionalDashboardDto>;
    /**
     * Calcula faturamento do profissional no mês
     * Baseado em commandItems.performerId
     */
    private getProfessionalMonthRevenue;
}
//# sourceMappingURL=dashboard.service.d.ts.map
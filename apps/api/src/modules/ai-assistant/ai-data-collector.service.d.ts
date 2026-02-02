interface OwnerData {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowthPercent: number;
    averageTicket: number;
    totalClients: number;
    newClientsThisMonth: number;
    atRiskClients: Array<{
        name: string;
        phone: string | null;
        lastVisitDays: number;
    }>;
    lowStockProducts: Array<{
        name: string;
        currentStock: number;
        minStock: number;
    }>;
    pendingCommissions: number;
    todayAppointments: number;
    teamRanking: Array<{
        name: string;
        revenue: number;
        odela?: string;
    }>;
    bestSellingServices: Array<{
        name: string;
        quantity: number;
    }>;
    cashRegisterOpen: boolean;
    cashRegisterBalance: number;
}
interface ManagerData {
    todayAppointments: number;
    pendingConfirmations: number;
    lowStockProducts: Array<{
        name: string;
        currentStock: number;
    }>;
    pendingCommissions: number;
    todayRevenue: number;
    openCommands: number;
}
interface ReceptionistData {
    todayAppointments: Array<{
        time: string;
        clientName: string;
        serviceName: string;
        professionalName: string;
    }>;
    pendingConfirmations: number;
    birthdayClients: Array<{
        name: string;
        phone: string | null;
    }>;
    openCommands: number;
}
interface StylistData {
    myTodayAppointments: Array<{
        time: string;
        clientName: string;
        serviceName: string;
    }>;
    myMonthRevenue: number;
    myCommission: number;
    myRanking: number;
    totalProfessionals: number;
}
interface ClientInfo {
    client: {
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
    };
    hairProfile: any | null;
    lastVisit: Date | string | null;
    totalVisits: number;
    averageTicket: number;
    preferences: string[];
    allergies: string[];
    notes: string[];
}
export declare class AIDataCollectorService {
    collectOwnerData(salonId: string): Promise<OwnerData>;
    collectManagerData(salonId: string): Promise<ManagerData>;
    collectReceptionistData(salonId: string): Promise<ReceptionistData>;
    collectStylistData(salonId: string, odela: string): Promise<StylistData>;
    collectClientInfo(salonId: string, clientId: string): Promise<ClientInfo>;
    private getRevenue;
    private getTotalClients;
    private getNewClients;
    private getAtRiskClients;
    private getLowStockProducts;
    private getPendingCommissions;
    private getTodayAppointmentsCount;
    private getTeamRanking;
    private getBestSellingServices;
    private getCurrentCashRegister;
    private getCommandsCount;
    private getPendingConfirmations;
    private getOpenCommandsCount;
    private getTodayAppointmentsList;
    private getBirthdayClients;
    private getStylistTodayAppointments;
    private getStylistMonthRevenue;
    private getStylistPendingCommission;
}
export {};
//# sourceMappingURL=ai-data-collector.service.d.ts.map
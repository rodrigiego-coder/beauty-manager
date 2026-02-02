/**
 * =====================================================
 * DATA COLLECTOR SERVICE
 * Coleta dados do salão para contexto da IA
 * =====================================================
 */
export interface SalonContext {
    salon: {
        name: string | null;
        phone: string | null;
        address: string | null;
        workingHours: string;
    };
    services: {
        id: number;
        name: string;
        description: string | null;
        price: string;
        duration: number;
        category: string;
    }[];
    products: {
        id: number;
        name: string;
        description: string | null;
        price: string;
        category: string;
        inStock: boolean;
    }[];
    professionals: {
        id: string;
        name: string;
    }[];
    client: {
        name: string | null;
        isReturning: boolean;
        lastVisit: string | null;
    } | null;
}
export interface DashboardData {
    todayRevenue?: number;
    todayAppointments?: number;
    unconfirmedAppointments?: number;
    lowStockProducts?: {
        name: string;
        stock: number;
    }[];
    myAppointmentsToday?: {
        time: string | null;
        client: string | null;
        service: string | null;
    }[];
    nextClient?: any;
}
export declare class DataCollectorService {
    private readonly logger;
    /**
     * Coleta contexto do salão para resposta do WhatsApp
     */
    collectContext(salonId: string, clientPhone?: string): Promise<SalonContext>;
    /**
     * Coleta dados para briefing do dashboard
     */
    collectDashboardData(salonId: string, userId: string, userRole: string): Promise<DashboardData>;
}
//# sourceMappingURL=data-collector.service.d.ts.map
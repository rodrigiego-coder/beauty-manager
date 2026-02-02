import { Database } from '../../database/database.module';
export interface TransactionExportData {
    [key: string]: number | Date | string | null;
    id: number;
    date: Date;
    type: string;
    amount: string;
    category: string;
    paymentMethod: string | null;
    description: string | null;
    clientName: string | null;
    salonName: string | null;
}
export interface InvoiceExportData {
    [key: string]: number | Date | string | null;
    id: number;
    date: Date;
    type: string;
    amount: string;
    category: string;
    paymentMethod: string | null;
    description: string | null;
    clientName: string | null;
    clientPhone: string | null;
    salonName: string | null;
    salonTaxId: string | null;
    salonAddress: string | null;
}
export interface FinancialSummary {
    period: {
        startDate: string;
        endDate: string;
    };
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    transactionCount: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
    paymentMethodBreakdown: Record<string, number>;
    pendingReceivables: number;
    pendingPayables: number;
}
export interface SalesReportItem {
    date: string;
    total: number;
    commandCount: number;
    averageTicket: number;
}
export interface ServiceReportItem {
    serviceId: string;
    serviceName: string;
    quantity: number;
    revenue: number;
    averageTicket: number;
    percentOfTotal: number;
}
export interface ProductReportItem {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    currentStock: number;
}
export interface ProfessionalReportItem {
    id: string;
    name: string;
    appointments: number;
    revenue: number;
    commission: number;
    averageTicket: number;
}
export interface ClientsReportSummary {
    newClients: number;
    returningClients: number;
    retentionRate: number;
    averageTicket: number;
    averageFrequency: number;
    topClients: Array<{
        id: string;
        name: string;
        visits: number;
        totalSpent: number;
    }>;
}
export type ExportFormat = 'json' | 'csv';
export declare class ReportsService {
    private db;
    constructor(db: Database);
    /**
     * Relatorio de vendas por periodo
     */
    getSalesReport(salonId: string, startDate: Date, endDate: Date, groupBy?: 'day' | 'week' | 'month'): Promise<{
        items: SalesReportItem[];
        totals: {
            total: number;
            commands: number;
            averageTicket: number;
        };
    }>;
    /**
     * Relatorio de servicos
     */
    getServicesReport(salonId: string, startDate: Date, endDate: Date): Promise<{
        items: ServiceReportItem[];
        total: number;
    }>;
    /**
     * Relatorio de produtos
     */
    getProductsReport(salonId: string, startDate: Date, endDate: Date): Promise<{
        items: ProductReportItem[];
        total: number;
    }>;
    /**
     * Relatorio de profissionais
     */
    getProfessionalsReport(salonId: string, startDate: Date, endDate: Date): Promise<{
        items: ProfessionalReportItem[];
        totals: {
            revenue: number;
            commission: number;
        };
    }>;
    /**
     * Relatorio de clientes
     */
    getClientsReport(salonId: string, startDate: Date, endDate: Date): Promise<ClientsReportSummary>;
    /**
     * Exporta relatorio generico em CSV
     */
    exportReport(salonId: string, type: 'sales' | 'services' | 'products' | 'professionals' | 'clients', startDate: Date, endDate: Date): Promise<string>;
    /**
     * Exporta transacoes com dados enriquecidos
     */
    exportTransactions(salonId: string, startDate?: Date, endDate?: Date, format?: ExportFormat): Promise<TransactionExportData[] | string>;
    /**
     * Exporta dados fiscais (invoices) para contabilidade
     */
    exportInvoices(salonId: string, startDate?: Date, endDate?: Date, format?: ExportFormat): Promise<InvoiceExportData[] | string>;
    /**
     * Gera resumo financeiro completo para um periodo
     */
    getFinancialSummary(salonId: string, startDate: Date, endDate: Date): Promise<FinancialSummary>;
    /**
     * Converte array de objetos para CSV
     */
    private convertToCSV;
}
//# sourceMappingURL=reports.service.d.ts.map
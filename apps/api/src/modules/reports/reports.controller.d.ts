import { FastifyReply } from 'fastify';
import { ReportsService, ExportFormat } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    /**
     * GET /reports/sales
     * Relatorio de vendas por periodo
     */
    getSalesReport(user: any, startDate: string, endDate: string, groupBy?: 'day' | 'week' | 'month'): Promise<{
        items: import("./reports.service").SalesReportItem[];
        totals: {
            total: number;
            commands: number;
            averageTicket: number;
        };
    }>;
    /**
     * GET /reports/services
     * Relatorio de servicos
     */
    getServicesReport(user: any, startDate: string, endDate: string): Promise<{
        items: import("./reports.service").ServiceReportItem[];
        total: number;
    }>;
    /**
     * GET /reports/products
     * Relatorio de produtos
     */
    getProductsReport(user: any, startDate: string, endDate: string): Promise<{
        items: import("./reports.service").ProductReportItem[];
        total: number;
    }>;
    /**
     * GET /reports/professionals
     * Relatorio de profissionais
     */
    getProfessionalsReport(user: any, startDate: string, endDate: string): Promise<{
        items: import("./reports.service").ProfessionalReportItem[];
        totals: {
            revenue: number;
            commission: number;
        };
    }>;
    /**
     * GET /reports/clients
     * Relatorio de clientes
     */
    getClientsReport(user: any, startDate: string, endDate: string): Promise<import("./reports.service").ClientsReportSummary>;
    /**
     * GET /reports/export/:type
     * Exporta relatorio em CSV
     */
    exportReport(user: any, type: 'sales' | 'services' | 'products' | 'professionals' | 'clients', startDate: string, endDate: string, reply: FastifyReply): Promise<never>;
    /**
     * GET /reports/export/transactions
     * Exporta todas as transacoes como JSON ou CSV
     */
    exportTransactions(user: any, startDate?: string, endDate?: string, format?: ExportFormat, reply?: FastifyReply): Promise<string | import("./reports.service").TransactionExportData[]>;
    /**
     * GET /reports/export-invoices
     * Exporta dados fiscais para contabilidade
     */
    exportInvoices(user: any, startDate?: string, endDate?: string, format?: ExportFormat, reply?: FastifyReply): Promise<string | import("./reports.service").InvoiceExportData[]>;
    /**
     * GET /reports/financial-summary
     * Gera resumo financeiro completo para um periodo
     */
    getFinancialSummary(user: any, startDate: string, endDate: string): Promise<import("./reports.service").FinancialSummary>;
}
//# sourceMappingURL=reports.controller.d.ts.map
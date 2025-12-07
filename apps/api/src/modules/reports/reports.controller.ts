import { Controller, Get, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ReportsService, ExportFormat } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /reports/export/transactions
   * Exporta todas as transações (entrada/saída) como JSON ou CSV
   *
   * Query params:
   * - salonId: string (obrigatório)
   * - startDate: string ISO (opcional)
   * - endDate: string ISO (opcional)
   * - format: 'json' | 'csv' (default: json)
   */
  @Get('export/transactions')
  async exportTransactions(
    @Query('salonId') salonId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: ExportFormat = 'json',
    @Res() reply?: FastifyReply,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const data = await this.reportsService.exportTransactions(salonId, start, end, format);

    if (format === 'csv' && reply) {
      const filename = `transactions_${salonId}_${new Date().toISOString().split('T')[0]}.csv`;
      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(data);
    }

    if (reply) {
      return reply.send(data);
    }

    return data;
  }

  /**
   * GET /reports/export/invoices
   * Exporta dados fiscais (tax_data) para contabilidade
   * Inclui informações do salão (CNPJ, endereço) para fins fiscais
   *
   * Query params:
   * - salonId: string (obrigatório)
   * - startDate: string ISO (opcional)
   * - endDate: string ISO (opcional)
   * - format: 'json' | 'csv' (default: json)
   */
  @Get('export/invoices')
  async exportInvoices(
    @Query('salonId') salonId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: ExportFormat = 'json',
    @Res() reply?: FastifyReply,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const data = await this.reportsService.exportInvoices(salonId, start, end, format);

    if (format === 'csv' && reply) {
      const filename = `invoices_${salonId}_${new Date().toISOString().split('T')[0]}.csv`;
      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(data);
    }

    if (reply) {
      return reply.send(data);
    }

    return data;
  }

  /**
   * GET /reports/financial-summary
   * Gera resumo financeiro completo para um período
   * Útil para dashboards e relatórios gerenciais
   *
   * Query params:
   * - salonId: string (obrigatório)
   * - startDate: string ISO (obrigatório)
   * - endDate: string ISO (obrigatório)
   */
  @Get('financial-summary')
  async getFinancialSummary(
    @Query('salonId') salonId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getFinancialSummary(
      salonId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

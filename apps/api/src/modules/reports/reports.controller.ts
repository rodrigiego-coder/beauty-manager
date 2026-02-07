import { Controller, Get, Query, Param, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ReportsService, ExportFormat } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { parseQueryDate } from '../../common/date-range';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /reports/sales
   * Relatorio de vendas por periodo
   */
  @Get('sales')
  @Roles('OWNER', 'MANAGER')
  async getSalesReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.reportsService.getSalesReport(
      user.salonId,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
      groupBy,
    );
  }

  /**
   * GET /reports/services
   * Relatorio de servicos
   */
  @Get('services')
  @Roles('OWNER', 'MANAGER')
  async getServicesReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getServicesReport(
      user.salonId,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
    );
  }

  /**
   * GET /reports/products
   * Relatorio de produtos
   */
  @Get('products')
  @Roles('OWNER', 'MANAGER')
  async getProductsReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getProductsReport(
      user.salonId,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
    );
  }

  /**
   * GET /reports/professionals
   * Relatorio de profissionais
   */
  @Get('professionals')
  @Roles('OWNER', 'MANAGER')
  async getProfessionalsReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getProfessionalsReport(
      user.salonId,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
    );
  }

  /**
   * GET /reports/clients
   * Relatorio de clientes
   */
  @Get('clients')
  @Roles('OWNER', 'MANAGER')
  async getClientsReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getClientsReport(
      user.salonId,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
    );
  }

  /**
   * GET /reports/export/:type
   * Exporta relatorio em CSV
   */
  @Get('export/:type')
  @Roles('OWNER', 'MANAGER')
  async exportReport(
    @CurrentUser() user: any,
    @Param('type') type: 'sales' | 'services' | 'products' | 'professionals' | 'clients',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() reply: FastifyReply,
  ) {
    const csv = await this.reportsService.exportReport(
      user.salonId,
      type,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
    );

    const filename = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);
  }

  /**
   * GET /reports/export/transactions
   * Exporta todas as transacoes como JSON ou CSV
   */
  @Get('export-transactions')
  @Roles('OWNER', 'MANAGER')
  async exportTransactions(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: ExportFormat = 'json',
    @Res() reply?: FastifyReply,
  ) {
    const start = startDate ? parseQueryDate(startDate) : undefined;
    const end = endDate ? parseQueryDate(endDate, true) : undefined;

    const data = await this.reportsService.exportTransactions(user.salonId, start, end, format);

    if (format === 'csv' && reply) {
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
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
   * GET /reports/export-invoices
   * Exporta dados fiscais para contabilidade
   */
  @Get('export-invoices')
  @Roles('OWNER', 'MANAGER')
  async exportInvoices(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: ExportFormat = 'json',
    @Res() reply?: FastifyReply,
  ) {
    const start = startDate ? parseQueryDate(startDate) : undefined;
    const end = endDate ? parseQueryDate(endDate, true) : undefined;

    const data = await this.reportsService.exportInvoices(user.salonId, start, end, format);

    if (format === 'csv' && reply) {
      const filename = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
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
   * Gera resumo financeiro completo para um periodo
   */
  @Get('financial-summary')
  @Roles('OWNER', 'MANAGER')
  async getFinancialSummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getFinancialSummary(
      user.salonId,
      parseQueryDate(startDate),
      parseQueryDate(endDate, true),
    );
  }
}

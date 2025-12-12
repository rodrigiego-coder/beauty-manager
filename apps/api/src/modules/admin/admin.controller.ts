import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/dashboard - Dashboard metrics
   */
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  /**
   * GET /admin/salons - List all salons
   */
  @Get('salons')
  async listSalons(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listSalons({ status, search });
  }

  /**
   * GET /admin/salons/:id - Salon details
   */
  @Get('salons/:id')
  async getSalonDetails(@Param('id') salonId: string) {
    return this.adminService.getSalonDetails(salonId);
  }

  /**
   * POST /admin/salons/:id/suspend - Suspend salon
   */
  @Post('salons/:id/suspend')
  async suspendSalon(
    @Param('id') salonId: string,
    @Body() body: { reason?: string },
  ) {
    await this.adminService.suspendSalon(salonId, body.reason);
    return { success: true, message: 'Salão suspenso com sucesso' };
  }

  /**
   * POST /admin/salons/:id/activate - Activate salon
   */
  @Post('salons/:id/activate')
  async activateSalon(@Param('id') salonId: string) {
    await this.adminService.activateSalon(salonId);
    return { success: true, message: 'Salão ativado com sucesso' };
  }

  /**
   * PATCH /admin/salons/:id/subscription - Update subscription manually
   */
  @Patch('salons/:id/subscription')
  async updateSubscription(
    @Param('id') salonId: string,
    @Body()
    body: {
      planId?: string;
      status?: string;
      billingPeriod?: string;
      notes?: string;
    },
  ) {
    await this.adminService.updateSubscription(salonId, body);
    return { success: true, message: 'Assinatura atualizada com sucesso' };
  }

  /**
   * GET /admin/subscriptions - List all subscriptions
   */
  @Get('subscriptions')
  async listSubscriptions(
    @Query('status') status?: string,
    @Query('planId') planId?: string,
  ) {
    return this.adminService.listSubscriptions({ status, planId });
  }

  /**
   * GET /admin/invoices - List all invoices
   */
  @Get('invoices')
  async listInvoices(
    @Query('status') status?: string,
    @Query('salonId') salonId?: string,
  ) {
    return this.adminService.listInvoices({ status, salonId });
  }

  /**
   * POST /admin/invoices/:id/mark-paid - Mark invoice as paid
   */
  @Post('invoices/:id/mark-paid')
  async markInvoiceAsPaid(@Param('id') invoiceId: string) {
    await this.adminService.markInvoiceAsPaid(invoiceId);
    return { success: true, message: 'Fatura marcada como paga' };
  }

  /**
   * GET /admin/events - List subscription events
   */
  @Get('events')
  async listEvents(
    @Query('type') type?: string,
    @Query('subscriptionId') subscriptionId?: string,
  ) {
    return this.adminService.listEvents({ type, subscriptionId });
  }
}

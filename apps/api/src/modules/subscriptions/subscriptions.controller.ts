import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalonSubscriptionsService } from './salon-subscriptions.service';
import { PlansService } from '../plans/plans.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  StartTrialDto,
  ChangePlanDto,
  CancelSubscriptionDto,
  PayInvoiceDto,
  InvoiceFiltersDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(AuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SalonSubscriptionsService,
    private readonly plansService: PlansService,
  ) {}

  /**
   * GET /subscriptions/plans - Lista todos os planos disponiveis
   */
  @Get('plans')
  async getPlans() {
    return this.plansService.findAll();
  }

  /**
   * GET /subscriptions/current - Retorna a assinatura atual do salao
   */
  @Get('current')
  async getCurrentSubscription(@CurrentUser() user: any) {
    const { subscription, plan, limits, usage } = await this.subscriptionsService.getCurrentSubscription(user.salonId);

    if (!subscription) {
      return {
        subscription: null,
        plan: null,
        limits: { users: 1, clients: 50 },
        usage,
        status: {
          valid: false,
          status: 'NO_SUBSCRIPTION',
          message: 'Nenhuma assinatura encontrada',
          canAccess: false,
        },
      };
    }

    const status = await this.subscriptionsService.isSubscriptionValid(user.salonId);

    return {
      subscription: {
        id: subscription.id,
        salonId: subscription.salonId,
        planId: subscription.planId,
        status: subscription.status,
        billingPeriod: subscription.billingPeriod,
        startsAt: subscription.startsAt,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
      },
      plan: plan
        ? {
            id: plan.id,
            code: plan.code,
            name: plan.name,
            description: plan.description,
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            maxUsers: plan.maxUsers,
            maxClients: plan.maxClients,
            features: plan.features,
            hasFiscal: plan.hasFiscal,
            hasAutomation: plan.hasAutomation,
            hasReports: plan.hasReports,
            hasAI: plan.hasAI,
          }
        : null,
      limits,
      usage,
      status,
    };
  }

  /**
   * GET /subscriptions/status - Retorna o status da assinatura
   */
  @Get('status')
  async getSubscriptionStatus(@CurrentUser() user: any) {
    return this.subscriptionsService.isSubscriptionValid(user.salonId);
  }

  /**
   * POST /subscriptions/start-trial - Iniciar periodo de teste
   */
  @Post('start-trial')
  @Roles('OWNER')
  async startTrial(@CurrentUser() user: any, @Body() dto: StartTrialDto) {
    return this.subscriptionsService.startTrial(user.salonId, dto, user.id);
  }

  /**
   * POST /subscriptions/change-plan - Trocar de plano
   */
  @Post('change-plan')
  @Roles('OWNER')
  async changePlan(@CurrentUser() user: any, @Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(user.salonId, dto, user.id);
  }

  /**
   * POST /subscriptions/cancel - Cancelar assinatura
   */
  @Post('cancel')
  @Roles('OWNER')
  async cancelSubscription(
    @CurrentUser() user: any,
    @Body() dto: CancelSubscriptionDto,
  ) {
    const subscription = await this.subscriptionsService.cancel(
      user.salonId,
      dto,
      user.id,
    );
    return {
      success: true,
      message: dto.cancelAtPeriodEnd
        ? 'Assinatura será cancelada ao final do período'
        : 'Assinatura cancelada com sucesso',
      subscription,
    };
  }

  /**
   * POST /subscriptions/reactivate - Reativar assinatura
   */
  @Post('reactivate')
  @Roles('OWNER')
  async reactivateSubscription(
    @CurrentUser() user: any,
    @Body() dto: CancelSubscriptionDto,
  ) {
    const subscription = await this.subscriptionsService.reactivate(
      user.salonId,
      dto,
      user.id,
    );
    return {
      success: true,
      message: 'Assinatura reativada com sucesso',
      subscription,
    };
  }

  /**
   * GET /subscriptions/invoices - Listar faturas
   */
  @Get('invoices')
  async getInvoices(
    @CurrentUser() user: any,
    @Query() filters: InvoiceFiltersDto,
  ) {
    return this.subscriptionsService.getInvoices(user.salonId, filters);
  }

  /**
   * GET /subscriptions/invoices/:id - Detalhes de uma fatura
   */
  @Get('invoices/:id')
  async getInvoice(@CurrentUser() user: any, @Param('id') invoiceId: string) {
    return this.subscriptionsService.getInvoiceById(invoiceId, user.salonId);
  }

  /**
   * POST /subscriptions/invoices/:id/pay - Iniciar pagamento
   */
  @Post('invoices/:id/pay')
  @Roles('OWNER')
  async payInvoice(
    @CurrentUser() user: any,
    @Param('id') invoiceId: string,
    @Body() dto: PayInvoiceDto,
  ) {
    return this.subscriptionsService.initiatePayment(invoiceId, user.salonId, dto);
  }

  /**
   * GET /subscriptions/events - Historico de eventos
   */
  @Get('events')
  async getEvents(@CurrentUser() user: any) {
    const { subscription } = await this.subscriptionsService.getCurrentSubscription(user.salonId);

    if (!subscription) {
      return [];
    }

    return this.subscriptionsService.getEvents(subscription.id);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductSubscriptionsService } from './product-subscriptions.service';
import { AuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import {
  CreatePlanDto,
  UpdatePlanDto,
  AddPlanItemDto,
  SubscribeDto,
  UpdateSubscriptionDto,
  PauseSubscriptionDto,
  CancelSubscriptionDto,
  UpdateDeliveryStatusDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    salonId: string;
    role: string;
  };
}

@Controller('product-subscriptions')
@UseGuards(AuthGuard, RolesGuard)
export class ProductSubscriptionsController {
  constructor(private readonly service: ProductSubscriptionsService) {}

  // ==================== PLAN ENDPOINTS ====================

  @Get('plans')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getPlans(
    @Request() req: AuthenticatedRequest,
    @Query('active') active?: string
  ) {
    // Se active=true, retorna apenas planos ativos (para UI de assinaturas)
    if (active === 'true') {
      return this.service.getAvailablePlans(req.user.salonId);
    }
    return this.service.getPlans(req.user.salonId);
  }

  @Get('plans/:id')
  @Roles('OWNER', 'MANAGER')
  async getPlanById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.service.getPlanById(id, req.user.salonId);
  }

  @Post('plans')
  @Roles('OWNER', 'MANAGER')
  async createPlan(@Body() dto: CreatePlanDto, @Request() req: AuthenticatedRequest) {
    return this.service.createPlan(req.user.salonId, dto);
  }

  @Patch('plans/:id')
  @Roles('OWNER', 'MANAGER')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.updatePlan(id, req.user.salonId, dto);
  }

  @Delete('plans/:id')
  @Roles('OWNER', 'MANAGER')
  async deletePlan(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.service.deletePlan(id, req.user.salonId);
    return { message: 'Plano removido com sucesso' };
  }

  @Post('plans/:id/items')
  @Roles('OWNER', 'MANAGER')
  async addPlanItem(
    @Param('id') id: string,
    @Body() dto: AddPlanItemDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.addPlanItem(id, req.user.salonId, dto);
  }

  @Delete('plans/:planId/items/:itemId')
  @Roles('OWNER', 'MANAGER')
  async removePlanItem(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.removePlanItem(planId, itemId, req.user.salonId);
  }

  // ==================== SUBSCRIPTION ENDPOINTS ====================

  @Get('available')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getAvailablePlans(@Request() req: AuthenticatedRequest) {
    return this.service.getAvailablePlans(req.user.salonId);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getSubscriptions(
    @Request() req: AuthenticatedRequest,
    @Query('clientId') clientId?: string
  ) {
    return this.service.getSubscriptions(req.user.salonId, clientId);
  }

  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.service.getStats(req.user.salonId);
  }

  /**
   * GET /product-subscriptions/subscriptions/my
   * Retorna as assinaturas de produtos do salao do usuario logado
   * Usado pela pagina de Assinaturas do frontend
   */
  @Get('subscriptions/my')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getMySubscriptions(@Request() req: AuthenticatedRequest) {
    return this.service.getSubscriptions(req.user.salonId);
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getSubscriptionById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.service.getSubscriptionById(id, req.user.salonId);
  }

  @Post('subscribe/:planId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async subscribe(
    @Param('planId') planId: string,
    @Body() dto: SubscribeDto & { clientId: string },
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.subscribe(req.user.salonId, dto.clientId, planId, dto);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async updateSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.updateSubscription(id, req.user.salonId, dto);
  }

  @Post(':id/pause')
  @Roles('OWNER', 'MANAGER')
  async pauseSubscription(
    @Param('id') id: string,
    @Body() dto: PauseSubscriptionDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.pauseSubscription(id, req.user.salonId, dto);
  }

  /**
   * POST /product-subscriptions/subscriptions/:id/pause
   * Rota alternativa para pausar assinatura (compatibilidade com frontend)
   */
  @Post('subscriptions/:id/pause')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async pauseSubscriptionAlt(
    @Param('id') id: string,
    @Body() dto: PauseSubscriptionDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.pauseSubscription(id, req.user.salonId, dto);
  }

  @Post(':id/resume')
  @Roles('OWNER', 'MANAGER')
  async resumeSubscription(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.service.resumeSubscription(id, req.user.salonId);
  }

  /**
   * POST /product-subscriptions/subscriptions/:id/resume
   * Rota alternativa para retomar assinatura (compatibilidade com frontend)
   */
  @Post('subscriptions/:id/resume')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async resumeSubscriptionAlt(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.service.resumeSubscription(id, req.user.salonId);
  }

  @Post(':id/cancel')
  @Roles('OWNER', 'MANAGER')
  async cancelSubscription(
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.cancelSubscription(id, req.user.salonId, dto);
  }

  /**
   * POST /product-subscriptions/subscriptions/:id/cancel
   * Rota alternativa para cancelar assinatura (compatibilidade com frontend)
   */
  @Post('subscriptions/:id/cancel')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async cancelSubscriptionAlt(
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.cancelSubscription(id, req.user.salonId, dto);
  }

  // ==================== DELIVERY ENDPOINTS ====================

  @Get('deliveries/all')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getDeliveries(
    @Request() req: AuthenticatedRequest,
    @Query('date') date?: string,
    @Query('status') status?: string
  ) {
    return this.service.getDeliveries(req.user.salonId, { date, status });
  }

  @Get('deliveries/pending')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getPendingDeliveries(@Request() req: AuthenticatedRequest) {
    return this.service.getPendingDeliveries(req.user.salonId);
  }

  @Get(':id/deliveries')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getSubscriptionDeliveries(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.service.getSubscriptionDeliveries(id, req.user.salonId);
  }

  @Patch('deliveries/:id/status')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.service.updateDeliveryStatus(id, req.user.salonId, dto, req.user.sub);
  }

  @Post('deliveries/:id/generate-command')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async generateCommand(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.service.generateCommand(id, req.user.salonId, req.user.sub);
  }
}

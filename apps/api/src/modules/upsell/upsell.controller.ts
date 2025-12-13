import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UpsellService } from './upsell.service';
import { CreateUpsellRuleDto, UpdateUpsellRuleDto, AcceptOfferDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('upsell')
@UseGuards(AuthGuard, RolesGuard)
export class UpsellController {
  constructor(private readonly upsellService: UpsellService) {}

  // ==================== RULES ====================

  @Get('rules')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getRules(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('triggerType') triggerType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.upsellService.getRules(req.user.salonId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      triggerType,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('rules/:id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getRule(@Request() req: any, @Param('id') id: string) {
    return this.upsellService.getRuleById(req.user.salonId, id);
  }

  @Post('rules')
  @Roles('OWNER', 'MANAGER')
  async createRule(@Request() req: any, @Body() dto: CreateUpsellRuleDto) {
    return this.upsellService.createRule(req.user.salonId, dto);
  }

  @Patch('rules/:id')
  @Roles('OWNER', 'MANAGER')
  async updateRule(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUpsellRuleDto,
  ) {
    return this.upsellService.updateRule(req.user.salonId, id, dto);
  }

  @Delete('rules/:id')
  @Roles('OWNER', 'MANAGER')
  async deleteRule(@Request() req: any, @Param('id') id: string) {
    return this.upsellService.deleteRule(req.user.salonId, id);
  }

  // ==================== OFFERS ====================

  @Get('for-appointment/:appointmentId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getOffersForAppointment(
    @Request() req: any,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.upsellService.getOffersForAppointment(req.user.salonId, appointmentId);
  }

  @Get('for-service/:serviceId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getOffersForService(
    @Request() req: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.upsellService.getOffersForService(req.user.salonId, parseInt(serviceId, 10));
  }

  @Get('for-client/:clientId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getPersonalizedOffers(
    @Request() req: any,
    @Param('clientId') clientId: string,
  ) {
    return this.upsellService.getPersonalizedOffers(req.user.salonId, clientId);
  }

  @Get('offers')
  @Roles('OWNER', 'MANAGER')
  async getOffers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('ruleId') ruleId?: string,
  ) {
    return this.upsellService.getOffers(req.user.salonId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      clientId,
      ruleId,
    });
  }

  @Post('offers/:id/accept')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async acceptOffer(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AcceptOfferDto,
  ) {
    return this.upsellService.acceptOffer(req.user.salonId, id, dto.commandId);
  }

  @Post('offers/:id/decline')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async declineOffer(@Request() req: any, @Param('id') id: string) {
    return this.upsellService.declineOffer(req.user.salonId, id);
  }

  // ==================== STATS ====================

  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.upsellService.getStats(req.user.salonId, startDate, endDate);
  }
}

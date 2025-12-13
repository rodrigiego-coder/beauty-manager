import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, Headers, Ip } from '@nestjs/common';
import { CartLinksService } from './cart-links.service';
import { CreateCartLinkDto, UpdateCartLinkDto, ConvertCartLinkDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('cart-links')
export class CartLinksController {
  constructor(private readonly cartLinksService: CartLinksService) {}

  // ==================== AUTHENTICATED ROUTES ====================

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getLinks(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.cartLinksService.getLinks(req.user.salonId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      source,
      clientId,
    });
  }

  @Get('stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.cartLinksService.getStats(req.user.salonId, startDate, endDate);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getLinkById(@Request() req: any, @Param('id') id: string) {
    return this.cartLinksService.getLinkById(req.user.salonId, id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async createLink(@Request() req: any, @Body() dto: CreateCartLinkDto) {
    return this.cartLinksService.createLink(req.user.salonId, dto, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  async updateLink(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartLinkDto,
  ) {
    return this.cartLinksService.updateLink(req.user.salonId, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  async deleteLink(@Request() req: any, @Param('id') id: string) {
    await this.cartLinksService.deleteLink(req.user.salonId, id);
    return { success: true };
  }

  // ==================== PUBLIC ROUTES ====================

  @Get('public/:code')
  async getPublicLink(
    @Param('code') code: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('referer') referrer?: string,
  ) {
    // Record view
    await this.cartLinksService.recordView(code, { ipAddress: ip, userAgent, referrer });

    return this.cartLinksService.getLinkByCode(code);
  }

  @Post('public/:code/convert')
  async convertPublicLink(
    @Param('code') code: string,
    @Body() dto: ConvertCartLinkDto,
  ) {
    return this.cartLinksService.convertLink(code, dto);
  }

  // ==================== AUTHENTICATED CONVERSION ====================

  @Post(':id/convert')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async convertLink(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ConvertCartLinkDto,
  ) {
    const link = await this.cartLinksService.getLinkById(req.user.salonId, id);
    return this.cartLinksService.convertLink(link.code, dto, req.user.userId);
  }
}

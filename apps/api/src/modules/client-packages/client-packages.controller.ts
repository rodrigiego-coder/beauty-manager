import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientPackagesService, ConsumeSessionDto, AdjustBalanceDto } from './client-packages.service';

@Controller('client-packages')
export class ClientPackagesController {
  constructor(private readonly clientPackagesService: ClientPackagesService) {}

  /**
   * GET /client-packages/client/:clientId
   * List all packages for a client
   */
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.clientPackagesService.findByClient(clientId);
  }

  /**
   * GET /client-packages/client/:clientId/active
   * List active packages with balances for a client
   */
  @Get('client/:clientId/active')
  async findActiveByClient(@Param('clientId') clientId: string) {
    return this.clientPackagesService.findActiveByClientWithBalances(clientId);
  }

  /**
   * GET /client-packages/client/:clientId/stats
   * Get client package statistics
   */
  @Get('client/:clientId/stats')
  async getClientStats(@Param('clientId') clientId: string) {
    return this.clientPackagesService.getClientStats(clientId);
  }

  /**
   * GET /client-packages/:id
   * Find client package by ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const clientPkg = await this.clientPackagesService.findById(id);

    if (!clientPkg) {
      throw new NotFoundException('Client package not found');
    }

    return clientPkg;
  }

  /**
   * GET /client-packages/:id/balances
   * Get balances for a client package
   */
  @Get(':id/balances')
  async getBalances(@Param('id', ParseIntPipe) id: number) {
    const clientPkg = await this.clientPackagesService.findByIdWithBalances(id);

    if (!clientPkg) {
      throw new NotFoundException('Client package not found');
    }

    return clientPkg;
  }

  /**
   * GET /client-packages/:id/history
   * Get usage history for a client package
   */
  @Get(':id/history')
  async getUsageHistory(@Param('id', ParseIntPipe) id: number) {
    const clientPkg = await this.clientPackagesService.findById(id);

    if (!clientPkg) {
      throw new NotFoundException('Client package not found');
    }

    return this.clientPackagesService.getUsageHistory(id);
  }

  /**
   * POST /client-packages/purchase
   * Purchase a package for a client
   */
  @Post('purchase')
  async purchase(
    @Body() data: { clientId: string; packageId: number; salonId: string },
  ) {
    return this.clientPackagesService.purchasePackage(
      data.clientId,
      data.packageId,
      data.salonId,
    );
  }

  /**
   * POST /client-packages/consume
   * Consume a session from a package
   */
  @Post('consume')
  async consumeSession(@Body() data: ConsumeSessionDto) {
    return this.clientPackagesService.consumeSession(data);
  }

  /**
   * POST /client-packages/:id/use
   * Use a session from the package (legacy endpoint)
   * @deprecated Use POST /client-packages/consume instead
   */
  @Post(':id/use')
  async useSession(@Param('id', ParseIntPipe) id: number) {
    return this.clientPackagesService.useSession(id);
  }

  /**
   * POST /client-packages/usages/:usageId/revert
   * Revert a consumed session
   */
  @Post('usages/:usageId/revert')
  async revertSession(
    @Param('usageId', ParseIntPipe) usageId: number,
    @Body() data: { notes?: string },
  ) {
    return this.clientPackagesService.revertSession(usageId, data.notes);
  }

  /**
   * POST /client-packages/check-service
   * Check if client has valid package for a service
   */
  @Post('check-service')
  async checkService(
    @Body() data: { clientId: string; serviceId: number },
  ) {
    return this.clientPackagesService.hasValidPackageForService(
      data.clientId,
      data.serviceId,
    );
  }

  /**
   * PATCH /client-packages/:id/adjust-balance
   * Manually adjust session balance (for clients who started before the system)
   */
  @Patch(':id/adjust-balance')
  async adjustBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AdjustBalanceDto,
  ) {
    return this.clientPackagesService.adjustSessionBalance(id, data);
  }

  /**
   * DELETE /client-packages/:id
   * Cancel a client package
   */
  @Delete(':id')
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const clientPkg = await this.clientPackagesService.cancel(id);

    if (!clientPkg) {
      throw new NotFoundException('Client package not found');
    }

    return { message: 'Package cancelled successfully' };
  }
}

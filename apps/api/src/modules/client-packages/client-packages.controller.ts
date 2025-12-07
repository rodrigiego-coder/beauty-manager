import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientPackagesService } from './client-packages.service';

@Controller('client-packages')
export class ClientPackagesController {
  constructor(private readonly clientPackagesService: ClientPackagesService) {}

  /**
   * GET /client-packages/client/:clientId
   * Lista todos os pacotes de um cliente
   */
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.clientPackagesService.findByClient(clientId);
  }

  /**
   * GET /client-packages/client/:clientId/active
   * Lista pacotes ativos de um cliente
   */
  @Get('client/:clientId/active')
  async findActiveByClient(@Param('clientId') clientId: string) {
    return this.clientPackagesService.findActiveByClient(clientId);
  }

  /**
   * GET /client-packages/client/:clientId/stats
   * Estatísticas dos pacotes do cliente
   */
  @Get('client/:clientId/stats')
  async getClientStats(@Param('clientId') clientId: string) {
    return this.clientPackagesService.getClientStats(clientId);
  }

  /**
   * GET /client-packages/:id
   * Busca pacote do cliente por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const clientPkg = await this.clientPackagesService.findById(id);

    if (!clientPkg) {
      throw new NotFoundException('Pacote do cliente nao encontrado');
    }

    return clientPkg;
  }

  /**
   * POST /client-packages/purchase
   * Compra de pacote pelo cliente
   */
  @Post('purchase')
  async purchase(
    @Body() data: { clientId: string; packageId: number },
  ) {
    return this.clientPackagesService.purchasePackage(data.clientId, data.packageId);
  }

  /**
   * POST /client-packages/:id/use
   * Usa uma sessão do pacote
   */
  @Post(':id/use')
  async useSession(@Param('id', ParseIntPipe) id: number) {
    return this.clientPackagesService.useSession(id);
  }

  /**
   * POST /client-packages/check-service
   * Verifica se cliente tem pacote válido para um serviço
   */
  @Post('check-service')
  async checkService(
    @Body() data: { clientId: string; serviceName: string },
  ) {
    return this.clientPackagesService.hasValidPackageForService(
      data.clientId,
      data.serviceName,
    );
  }

  /**
   * DELETE /client-packages/:id
   * Cancela um pacote do cliente
   */
  @Delete(':id')
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const clientPkg = await this.clientPackagesService.cancel(id);

    if (!clientPkg) {
      throw new NotFoundException('Pacote do cliente nao encontrado');
    }

    return { message: 'Pacote cancelado com sucesso' };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** User payload from JWT token */
interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('clients')
@UseGuards(AuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * GET /clients
   * Lista todos os clientes do salão
   */
  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.clientsService.findAll({
      salonId: user.salonId,
      search,
      includeInactive: includeInactive === 'true',
    });
  }

  /**
   * GET /clients/stats
   * Retorna estatísticas dos clientes
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.clientsService.getStats(user.salonId);
  }

  /**
   * GET /clients/search?term=xxx
   * Busca clientes por termo
   */
  @Get('search')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async search(
    @CurrentUser() user: CurrentUserPayload,
    @Query('term') term: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    if (!term || term.length < 2) {
      return [];
    }
    return this.clientsService.search(user.salonId, term, includeInactive === 'true');
  }

  /**
   * GET /clients/:id
   * Busca cliente por ID
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const client = await this.clientsService.findById(id);

    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return client;
  }

  /**
   * GET /clients/:id/history
   * Retorna histórico de comandas do cliente
   */
  @Get(':id/history')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getHistory(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const client = await this.clientsService.findById(id);
    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.getHistory(id);
  }

  /**
   * POST /clients
   * Cria um novo cliente
   */
  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: CreateClientDto,
  ) {
    return this.clientsService.create({
      ...data,
      salonId: user.salonId,
    });
  }

  /**
   * PATCH /clients/:id
   * Atualiza um cliente
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdateClientDto,
  ) {
    // Verificar se cliente pertence ao salão
    const existing = await this.clientsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    const client = await this.clientsService.update(id, data);
    return client;
  }

  /**
   * PATCH /clients/:id/reactivate
   * Reativa um cliente desativado
   */
  @Patch(':id/reactivate')
  @Roles('OWNER', 'MANAGER')
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const existing = await this.clientsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.reactivate(id);
  }

  /**
   * DELETE /clients/:id
   * Desativa um cliente (soft delete)
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const existing = await this.clientsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    await this.clientsService.delete(id);
    return { message: 'Cliente desativado com sucesso' };
  }

  /**
   * PATCH /clients/:id/toggle-ai
   * Alterna o status da IA para o cliente
   */
  @Patch(':id/toggle-ai')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async toggleAi(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const client = await this.clientsService.findById(id);
    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.setAiActive(id, !client.aiActive);
  }
}

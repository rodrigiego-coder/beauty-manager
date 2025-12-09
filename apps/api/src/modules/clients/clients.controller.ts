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
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { CurrentUser } from '../../common/decorators';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * GET /clients
   * Lista todos os clientes do salão
   */
  @Get()
  async findAll(@CurrentUser() user: { salonId: string }) {
    return this.clientsService.findAll(user.salonId);
  }

  /**
   * GET /clients/search?term=xxx
   * Busca clientes por termo
   */
  @Get('search')
  async search(
    @CurrentUser() user: { salonId: string },
    @Query('term') term: string,
  ) {
    if (!term || term.length < 2) {
      return [];
    }
    return this.clientsService.search(user.salonId, term);
  }

  /**
   * GET /clients/:id
   * Busca cliente por ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const client = await this.clientsService.findById(id);

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return client;
  }

  /**
   * POST /clients
   * Cria um novo cliente
   */
  @Post()
  async create(
    @CurrentUser() user: { salonId: string },
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
  async update(
    @Param('id') id: string,
    @Body() data: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(id, data);

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return client;
  }

  /**
   * DELETE /clients/:id
   * Remove um cliente
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.clientsService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return { message: 'Cliente removido com sucesso' };
  }

  /**
   * PATCH /clients/:id/toggle-ai
   * Alterna o status da IA para o cliente
   */
  @Patch(':id/toggle-ai')
  async toggleAi(@Param('id') id: string) {
    const client = await this.clientsService.findById(id);
    
    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    const updated = await this.clientsService.setAiActive(id, !client.aiActive);
    return updated;
  }
}
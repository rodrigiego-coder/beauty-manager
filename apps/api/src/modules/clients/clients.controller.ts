import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * GET /clients/:phone
   * Busca cliente pelo telefone
   */
  @Get(':phone')
  async getClient(@Param('phone') phone: string) {
    const client = await this.clientsService.findByPhone(phone);

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return client;
  }

  /**
   * PATCH /clients/:phone
   * Atualiza um cliente
   */
  @Patch(':phone')
  async update(
    @Param('phone') phone: string,
    @Body() data: UpdateClientDto,
  ) {
    const client = await this.clientsService.findByPhone(phone);

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.update(client.id, data as any);
  }

  /**
   * PATCH /clients/:phone/toggle-ai
   * Alterna o status da IA para o cliente
   */
  @Patch(':phone/toggle-ai')
  async toggleAi(@Param('phone') phone: string) {
    const client = await this.clientsService.findOrCreate(phone);
    const updated = await this.clientsService.setAiActive(phone, !client.aiActive);
    return updated;
  }
}
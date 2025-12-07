import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { SalonsService } from './salons.service';
import { NewSalon } from '../../database';

@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  /**
   * GET /salons
   * Lista todos os salões ativos
   */
  @Get()
  async findAll() {
    return this.salonsService.findAll();
  }

  /**
   * GET /salons/:id
   * Busca salão por ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const salon = await this.salonsService.findById(id);

    if (!salon) {
      throw new NotFoundException('Salao nao encontrado');
    }

    return salon;
  }

  /**
   * POST /salons
   * Cria um novo salão
   */
  @Post()
  async create(@Body() data: NewSalon) {
    return this.salonsService.create(data);
  }

  /**
   * PATCH /salons/:id
   * Atualiza um salão
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<NewSalon>,
  ) {
    const salon = await this.salonsService.update(id, data);

    if (!salon) {
      throw new NotFoundException('Salao nao encontrado');
    }

    return salon;
  }

  /**
   * DELETE /salons/:id
   * Desativa um salão (soft delete)
   */
  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    const salon = await this.salonsService.deactivate(id);

    if (!salon) {
      throw new NotFoundException('Salao nao encontrado');
    }

    return { message: 'Salao desativado com sucesso' };
  }
}

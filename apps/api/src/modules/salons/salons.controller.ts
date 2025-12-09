import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SalonsService } from './salons.service';
import { NewSalon } from '../../database';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  salonId: string;
}

@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  /**
   * GET /salons/my
   * Retorna o salao do usuario logado
   */
  @Get('my')
  async getMySalon(@CurrentUser() user: AuthUser) {
    if (!user || !user.salonId) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    const salon = await this.salonsService.findById(user.salonId);

    if (!salon) {
      throw new NotFoundException('Salao nao encontrado');
    }

    return salon;
  }

  /**
   * PATCH /salons/my
   * Atualiza o salao do usuario logado
   */
  @Patch('my')
  async updateMySalon(
    @CurrentUser() user: AuthUser,
    @Body() data: Partial<NewSalon>,
  ) {
    if (!user || !user.salonId) {
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    // Apenas OWNER e MANAGER podem atualizar o salao
    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      throw new UnauthorizedException('Sem permissao para atualizar o salao');
    }

    const salon = await this.salonsService.update(user.salonId, data);

    if (!salon) {
      throw new NotFoundException('Salao nao encontrado');
    }

    return {
      ...salon,
      message: 'Salao atualizado com sucesso',
    };
  }

  /**
   * GET /salons
   * Lista todos os saloes ativos
   */
  @Get()
  async findAll() {
    return this.salonsService.findAll();
  }

  /**
   * GET /salons/:id
   * Busca salao por ID
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
   * Cria um novo salao
   */
  @Post()
  async create(@Body() data: NewSalon) {
    return this.salonsService.create(data);
  }

  /**
   * PATCH /salons/:id
   * Atualiza um salao
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
   * Desativa um salao (soft delete)
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
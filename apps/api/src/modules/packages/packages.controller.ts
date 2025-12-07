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
  ParseIntPipe,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { NewPackage } from '../../database';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  /**
   * GET /packages
   * Lista todos os pacotes ativos
   */
  @Get()
  async findAll(@Query('salonId') salonId?: string) {
    return this.packagesService.findAll(salonId);
  }

  /**
   * GET /packages/:id
   * Busca pacote por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const pkg = await this.packagesService.findById(id);

    if (!pkg) {
      throw new NotFoundException('Pacote nao encontrado');
    }

    return pkg;
  }

  /**
   * POST /packages
   * Cria um novo pacote
   */
  @Post()
  async create(@Body() data: NewPackage) {
    return this.packagesService.create(data);
  }

  /**
   * PATCH /packages/:id
   * Atualiza um pacote
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<NewPackage>,
  ) {
    const pkg = await this.packagesService.update(id, data);

    if (!pkg) {
      throw new NotFoundException('Pacote nao encontrado');
    }

    return pkg;
  }

  /**
   * DELETE /packages/:id
   * Desativa um pacote (soft delete)
   */
  @Delete(':id')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const pkg = await this.packagesService.deactivate(id);

    if (!pkg) {
      throw new NotFoundException('Pacote nao encontrado');
    }

    return { message: 'Pacote desativado com sucesso' };
  }
}

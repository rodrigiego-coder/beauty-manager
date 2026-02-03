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
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto, TransferStockDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products
   * Lista todos os produtos do salão com filtros opcionais
   */
  @Get()
  @Roles('OWNER', 'MANAGER')
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
    @Query('retailOnly') retailOnly?: string,
    @Query('backbarOnly') backbarOnly?: string,
  ) {
    return this.productsService.findAll({
      salonId: user.salonId,
      search,
      includeInactive: includeInactive === 'true',
      lowStockOnly: lowStockOnly === 'true',
      retailOnly: retailOnly === 'true',
      backbarOnly: backbarOnly === 'true',
    });
  }

  /**
   * GET /products/stats
   * Retorna estatísticas do estoque
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.productsService.getStats(user.salonId);
  }

  /**
   * GET /products/low-stock
   * Lista produtos com estoque baixo
   */
  @Get('low-stock')
  @Roles('OWNER', 'MANAGER')
  async findLowStock(@CurrentUser() user: CurrentUserPayload) {
    return this.productsService.findLowStock(user.salonId);
  }

  /**
   * PATCH /products/bulk-status
   * Ativa/desativa múltiplos produtos de uma vez
   */
  @Patch('bulk-status')
  @Roles('OWNER', 'MANAGER')
  async bulkUpdateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { ids: number[]; active: boolean },
  ) {
    return this.productsService.bulkUpdateStatus(body.ids, body.active, user.salonId);
  }

  /**
   * GET /products/:id
   * Busca produto por ID
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const product = await this.productsService.findById(id);

    if (!product || product.salonId !== user.salonId) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return product;
  }

  /**
   * POST /products
   * Cria um novo produto
   */
  @Post()
  @Roles('OWNER', 'MANAGER')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: CreateProductDto,
  ) {
    return this.productsService.create(user.salonId, data as any);
  }

  /**
   * PATCH /products/:id
   * Atualiza um produto
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdateProductDto,
  ) {
    // Verificar se produto pertence ao salão
    const existing = await this.productsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Produto nao encontrado');
    }

    const product = await this.productsService.update(id, data as any);
    return product;
  }

  /**
   * POST /products/:id/adjust-stock
   * Ajusta o estoque (entrada ou saída manual)
   */
  @Post(':id/adjust-stock')
  @Roles('OWNER', 'MANAGER')
  async adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: AdjustStockDto,
  ) {
    return this.productsService.adjustStock(
      id,
      user.salonId,
      user.id,
      data,
    );
  }

  /**
   * POST /products/:id/transfer
   * Transfere estoque entre localizações (RETAIL <-> INTERNAL)
   */
  @Post(':id/transfer')
  @Roles('OWNER', 'MANAGER')
  async transferStock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: TransferStockDto,
  ) {
    // Verificar se produto pertence ao salão
    const existing = await this.productsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return this.productsService.transferStock(
      id,
      user.salonId,
      user.id,
      data.quantity,
      data.fromLocation,
      data.toLocation,
      data.reason,
    );
  }

  /**
   * PATCH /products/:id/reactivate
   * Reativa um produto desativado
   */
  @Patch(':id/reactivate')
  @Roles('OWNER', 'MANAGER')
  async reactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se produto pertence ao salão
    const existing = await this.productsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Produto nao encontrado');
    }

    const product = await this.productsService.reactivate(id);
    return product;
  }

  /**
   * DELETE /products/:id
   * Desativa um produto (soft delete)
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se produto pertence ao salão
    const existing = await this.productsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Produto nao encontrado');
    }

    await this.productsService.delete(id);
    return { message: 'Produto desativado com sucesso' };
  }
}

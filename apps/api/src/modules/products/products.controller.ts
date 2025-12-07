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
import { ProductsService } from './products.service';
import { NewProduct } from '../../database';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products
   * Lista todos os produtos ativos
   */
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  /**
   * GET /products/low-stock
   * Lista produtos com estoque baixo
   */
  @Get('low-stock')
  async findLowStock() {
    return this.productsService.findLowStock();
  }

  /**
   * GET /products/:id
   * Busca produto por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.findById(id);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return product;
  }

  /**
   * POST /products
   * Cria um novo produto
   */
  @Post()
  async create(@Body() data: NewProduct) {
    return this.productsService.create(data);
  }

  /**
   * PATCH /products/:id
   * Atualiza um produto
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<NewProduct>,
  ) {
    const product = await this.productsService.update(id, data);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return product;
  }

  /**
   * PATCH /products/:id/stock
   * Atualiza o estoque (adiciona ou remove quantidade)
   */
  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    const product = await this.productsService.updateStock(id, quantity);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return product;
  }

  /**
   * DELETE /products/:id
   * Desativa um produto (soft delete)
   */
  @Delete(':id')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.deactivate(id);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    return { message: 'Produto desativado com sucesso' };
  }
}

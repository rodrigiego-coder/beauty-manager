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
import { ConsumedProductsService } from './consumed-products.service';

@Controller('consumed-products')
export class ConsumedProductsController {
  constructor(private readonly consumedProductsService: ConsumedProductsService) {}

  /**
   * GET /consumed-products
   * Lista todos os produtos consumidos
   */
  @Get()
  async findAll() {
    return this.consumedProductsService.findAll();
  }

  /**
   * GET /consumed-products/appointment/:appointmentId
   * Lista produtos consumidos por agendamento
   */
  @Get('appointment/:appointmentId')
  async findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.consumedProductsService.findByAppointment(appointmentId);
  }

  /**
   * GET /consumed-products/appointment/:appointmentId/cost
   * Calcula o custo total de produtos de um atendimento
   */
  @Get('appointment/:appointmentId/cost')
  async calculateCost(@Param('appointmentId') appointmentId: string) {
    return this.consumedProductsService.calculateAppointmentCost(appointmentId);
  }

  /**
   * GET /consumed-products/appointment/:appointmentId/profit
   * Calcula o lucro real de um atendimento
   */
  @Get('appointment/:appointmentId/profit')
  async calculateProfit(@Param('appointmentId') appointmentId: string) {
    return this.consumedProductsService.calculateAppointmentProfit(appointmentId);
  }

  /**
   * POST /consumed-products
   * Registra consumo de produto em atendimento
   */
  @Post()
  async register(
    @Body()
    data: {
      appointmentId: string;
      productId: number;
      quantityUsed: number;
    },
  ) {
    return this.consumedProductsService.register(data);
  }

  /**
   * DELETE /consumed-products/:id
   * Remove um consumo (estorna o estoque)
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const removed = await this.consumedProductsService.remove(id);

    if (!removed) {
      throw new NotFoundException('Consumo nao encontrado');
    }

    return { message: 'Consumo removido e estoque estornado' };
  }
}

import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  consumedProducts,
  ConsumedProduct,
  NewConsumedProduct,
  products,
  appointments,
} from '../../database';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ConsumedProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Lista todos os produtos consumidos
   */
  async findAll(): Promise<ConsumedProduct[]> {
    return this.db.select().from(consumedProducts);
  }

  /**
   * Lista produtos consumidos por agendamento
   */
  async findByAppointment(appointmentId: string): Promise<ConsumedProduct[]> {
    return this.db
      .select()
      .from(consumedProducts)
      .where(eq(consumedProducts.appointmentId, appointmentId));
  }

  /**
   * Registra consumo de produto em atendimento
   * - Busca o custo atual do produto
   * - Desconta do estoque via ProductsService.adjustStock (auditoria em stock_adjustments)
   * - Registra o consumo com o custo no momento
   */
  async register(data: {
    appointmentId: string;
    productId: number;
    quantityUsed: number;
    salonId: string;
    userId: string;
  }): Promise<ConsumedProduct> {
    // Busca o produto para obter o custo atual
    const product = await this.productsService.findById(data.productId);

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    // Validação multi-tenant
    if (product.salonId !== data.salonId) {
      throw new NotFoundException('Produto nao encontrado');
    }

    if (!product.active) {
      throw new BadRequestException('Produto esta inativo');
    }

    // Verifica estoque disponível (usa stockInternal para consumo de serviço)
    if (product.stockInternal < data.quantityUsed) {
      throw new BadRequestException(
        `Estoque interno insuficiente. Disponivel: ${product.stockInternal} ${product.unit}`,
      );
    }

    // Desconta do estoque INTERNAL via ProductsService (registra em stock_movements)
    await this.productsService.adjustStockWithLocation({
      productId: data.productId,
      salonId: data.salonId,
      userId: data.userId,
      quantity: -data.quantityUsed, // negativo = saída
      locationType: 'INTERNAL',
      movementType: 'SERVICE_CONSUMPTION',
      reason: 'Consumo em serviço',
      referenceType: 'appointment',
      referenceId: data.appointmentId,
    });

    // Registra o consumo com o custo no momento
    const consumed: NewConsumedProduct = {
      appointmentId: data.appointmentId,
      productId: data.productId,
      quantityUsed: data.quantityUsed.toString(),
      costAtTime: product.costPrice,
    };

    const result = await this.db
      .insert(consumedProducts)
      .values(consumed)
      .returning();

    return result[0];
  }

  /**
   * Calcula o custo total de produtos de um atendimento
   */
  async calculateAppointmentCost(appointmentId: string): Promise<{
    items: { productId: number; productName: string; quantity: string; unitCost: string; totalCost: number }[];
    totalCost: number;
  }> {
    const consumed = await this.findByAppointment(appointmentId);

    const items = [];
    let totalCost = 0;

    for (const item of consumed) {
      const productResult = await this.db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      const product = productResult[0];
      const quantity = parseFloat(item.quantityUsed);
      const unitCost = parseFloat(item.costAtTime);
      const itemTotal = quantity * unitCost;

      items.push({
        productId: item.productId,
        productName: product?.name || 'Produto removido',
        quantity: item.quantityUsed,
        unitCost: item.costAtTime,
        totalCost: Math.round(itemTotal * 100) / 100,
      });

      totalCost += itemTotal;
    }

    return {
      items,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }

  /**
   * Calcula lucro real de um atendimento (preço - custos)
   */
  async calculateAppointmentProfit(appointmentId: string): Promise<{
    revenue: number;
    productCost: number;
    profit: number;
    profitMargin: number;
  }> {
    // Busca o agendamento para pegar o preço
    const appointmentResult = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    const appointment = appointmentResult[0];

    if (!appointment) {
      throw new BadRequestException('Agendamento nao encontrado');
    }

    const revenue = Number(appointment.price || 0) / 100; // centavos para reais
    const costData = await this.calculateAppointmentCost(appointmentId);
    const productCost = costData.totalCost;
    const profit = revenue - productCost;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue: Math.round(revenue * 100) / 100,
      productCost,
      profit: Math.round(profit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  }

  /**
   * Remove um consumo (estorna o estoque via ProductsService.adjustStock)
   */
  async remove(
    id: number,
    ctx: { salonId: string; userId: string },
  ): Promise<boolean> {
    // Busca o consumo para estornar o estoque
    const consumedResult = await this.db
      .select()
      .from(consumedProducts)
      .where(eq(consumedProducts.id, id))
      .limit(1);

    const consumed = consumedResult[0];

    if (!consumed) {
      return false;
    }

    // Busca o produto para validar tenant
    const product = await this.productsService.findById(consumed.productId);

    if (!product) {
      return false;
    }

    // Validação multi-tenant
    if (product.salonId !== ctx.salonId) {
      return false;
    }

    // Estorna o estoque INTERNAL via ProductsService (registra em stock_movements)
    await this.productsService.adjustStockWithLocation({
      productId: consumed.productId,
      salonId: ctx.salonId,
      userId: ctx.userId,
      quantity: parseFloat(consumed.quantityUsed), // positivo = entrada (estorno)
      locationType: 'INTERNAL',
      movementType: 'RETURN',
      reason: 'Estorno de consumo em serviço',
    });

    // Remove o registro
    await this.db.delete(consumedProducts).where(eq(consumedProducts.id, id));

    return true;
  }
}

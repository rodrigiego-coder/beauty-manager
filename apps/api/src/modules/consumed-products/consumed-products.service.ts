import { Injectable, Inject, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class ConsumedProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
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
   * - Desconta do estoque
   * - Registra o consumo com o custo no momento
   */
  async register(data: {
    appointmentId: string;
    productId: number;
    quantityUsed: number;
  }): Promise<ConsumedProduct> {
    // Busca o produto para obter o custo atual
    const productResult = await this.db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    const product = productResult[0];

    if (!product) {
      throw new BadRequestException('Produto nao encontrado');
    }

    if (!product.active) {
      throw new BadRequestException('Produto esta inativo');
    }

    // Verifica estoque disponível
    if (product.currentStock < data.quantityUsed) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponivel: ${product.currentStock} ${product.unit}`,
      );
    }

    // Desconta do estoque
    await this.db
      .update(products)
      .set({
        currentStock: product.currentStock - data.quantityUsed,
        updatedAt: new Date(),
      })
      .where(eq(products.id, data.productId));

    // Registra o consumo com o custo no momento
    const consumed: NewConsumedProduct = {
      appointmentId: data.appointmentId,
      productId: data.productId,
      quantityUsed: data.quantityUsed.toString(),
      costAtTime: product.costPrice, // Custo no momento do uso
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

    const revenue = appointment.price / 100; // centavos para reais
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
   * Remove um consumo (estorna o estoque)
   */
  async remove(id: number): Promise<boolean> {
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

    // Estorna o estoque
    const productResult = await this.db
      .select()
      .from(products)
      .where(eq(products.id, consumed.productId))
      .limit(1);

    const product = productResult[0];

    if (product) {
      await this.db
        .update(products)
        .set({
          currentStock: product.currentStock + parseFloat(consumed.quantityUsed),
          updatedAt: new Date(),
        })
        .where(eq(products.id, consumed.productId));
    }

    // Remove o registro
    await this.db.delete(consumedProducts).where(eq(consumedProducts.id, id));

    return true;
  }
}

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  serviceConsumptions,
  services,
  products,
  ServiceConsumption,
} from '../../database';
import { ConsumptionItemDto } from './dto';

@Injectable()
export class ServiceConsumptionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os consumos de um serviço (BOM)
   */
  async findByService(serviceId: number, salonId: string): Promise<ServiceConsumption[]> {
    // Verificar se o serviço existe e pertence ao salão
    const service = await this.db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.salonId, salonId)))
      .limit(1);

    if (!service.length) {
      throw new NotFoundException('Servico nao encontrado');
    }

    return this.db
      .select()
      .from(serviceConsumptions)
      .where(and(
        eq(serviceConsumptions.serviceId, serviceId),
        eq(serviceConsumptions.salonId, salonId),
      ));
  }

  /**
   * Substitui completamente o BOM de um serviço
   * - Insere novos itens
   * - Atualiza existentes
   * - Remove os que não estão na lista
   */
  async replaceConsumptions(
    serviceId: number,
    salonId: string,
    items: ConsumptionItemDto[],
  ): Promise<ServiceConsumption[]> {
    // Verificar se o serviço existe e pertence ao salão
    const service = await this.db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.salonId, salonId)))
      .limit(1);

    if (!service.length) {
      throw new NotFoundException('Servico nao encontrado');
    }

    // Validar todos os produtos
    const productIds = items.map(i => i.productId);
    if (productIds.length > 0) {
      const foundProducts = await this.db
        .select()
        .from(products)
        .where(and(
          eq(products.salonId, salonId),
          inArray(products.id, productIds),
        ));

      // Verificar se todos os produtos existem
      const foundIds = new Set(foundProducts.map(p => p.id));
      for (const productId of productIds) {
        if (!foundIds.has(productId)) {
          throw new BadRequestException(`Produto ${productId} nao encontrado`);
        }
      }

      // Validar que produtos são backbar (ou pelo menos não são retail-only)
      for (const product of foundProducts) {
        if (!product.isBackbar && product.isRetail) {
          // Produto é apenas retail, não pode ser usado no BOM
          throw new BadRequestException(
            `Produto "${product.name}" (${product.id}) e apenas para venda (retail). ` +
            `Para usar no BOM, marque como "Uso no salao" (backbar).`
          );
        }
      }
    }

    // Remover todos os consumos atuais
    await this.db
      .delete(serviceConsumptions)
      .where(and(
        eq(serviceConsumptions.serviceId, serviceId),
        eq(serviceConsumptions.salonId, salonId),
      ));

    // Se não há itens, retornar vazio
    if (items.length === 0) {
      return [];
    }

    // Inserir novos consumos
    const now = new Date();
    const result = await this.db
      .insert(serviceConsumptions)
      .values(items.map(item => ({
        salonId,
        serviceId,
        productId: item.productId,
        quantity: String(item.quantity),
        unit: item.unit,
        createdAt: now,
        updatedAt: now,
      })))
      .returning();

    return result;
  }

  /**
   * Busca consumos para múltiplos serviços (útil para closeService)
   */
  async findByServiceIds(serviceIds: number[], salonId: string): Promise<ServiceConsumption[]> {
    if (serviceIds.length === 0) {
      return [];
    }

    return this.db
      .select()
      .from(serviceConsumptions)
      .where(and(
        eq(serviceConsumptions.salonId, salonId),
        inArray(serviceConsumptions.serviceId, serviceIds),
      ));
  }
}

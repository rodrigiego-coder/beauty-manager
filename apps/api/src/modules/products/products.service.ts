import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, ilike, or, inArray } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  products,
  stockAdjustments,
  stockMovements,
  Product,
  NewProduct,
  StockAdjustment,
  StockMovement,
  LocationType,
  MovementType,
} from '../../database';

export interface FindAllOptions {
  salonId: string;
  search?: string;
  includeInactive?: boolean;
  lowStockOnly?: boolean;
  retailOnly?: boolean;
  backbarOnly?: boolean;
}

// Interface legada para compatibilidade
export interface AdjustStockData {
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
}

// Nova interface para ajuste de estoque com localização
export interface AdjustStockParams {
  productId: number;
  salonId: string;
  userId: string;
  quantity: number; // positivo = entrada, negativo = saída
  locationType: LocationType;
  movementType: MovementType;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  transferGroupId?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os produtos do salão com filtros opcionais
   */
  async findAll(options: FindAllOptions): Promise<Product[]> {
    const { salonId, search, includeInactive, lowStockOnly, retailOnly, backbarOnly } = options;

    // Construir condições
    const conditions = [eq(products.salonId, salonId)];

    // Filtro de ativos/inativos
    if (!includeInactive) {
      conditions.push(eq(products.active, true));
    }

    // Filtro de produtos vendáveis (retail)
    if (retailOnly) {
      conditions.push(eq(products.isRetail, true));
    }

    // Filtro de produtos de consumo interno (backbar)
    if (backbarOnly) {
      conditions.push(eq(products.isBackbar, true));
    }

    // Busca por nome ou descrição
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(products.name, searchTerm),
          ilike(products.description, searchTerm)
        ) as any
      );
    }

    const result = await this.db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.name);

    // Filtro de estoque baixo (verifica ambos os estoques)
    if (lowStockOnly) {
      return result.filter(p => {
        const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
        const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
        return retailLow || internalLow;
      });
    }

    return result;
  }

  /**
   * Busca produto por ID
   */
  async findById(id: number): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria um novo produto
   */
  async create(salonId: string, data: Omit<NewProduct, 'salonId'>): Promise<Product> {
    const result = await this.db
      .insert(products)
      .values({
        ...data,
        salonId,
        costPrice: String(data.costPrice),
        salePrice: String(data.salePrice),
      })
      .returning();

    return result[0];
  }

  /**
   * Atualiza um produto
   */
  async update(id: number, data: Partial<NewProduct>): Promise<Product | null> {
    // Converter preços para string se fornecidos
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.costPrice !== undefined) {
      updateData.costPrice = String(data.costPrice);
    }
    if (data.salePrice !== undefined) {
      updateData.salePrice = String(data.salePrice);
    }

    const result = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Desativa um produto (soft delete)
   */
  async delete(id: number): Promise<Product | null> {
    return this.update(id, { active: false });
  }

  /**
   * Reativa um produto
   */
  async reactivate(id: number): Promise<Product | null> {
    return this.update(id, { active: true });
  }

  /**
   * Ativa/desativa múltiplos produtos de uma vez
   */
  async bulkUpdateStatus(
    ids: number[],
    active: boolean,
    salonId: string,
  ): Promise<{ updated: number }> {
    if (!ids || ids.length === 0) {
      return { updated: 0 };
    }

    const result = await this.db
      .update(products)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(products.id, ids),
          eq(products.salonId, salonId),
        ),
      )
      .returning();

    return { updated: result.length };
  }

  /**
   * Ajusta o estoque de um produto com localização (NOVO MÉTODO PRINCIPAL)
   * @param params Parâmetros do ajuste de estoque
   * @returns Produto atualizado e movimento registrado
   */
  async adjustStockWithLocation(params: AdjustStockParams): Promise<{ product: Product; movement: StockMovement }> {
    const {
      productId,
      salonId,
      userId,
      quantity,
      locationType,
      movementType,
      reason,
      referenceType,
      referenceId,
      transferGroupId,
    } = params;

    // Buscar produto atual
    const product = await this.findById(productId);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Verificar se o produto pertence ao salão
    if (product.salonId !== salonId) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Determinar estoque atual e calcular novo estoque
    const isRetailLocation = locationType === 'RETAIL';
    const currentStock = isRetailLocation ? product.stockRetail : product.stockInternal;
    const newStock = currentStock + quantity; // quantity já é positivo para entrada, negativo para saída

    // Validar que não fica negativo
    if (newStock < 0) {
      throw new BadRequestException(
        `Estoque ${isRetailLocation ? 'Retail' : 'Internal'} insuficiente. ` +
        `Estoque atual: ${currentStock}, quantidade solicitada: ${Math.abs(quantity)}`
      );
    }

    // Atualizar estoque do produto
    const updateData = isRetailLocation
      ? { stockRetail: newStock }
      : { stockInternal: newStock };

    const updatedProduct = await this.update(productId, updateData);

    // Registrar movimento no histórico
    const [movement] = await this.db
      .insert(stockMovements)
      .values({
        productId,
        salonId,
        locationType,
        delta: quantity,
        movementType,
        referenceType: referenceType || null,
        referenceId: referenceId || null,
        transferGroupId: transferGroupId || null,
        reason: reason || null,
        createdByUserId: userId,
      })
      .returning();

    return {
      product: updatedProduct!,
      movement,
    };
  }

  /**
   * Ajusta o estoque de um produto (MÉTODO LEGADO - mantido para compatibilidade)
   * Por padrão, usa RETAIL e ADJUSTMENT
   */
  async adjustStock(
    id: number,
    salonId: string,
    userId: string,
    data: AdjustStockData
  ): Promise<{ product: Product; adjustment: StockAdjustment }> {
    const { quantity, type, reason } = data;

    // Buscar produto atual
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Verificar se o produto pertence ao salão
    if (product.salonId !== salonId) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Calcular novo estoque (usando stockRetail como padrão para compatibilidade)
    const previousStock = product.stockRetail;
    let newStock: number;

    if (type === 'IN') {
      newStock = previousStock + quantity;
    } else {
      // Verificar se há estoque suficiente para saída
      if (quantity > previousStock) {
        throw new BadRequestException(
          `Estoque insuficiente. Estoque atual: ${previousStock}, quantidade solicitada: ${quantity}`
        );
      }
      newStock = previousStock - quantity;
    }

    // Atualizar estoque do produto (stockRetail)
    const updatedProduct = await this.update(id, { stockRetail: newStock });

    // Registrar ajuste no histórico legado
    const [adjustment] = await this.db
      .insert(stockAdjustments)
      .values({
        productId: id,
        salonId,
        userId,
        type,
        quantity,
        previousStock,
        newStock,
        reason,
      })
      .returning();

    // Também registrar no novo sistema de movimentos
    const delta = type === 'IN' ? quantity : -quantity;
    const movementType: MovementType = type === 'IN' ? 'PURCHASE' : 'ADJUSTMENT';

    await this.db
      .insert(stockMovements)
      .values({
        productId: id,
        salonId,
        locationType: 'RETAIL',
        delta,
        movementType,
        reason,
        createdByUserId: userId,
      });

    return {
      product: updatedProduct!,
      adjustment,
    };
  }

  /**
   * Lista produtos com estoque baixo (verifica ambos os estoques)
   */
  async findLowStock(salonId: string): Promise<Product[]> {
    const allProducts = await this.db
      .select()
      .from(products)
      .where(and(
        eq(products.salonId, salonId),
        eq(products.active, true)
      ));

    // Filtra produtos onde qualquer estoque está baixo
    return allProducts.filter(p => {
      const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
      const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
      return retailLow || internalLow;
    });
  }

  /**
   * Retorna estatísticas do estoque
   */
  async getStats(salonId: string): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalStockValue: number;
    retailStockValue: number;
    internalStockValue: number;
  }> {
    const allProducts = await this.db
      .select()
      .from(products)
      .where(and(
        eq(products.salonId, salonId),
        eq(products.active, true)
      ));

    const lowStockCount = allProducts.filter(p => {
      const retailLow = p.isRetail && p.stockRetail <= p.minStockRetail;
      const internalLow = p.isBackbar && p.stockInternal <= p.minStockInternal;
      return retailLow || internalLow;
    }).length;

    // Calcular valor total em estoque (ambos os estoques)
    let retailStockValue = 0;
    let internalStockValue = 0;

    allProducts.forEach(p => {
      const costPrice = parseFloat(p.costPrice);
      retailStockValue += p.stockRetail * costPrice;
      internalStockValue += p.stockInternal * costPrice;
    });

    return {
      totalProducts: allProducts.length,
      lowStockCount,
      totalStockValue: Math.round((retailStockValue + internalStockValue) * 100) / 100,
      retailStockValue: Math.round(retailStockValue * 100) / 100,
      internalStockValue: Math.round(internalStockValue * 100) / 100,
    };
  }

  /**
   * Busca histórico de ajustes de estoque de um produto (legado)
   */
  async getAdjustmentHistory(productId: number): Promise<StockAdjustment[]> {
    return this.db
      .select()
      .from(stockAdjustments)
      .where(eq(stockAdjustments.productId, productId))
      .orderBy(stockAdjustments.createdAt);
  }

  /**
   * Busca histórico de movimentos de estoque de um produto (novo)
   */
  async getMovementHistory(productId: number): Promise<StockMovement[]> {
    return this.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(stockMovements.createdAt);
  }

  /**
   * Transfere estoque entre localizações (RETAIL <-> INTERNAL)
   */
  async transferStock(
    productId: number,
    salonId: string,
    userId: string,
    quantity: number,
    fromLocation: LocationType,
    toLocation: LocationType,
    reason?: string,
  ): Promise<{ product: Product; movements: StockMovement[] }> {
    if (fromLocation === toLocation) {
      throw new BadRequestException('Origem e destino devem ser diferentes');
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantidade deve ser positiva');
    }

    // Gerar ID de grupo para vincular os dois movimentos
    const transferGroupId = crypto.randomUUID();

    // Saída da origem
    await this.adjustStockWithLocation({
      productId,
      salonId,
      userId,
      quantity: -quantity, // negativo = saída
      locationType: fromLocation,
      movementType: 'TRANSFER',
      reason: reason || `Transferência para ${toLocation}`,
      transferGroupId,
    });

    // Entrada no destino
    const { product: finalProduct } = await this.adjustStockWithLocation({
      productId,
      salonId,
      userId,
      quantity: quantity, // positivo = entrada
      locationType: toLocation,
      movementType: 'TRANSFER',
      reason: reason || `Transferência de ${fromLocation}`,
      transferGroupId,
    });

    // Buscar ambos os movimentos
    const movements = await this.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.transferGroupId, transferGroupId));

    return {
      product: finalProduct,
      movements,
    };
  }
}

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, ilike, or } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  products,
  stockAdjustments,
  Product,
  NewProduct,
  StockAdjustment,
} from '../../database';

export interface FindAllOptions {
  salonId: string;
  search?: string;
  includeInactive?: boolean;
  lowStockOnly?: boolean;
  retailOnly?: boolean;
}

export interface AdjustStockData {
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
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
    const { salonId, search, includeInactive, lowStockOnly, retailOnly } = options;

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

    // Filtro de estoque baixo (feito em memória pois comparação entre colunas)
    if (lowStockOnly) {
      return result.filter(p => p.currentStock <= p.minStock);
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
   * Ajusta o estoque de um produto (entrada ou saída manual)
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

    // Calcular novo estoque
    const previousStock = product.currentStock;
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

    // Atualizar estoque do produto
    const updatedProduct = await this.update(id, { currentStock: newStock });

    // Registrar ajuste no histórico
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

    return {
      product: updatedProduct!,
      adjustment,
    };
  }

  /**
   * Lista produtos com estoque baixo (current_stock <= min_stock)
   */
  async findLowStock(salonId: string): Promise<Product[]> {
    const allProducts = await this.db
      .select()
      .from(products)
      .where(and(
        eq(products.salonId, salonId),
        eq(products.active, true)
      ));

    // Filtra produtos onde currentStock <= minStock
    return allProducts.filter(p => p.currentStock <= p.minStock);
  }

  /**
   * Retorna estatísticas do estoque
   */
  async getStats(salonId: string): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalStockValue: number;
  }> {
    const allProducts = await this.db
      .select()
      .from(products)
      .where(and(
        eq(products.salonId, salonId),
        eq(products.active, true)
      ));

    const lowStockCount = allProducts.filter(p => p.currentStock <= p.minStock).length;

    // Calcular valor total em estoque (currentStock * costPrice)
    const totalStockValue = allProducts.reduce((acc, p) => {
      return acc + (p.currentStock * parseFloat(p.costPrice));
    }, 0);

    return {
      totalProducts: allProducts.length,
      lowStockCount,
      totalStockValue,
    };
  }

  /**
   * Busca histórico de ajustes de estoque de um produto
   */
  async getAdjustmentHistory(productId: number): Promise<StockAdjustment[]> {
    return this.db
      .select()
      .from(stockAdjustments)
      .where(eq(stockAdjustments.productId, productId))
      .orderBy(stockAdjustments.createdAt);
  }
}

import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, and, ilike, or, inArray, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import {
  Database,
  products,
  stockAdjustments,
  stockMovements,
  kitComponents,
  Product,
  NewProduct,
  StockAdjustment,
  StockMovement,
  KitComponent,
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
  movementGroupId?: string;
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

    const rows = await this.db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.name);

    // For KIT products, calculate stock from components
    const kitRows = rows.filter((p) => p.kind === 'KIT');
    const kitStockMap = new Map<number, { retail: number; internal: number }>();

    for (const kit of kitRows) {
      const comps = await this.db
        .select({
          quantity: kitComponents.quantity,
          stockRetail: products.stockRetail,
          stockInternal: products.stockInternal,
        })
        .from(kitComponents)
        .innerJoin(products, eq(products.id, kitComponents.componentProductId))
        .where(eq(kitComponents.kitProductId, kit.id));

      if (comps.length === 0) {
        kitStockMap.set(kit.id, { retail: 0, internal: 0 });
      } else {
        let minRetail = Infinity;
        let minInternal = Infinity;
        for (const c of comps) {
          const qty = parseFloat(c.quantity) || 1;
          minRetail = Math.min(minRetail, Math.floor(c.stockRetail / qty));
          minInternal = Math.min(minInternal, Math.floor(c.stockInternal / qty));
        }
        kitStockMap.set(kit.id, {
          retail: minRetail === Infinity ? 0 : minRetail,
          internal: minInternal === Infinity ? 0 : minInternal,
        });
      }
    }

    const result = rows.map((p) => {
      if (p.kind === 'KIT') {
        const ks = kitStockMap.get(p.id);
        return { ...p, stockRetail: ks?.retail ?? 0, stockInternal: ks?.internal ?? 0 };
      }
      return p;
    });

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
      movementGroupId,
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
        movementGroupId: movementGroupId || null,
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
   * Deduz estoque de todos os componentes de um KIT de forma atômica.
   * Usa SELECT ... FOR UPDATE para evitar corrida e garante all-or-nothing.
   * Retorna os movimentos gerados com o mesmo movementGroupId.
   */
  async deductKitStock(params: {
    kitProductId: number;
    salonId: string;
    userId: string;
    kitQty: number;
    locationType: LocationType;
    referenceType?: string;
    referenceId?: string;
    reason?: string;
  }): Promise<{ movementGroupId: string; movements: StockMovement[] }> {
    const { kitProductId, salonId, userId, kitQty, locationType, referenceType, referenceId, reason } = params;

    // 1. Carregar componentes do kit
    const components = await this.db
      .select()
      .from(kitComponents)
      .where(
        and(
          eq(kitComponents.kitProductId, kitProductId),
          eq(kitComponents.salonId, salonId),
        ),
      );

    if (components.length === 0) {
      throw new BadRequestException(`Produto KIT ID ${kitProductId} não tem componentes cadastrados`);
    }

    // 2. Executar dentro de transação com lock
    const result = await this.db.transaction(async (tx: any) => {
      const movementGroupId = crypto.randomUUID();
      const isRetail = locationType === 'RETAIL';
      const stockCol = isRetail ? 'stock_retail' : 'stock_internal';
      const movements: StockMovement[] = [];

      // Lock e validação de todos os componentes
      for (const comp of components) {
        const requiredQty = Math.ceil(parseFloat(comp.quantity) * kitQty);

        // SELECT ... FOR UPDATE para lock na linha do produto
        const rows = await tx.execute(sql`
          SELECT id, name, ${sql.raw(stockCol)} AS current_stock
          FROM products
          WHERE id = ${comp.componentProductId} AND salon_id = ${salonId}
          FOR UPDATE
        `);

        const row = rows?.rows?.[0] || rows?.[0];
        if (!row) {
          throw new ConflictException(
            `Componente ID ${comp.componentProductId} não encontrado no salão`,
          );
        }

        const currentStock = parseInt(row.current_stock, 10);
        if (currentStock < requiredQty) {
          throw new ConflictException(
            `Estoque insuficiente para o kit: faltou "${row.name}" ` +
            `(necessário ${requiredQty}, disponível ${currentStock})`,
          );
        }

        // Decrementar estoque
        await tx.execute(sql`
          UPDATE products
          SET ${sql.raw(stockCol)} = ${sql.raw(stockCol)} - ${requiredQty},
              updated_at = NOW()
          WHERE id = ${comp.componentProductId}
        `);

        // Registrar movimento
        const [movement] = await tx
          .insert(stockMovements)
          .values({
            productId: comp.componentProductId,
            salonId,
            locationType,
            delta: -requiredQty,
            movementType: 'SALE' as MovementType,
            referenceType: referenceType || 'command',
            referenceId: referenceId || null,
            movementGroupId,
            reason: reason || `Venda KIT (produtoId=${kitProductId})`,
            createdByUserId: userId,
          })
          .returning();

        movements.push(movement);
      }

      return { movementGroupId, movements };
    });

    return result;
  }

  /**
   * Retorna os componentes de um produto KIT.
   */
  async getKitComponents(kitProductId: number, salonId: string): Promise<KitComponent[]> {
    return this.db
      .select()
      .from(kitComponents)
      .where(
        and(
          eq(kitComponents.kitProductId, kitProductId),
          eq(kitComponents.salonId, salonId),
        ),
      );
  }

  /**
   * Retorna componentes de um KIT com dados do produto (nome, estoque).
   */
  async getKitComponentsWithProduct(kitProductId: number, salonId: string) {
    return this.db
      .select({
        id: kitComponents.id,
        componentProductId: kitComponents.componentProductId,
        quantity: kitComponents.quantity,
        productName: products.name,
        stockRetail: products.stockRetail,
        stockInternal: products.stockInternal,
        unit: products.unit,
      })
      .from(kitComponents)
      .innerJoin(products, eq(products.id, kitComponents.componentProductId))
      .where(
        and(
          eq(kitComponents.kitProductId, kitProductId),
          eq(kitComponents.salonId, salonId),
        ),
      );
  }

  /**
   * Substitui todos os componentes de um KIT (replace-all transacional).
   * Valida: kit existe e é KIT, componentes existem e são SIMPLE, salonId confere.
   */
  async setKitComponents(
    kitProductId: number,
    salonId: string,
    componentsList: { componentProductId: number; quantity: number }[],
  ) {
    // 1. Validar que o kit existe e é KIT
    const kit = await this.findById(kitProductId);
    if (!kit || kit.salonId !== salonId) {
      throw new NotFoundException(`Produto KIT ID ${kitProductId} não encontrado`);
    }
    if (kit.kind !== 'KIT') {
      throw new BadRequestException(`Produto ID ${kitProductId} não é um KIT`);
    }

    // 2. Validar componentes
    if (componentsList.length === 0) {
      // Permitir KIT vazio (sem componentes) — delete all
      await this.db
        .delete(kitComponents)
        .where(
          and(
            eq(kitComponents.kitProductId, kitProductId),
            eq(kitComponents.salonId, salonId),
          ),
        );
      return [];
    }

    const compIds = componentsList.map((c) => c.componentProductId);

    // Verificar duplicados no input
    if (new Set(compIds).size !== compIds.length) {
      throw new BadRequestException('Componentes duplicados não são permitidos');
    }

    // Buscar os produtos componentes
    const compProducts = await this.db
      .select()
      .from(products)
      .where(and(inArray(products.id, compIds), eq(products.salonId, salonId)));

    if (compProducts.length !== compIds.length) {
      const foundIds = compProducts.map((p) => p.id);
      const missing = compIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(`Componentes não encontrados: ${missing.join(', ')}`);
    }

    // Validar: nenhum componente pode ser KIT
    const kitComps = compProducts.filter((p) => p.kind === 'KIT');
    if (kitComps.length > 0) {
      throw new BadRequestException(
        `Componentes não podem ser KIT: ${kitComps.map((p) => p.name).join(', ')}`,
      );
    }

    // Validar quantidades
    for (const c of componentsList) {
      if (c.quantity < 1) {
        throw new BadRequestException(`Quantidade deve ser >= 1 para cada componente`);
      }
    }

    // 3. Replace-all transacional
    await this.db.transaction(async (tx: any) => {
      // Delete existing
      await tx
        .delete(kitComponents)
        .where(
          and(
            eq(kitComponents.kitProductId, kitProductId),
            eq(kitComponents.salonId, salonId),
          ),
        );

      // Insert new
      await tx.insert(kitComponents).values(
        componentsList.map((c) => ({
          salonId,
          kitProductId,
          componentProductId: c.componentProductId,
          quantity: c.quantity.toString(),
        })),
      );
    });

    // 4. Retornar lista enriquecida
    return this.getKitComponentsWithProduct(kitProductId, salonId);
  }

  /**
   * Reverte todos os movimentos de estoque de um KIT de forma atômica.
   * Usa SELECT ... FOR UPDATE para consistência (mesmo padrão de deductKitStock).
   * Retorna o novo movementGroupId dos movimentos RETURN gerados.
   */
  async reverseKitStock(params: {
    movementGroupId: string;
    userId: string;
    reason?: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<{ returnGroupId: string; movements: StockMovement[] }> {
    const { movementGroupId, userId, reason, referenceType, referenceId } = params;

    // 1. Buscar movimentos originais do grupo (SALE com delta negativo)
    const originalMovements = await this.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.movementGroupId, movementGroupId));

    if (originalMovements.length === 0) {
      throw new NotFoundException(
        `Nenhum movimento encontrado para movementGroupId=${movementGroupId}`,
      );
    }

    // 2. Transação atômica com lock
    const result = await this.db.transaction(async (tx: any) => {
      const returnGroupId = crypto.randomUUID();
      const returnMovements: StockMovement[] = [];

      for (const orig of originalMovements) {
        const reverseQty = Math.abs(orig.delta);
        const isRetail = orig.locationType === 'RETAIL';
        const stockCol = isRetail ? 'stock_retail' : 'stock_internal';

        // Lock na linha do produto (consistência)
        await tx.execute(sql`
          SELECT id FROM products
          WHERE id = ${orig.productId} AND salon_id = ${orig.salonId}
          FOR UPDATE
        `);

        // Incrementar estoque (devolução)
        await tx.execute(sql`
          UPDATE products
          SET ${sql.raw(stockCol)} = ${sql.raw(stockCol)} + ${reverseQty},
              updated_at = NOW()
          WHERE id = ${orig.productId}
        `);

        // Registrar movimento RETURN
        const [movement] = await tx
          .insert(stockMovements)
          .values({
            productId: orig.productId,
            salonId: orig.salonId,
            locationType: orig.locationType,
            delta: reverseQty,
            movementType: 'RETURN' as MovementType,
            referenceType: referenceType || orig.referenceType,
            referenceId: referenceId || orig.referenceId,
            movementGroupId: returnGroupId,
            reason: reason || `Reversão KIT (grupo original: ${movementGroupId})`,
            createdByUserId: userId,
          })
          .returning();

        returnMovements.push(movement);
      }

      return { returnGroupId, movements: returnMovements };
    });

    return result;
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

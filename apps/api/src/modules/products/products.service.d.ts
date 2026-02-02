import { Database, Product, NewProduct, StockAdjustment, StockMovement, LocationType, MovementType } from '../../database';
export interface FindAllOptions {
    salonId: string;
    search?: string;
    includeInactive?: boolean;
    lowStockOnly?: boolean;
    retailOnly?: boolean;
    backbarOnly?: boolean;
}
export interface AdjustStockData {
    quantity: number;
    type: 'IN' | 'OUT';
    reason: string;
}
export interface AdjustStockParams {
    productId: number;
    salonId: string;
    userId: string;
    quantity: number;
    locationType: LocationType;
    movementType: MovementType;
    reason: string;
    referenceType?: string;
    referenceId?: string;
    transferGroupId?: string;
}
export declare class ProductsService {
    private db;
    constructor(db: Database);
    /**
     * Lista todos os produtos do salão com filtros opcionais
     */
    findAll(options: FindAllOptions): Promise<Product[]>;
    /**
     * Busca produto por ID
     */
    findById(id: number): Promise<Product | null>;
    /**
     * Cria um novo produto
     */
    create(salonId: string, data: Omit<NewProduct, 'salonId'>): Promise<Product>;
    /**
     * Atualiza um produto
     */
    update(id: number, data: Partial<NewProduct>): Promise<Product | null>;
    /**
     * Desativa um produto (soft delete)
     */
    delete(id: number): Promise<Product | null>;
    /**
     * Reativa um produto
     */
    reactivate(id: number): Promise<Product | null>;
    /**
     * Ajusta o estoque de um produto com localização (NOVO MÉTODO PRINCIPAL)
     * @param params Parâmetros do ajuste de estoque
     * @returns Produto atualizado e movimento registrado
     */
    adjustStockWithLocation(params: AdjustStockParams): Promise<{
        product: Product;
        movement: StockMovement;
    }>;
    /**
     * Ajusta o estoque de um produto (MÉTODO LEGADO - mantido para compatibilidade)
     * Por padrão, usa RETAIL e ADJUSTMENT
     */
    adjustStock(id: number, salonId: string, userId: string, data: AdjustStockData): Promise<{
        product: Product;
        adjustment: StockAdjustment;
    }>;
    /**
     * Lista produtos com estoque baixo (verifica ambos os estoques)
     */
    findLowStock(salonId: string): Promise<Product[]>;
    /**
     * Retorna estatísticas do estoque
     */
    getStats(salonId: string): Promise<{
        totalProducts: number;
        lowStockCount: number;
        totalStockValue: number;
        retailStockValue: number;
        internalStockValue: number;
    }>;
    /**
     * Busca histórico de ajustes de estoque de um produto (legado)
     */
    getAdjustmentHistory(productId: number): Promise<StockAdjustment[]>;
    /**
     * Busca histórico de movimentos de estoque de um produto (novo)
     */
    getMovementHistory(productId: number): Promise<StockMovement[]>;
    /**
     * Transfere estoque entre localizações (RETAIL <-> INTERNAL)
     */
    transferStock(productId: number, salonId: string, userId: string, quantity: number, fromLocation: LocationType, toLocation: LocationType, reason?: string): Promise<{
        product: Product;
        movements: StockMovement[];
    }>;
}
//# sourceMappingURL=products.service.d.ts.map
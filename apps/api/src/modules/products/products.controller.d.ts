import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto, TransferStockDto } from './dto';
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    /**
     * GET /products
     * Lista todos os produtos do salão com filtros opcionais
     */
    findAll(user: CurrentUserPayload, search?: string, includeInactive?: string, lowStockOnly?: string, retailOnly?: string, backbarOnly?: string): Promise<{
        unit: "UN" | "ML" | "KG" | "L" | "G";
        id: number;
        brand: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string | null;
        category: string | null;
        costPrice: string;
        salePrice: string;
        stockRetail: number;
        stockInternal: number;
        minStockRetail: number;
        minStockInternal: number;
        isRetail: boolean;
        isBackbar: boolean;
        hairTypes: string[] | null;
        concerns: string[] | null;
        contraindications: string | null;
        ingredients: string | null;
        howToUse: string | null;
        benefits: string[] | null;
        catalogCode: string | null;
        isSystemDefault: boolean;
        alexisEnabled: boolean;
        alexisMeta: {
            summary?: string;
            indications?: string[];
            actives?: string[];
            benefits?: string[];
            howToUse?: string;
            precautions?: string;
            upsellHooks?: string[];
        } | null;
    }[]>;
    /**
     * GET /products/stats
     * Retorna estatísticas do estoque
     */
    getStats(user: CurrentUserPayload): Promise<{
        totalProducts: number;
        lowStockCount: number;
        totalStockValue: number;
        retailStockValue: number;
        internalStockValue: number;
    }>;
    /**
     * GET /products/low-stock
     * Lista produtos com estoque baixo
     */
    findLowStock(user: CurrentUserPayload): Promise<{
        unit: "UN" | "ML" | "KG" | "L" | "G";
        id: number;
        brand: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string | null;
        category: string | null;
        costPrice: string;
        salePrice: string;
        stockRetail: number;
        stockInternal: number;
        minStockRetail: number;
        minStockInternal: number;
        isRetail: boolean;
        isBackbar: boolean;
        hairTypes: string[] | null;
        concerns: string[] | null;
        contraindications: string | null;
        ingredients: string | null;
        howToUse: string | null;
        benefits: string[] | null;
        catalogCode: string | null;
        isSystemDefault: boolean;
        alexisEnabled: boolean;
        alexisMeta: {
            summary?: string;
            indications?: string[];
            actives?: string[];
            benefits?: string[];
            howToUse?: string;
            precautions?: string;
            upsellHooks?: string[];
        } | null;
    }[]>;
    /**
     * GET /products/:id
     * Busca produto por ID
     */
    findById(id: number, user: CurrentUserPayload): Promise<{
        unit: "UN" | "ML" | "KG" | "L" | "G";
        id: number;
        brand: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string | null;
        category: string | null;
        costPrice: string;
        salePrice: string;
        stockRetail: number;
        stockInternal: number;
        minStockRetail: number;
        minStockInternal: number;
        isRetail: boolean;
        isBackbar: boolean;
        hairTypes: string[] | null;
        concerns: string[] | null;
        contraindications: string | null;
        ingredients: string | null;
        howToUse: string | null;
        benefits: string[] | null;
        catalogCode: string | null;
        isSystemDefault: boolean;
        alexisEnabled: boolean;
        alexisMeta: {
            summary?: string;
            indications?: string[];
            actives?: string[];
            benefits?: string[];
            howToUse?: string;
            precautions?: string;
            upsellHooks?: string[];
        } | null;
    }>;
    /**
     * POST /products
     * Cria um novo produto
     */
    create(user: CurrentUserPayload, data: CreateProductDto): Promise<{
        unit: "UN" | "ML" | "KG" | "L" | "G";
        id: number;
        brand: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string | null;
        category: string | null;
        costPrice: string;
        salePrice: string;
        stockRetail: number;
        stockInternal: number;
        minStockRetail: number;
        minStockInternal: number;
        isRetail: boolean;
        isBackbar: boolean;
        hairTypes: string[] | null;
        concerns: string[] | null;
        contraindications: string | null;
        ingredients: string | null;
        howToUse: string | null;
        benefits: string[] | null;
        catalogCode: string | null;
        isSystemDefault: boolean;
        alexisEnabled: boolean;
        alexisMeta: {
            summary?: string;
            indications?: string[];
            actives?: string[];
            benefits?: string[];
            howToUse?: string;
            precautions?: string;
            upsellHooks?: string[];
        } | null;
    }>;
    /**
     * PATCH /products/:id
     * Atualiza um produto
     */
    update(id: number, user: CurrentUserPayload, data: UpdateProductDto): Promise<{
        unit: "UN" | "ML" | "KG" | "L" | "G";
        id: number;
        brand: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string | null;
        category: string | null;
        costPrice: string;
        salePrice: string;
        stockRetail: number;
        stockInternal: number;
        minStockRetail: number;
        minStockInternal: number;
        isRetail: boolean;
        isBackbar: boolean;
        hairTypes: string[] | null;
        concerns: string[] | null;
        contraindications: string | null;
        ingredients: string | null;
        howToUse: string | null;
        benefits: string[] | null;
        catalogCode: string | null;
        isSystemDefault: boolean;
        alexisEnabled: boolean;
        alexisMeta: {
            summary?: string;
            indications?: string[];
            actives?: string[];
            benefits?: string[];
            howToUse?: string;
            precautions?: string;
            upsellHooks?: string[];
        } | null;
    } | null>;
    /**
     * POST /products/:id/adjust-stock
     * Ajusta o estoque (entrada ou saída manual)
     */
    adjustStock(id: number, user: CurrentUserPayload, data: AdjustStockDto): Promise<{
        product: import("../../database").Product;
        adjustment: import("../../database").StockAdjustment;
    }>;
    /**
     * POST /products/:id/transfer
     * Transfere estoque entre localizações (RETAIL <-> INTERNAL)
     */
    transferStock(id: number, user: CurrentUserPayload, data: TransferStockDto): Promise<{
        product: import("../../database").Product;
        movements: import("../../database").StockMovement[];
    }>;
    /**
     * PATCH /products/:id/reactivate
     * Reativa um produto desativado
     */
    reactivate(id: number, user: CurrentUserPayload): Promise<{
        unit: "UN" | "ML" | "KG" | "L" | "G";
        id: number;
        brand: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string | null;
        category: string | null;
        costPrice: string;
        salePrice: string;
        stockRetail: number;
        stockInternal: number;
        minStockRetail: number;
        minStockInternal: number;
        isRetail: boolean;
        isBackbar: boolean;
        hairTypes: string[] | null;
        concerns: string[] | null;
        contraindications: string | null;
        ingredients: string | null;
        howToUse: string | null;
        benefits: string[] | null;
        catalogCode: string | null;
        isSystemDefault: boolean;
        alexisEnabled: boolean;
        alexisMeta: {
            summary?: string;
            indications?: string[];
            actives?: string[];
            benefits?: string[];
            howToUse?: string;
            precautions?: string;
            upsellHooks?: string[];
        } | null;
    } | null>;
    /**
     * DELETE /products/:id
     * Desativa um produto (soft delete)
     */
    delete(id: number, user: CurrentUserPayload): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=products.controller.d.ts.map
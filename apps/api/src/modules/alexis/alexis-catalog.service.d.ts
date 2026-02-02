/**
 * =====================================================
 * ALEXIS CATALOG SERVICE (ALFA.2)
 * Motor de catálogo para recomendação de produtos
 * - Resolve produtos por nome/alias
 * - Verifica políticas (global + salão)
 * - Formata disponibilidade + copy
 * =====================================================
 */
export interface ProductMatch {
    id: number;
    name: string;
    catalogCode: string | null;
    description: string | null;
    salePrice: string;
    stockRetail: number;
    stockInternal: number;
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
    brand: string | null;
    category: string | null;
}
export interface ResolveResult {
    found: boolean;
    product: ProductMatch | null;
    alternatives: ProductMatch[];
    blocked: boolean;
    blockReason?: string;
}
export interface AvailabilityCopy {
    message: string;
    inStock: boolean;
    canReserve: boolean;
    suggestHandover: boolean;
}
/**
 * Normaliza texto para busca: lowercase, remove acentos, trim
 */
export declare function normalizeText(text: string): string;
/**
 * Verifica se o termo de busca corresponde ao nome do produto
 * Retorna score de confiança (0-1)
 */
export declare function matchScore(searchNorm: string, productNameNorm: string): number;
/**
 * Calcula estoque total (retail + internal)
 * ALFA.3: usa stock_retail + stock_internal do schema real
 */
export declare function calculateTotalStock(product: ProductMatch): number;
/**
 * Formata preço para exibição
 * ALFA.3: sale_price é numeric. Se null/0, retorna "sob consulta"
 */
export declare function formatPrice(salePrice: string | null): string;
/**
 * Formata copy de disponibilidade baseado no estoque
 * ALFA.3: usa totalStock (retail + internal) e trata price=0/null
 */
export declare function formatAvailabilityCopy(product: ProductMatch, canReserve: boolean): AvailabilityCopy;
/**
 * Formata resposta quando há múltiplas correspondências
 */
export declare function formatMultipleMatchesCopy(matches: ProductMatch[]): string;
/**
 * Formata resposta quando produto está bloqueado
 */
export declare function formatBlockedCopy(productName: string, alternatives: ProductMatch[]): string;
export declare class AlexisCatalogService {
    private readonly logger;
    /**
     * Resolve produto por nome ou alias
     * ALFA.3: usa substring matching para aliases (maior alias contido na msg)
     */
    resolveProduct(salonId: string, searchTerm: string): Promise<ResolveResult>;
    /**
     * Busca produto por alias usando substring matching
     * ALFA.3: Encontra o alias mais longo contido na mensagem normalizada
     */
    private findByAliasSubstring;
    /**
     * Busca produtos por nome (fuzzy match)
     * ALFA.3: inclui stockInternal
     */
    private findByName;
    /**
     * Verifica política de recomendação do produto
     * - System default: verifica global_product_policies
     * - Produto do salão: verifica alexisEnabled
     */
    checkPolicy(_salonId: string, // Reserved for future per-salon policy overrides
    product: ProductMatch): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    /**
     * Busca produtos alternativos na mesma categoria
     * ALFA.3: inclui stockInternal, usa total stock > 0
     */
    private findAlternatives;
    /**
     * Handler principal para intent PRODUCT_INFO / PRICE_INFO
     * ALFA.3: usa mensagem completa para substring matching
     */
    handleProductIntent(salonId: string, message: string, canReserve?: boolean): Promise<string>;
    /**
     * Resposta genérica quando não há produto específico mencionado
     * ALFA.3: usa total stock (retail + internal)
     */
    private getGenericProductResponse;
}
//# sourceMappingURL=alexis-catalog.service.d.ts.map
/**
 * =====================================================
 * PRODUCT INFO SERVICE (CHARLIE)
 * Detecção determinística de perguntas sobre produtos
 * e respostas com linguagem de especialista
 * =====================================================
 */
export interface ProductInfo {
    id: number;
    name: string;
    brand: string | null;
    category: string | null;
    description: string | null;
    benefits: string[] | null;
    howToUse: string | null;
    contraindications: string | null;
    ingredients: string | null;
    salePrice: string;
    alexisMeta: {
        summary?: string;
        indications?: string[];
        actives?: string[];
        benefits?: string[];
        howToUse?: string;
        precautions?: string;
        upsellHooks?: string[];
    } | null;
}
/**
 * Normaliza texto: lowercase, remove acentos, pontuação, colapsa espaços
 */
export declare function normalizeText(text: string): string;
/**
 * Extrai tokens relevantes (sem stopwords, >= 3 chars)
 */
export declare function extractTokens(textNorm: string): string[];
/**
 * Gera bigramas de caracteres para comparação fuzzy
 */
export declare function getBigrams(text: string): Set<string>;
/**
 * Calcula Dice coefficient entre dois conjuntos de bigramas
 */
export declare function diceCoefficient(set1: Set<string>, set2: Set<string>): number;
/**
 * Detecta se a mensagem é uma pergunta sobre informação de produto
 */
export declare function isProductInfoQuestion(message: string): boolean;
/**
 * Calcula score de match entre mensagem e nome do produto
 */
export declare function calculateMatchScore(messageNorm: string, productNameNorm: string): number;
/**
 * Formata resposta de especialista usando alexis_meta ou campos tradicionais
 */
export declare function formatExpertResponse(product: ProductInfo): string;
/**
 * Resposta quando não encontra o produto
 */
export declare function formatNotFoundResponse(): string;
export declare class ProductInfoService {
    private readonly logger;
    /**
     * Tenta responder pergunta sobre informação de produto
     * Retorna null se não for pergunta de produto ou não encontrar
     */
    tryAnswerProductInfo(salonId: string, message: string): Promise<string | null>;
    /**
     * Busca produtos ativos e habilitados para Alexis
     */
    private getActiveProducts;
}
//# sourceMappingURL=product-info.service.d.ts.map
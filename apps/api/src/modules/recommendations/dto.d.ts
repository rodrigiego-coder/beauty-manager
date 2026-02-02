/**
 * Condições para regra de recomendação
 */
export declare class RuleConditionsDto {
    hairTypes?: string[];
    hairThickness?: string[];
    hairLength?: string[];
    hairPorosity?: string[];
    scalpTypes?: string[];
    chemicalHistory?: string[];
    mainConcerns?: string[];
    logic?: 'AND' | 'OR';
}
/**
 * Produto recomendado na regra
 */
export declare class RecommendedProductDto {
    productId: number;
    priority: number;
    reason: string;
}
/**
 * DTO para criar regra de recomendação
 */
export declare class CreateRecommendationRuleDto {
    name: string;
    description?: string;
    conditions: RuleConditionsDto;
    recommendedProducts?: RecommendedProductDto[];
    isActive?: boolean;
    priority?: number;
}
/**
 * DTO para atualizar regra de recomendação
 */
export declare class UpdateRecommendationRuleDto {
    name?: string;
    description?: string;
    conditions?: RuleConditionsDto;
    recommendedProducts?: RecommendedProductDto[];
    isActive?: boolean;
    priority?: number;
}
/**
 * DTO para registrar aceitação/rejeição de recomendação
 */
export declare class LogRecommendationDto {
    clientId: string;
    productId: number;
    commandId?: string;
    appointmentId?: string;
    ruleId?: string;
    reason?: string;
}
/**
 * Interface para recomendação de produto
 */
export interface ProductRecommendation {
    productId: number;
    productName: string;
    productDescription: string | null;
    salePrice: string;
    currentStock: number;
    reason: string;
    priority: number;
    matchedCriteria: string[];
    ruleId?: string;
    ruleName?: string;
}
/**
 * Interface para resposta de regra
 */
export interface RuleResponse {
    id: string;
    salonId: string | null;
    name: string;
    description: string | null;
    conditions: RuleConditionsDto;
    recommendedProducts: RecommendedProductDto[];
    isActive: boolean;
    priority: number;
    createdById: string | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Interface para estatísticas de recomendações
 */
export interface RecommendationStats {
    totalRecommendations: number;
    acceptedCount: number;
    rejectedCount: number;
    pendingCount: number;
    acceptanceRate: number;
    topProducts: Array<{
        productId: number;
        productName: string;
        timesRecommended: number;
        timesAccepted: number;
        acceptanceRate: number;
    }>;
    topRules: Array<{
        ruleId: string;
        ruleName: string;
        timesTriggered: number;
        acceptanceRate: number;
    }>;
}
//# sourceMappingURL=dto.d.ts.map
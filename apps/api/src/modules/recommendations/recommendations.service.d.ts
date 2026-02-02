import { CreateRecommendationRuleDto, UpdateRecommendationRuleDto, LogRecommendationDto, ProductRecommendation, RuleResponse, RecommendationStats } from './dto';
/**
 * RecommendationsService
 * Gerencia regras e recomendações de produtos
 */
export declare class RecommendationsService {
    /**
     * Lista todas as regras (do salão + globais)
     */
    listRules(salonId: string): Promise<RuleResponse[]>;
    /**
     * Obtém uma regra por ID
     */
    getRuleById(salonId: string, ruleId: string): Promise<RuleResponse>;
    /**
     * Cria uma nova regra de recomendação
     */
    createRule(salonId: string, dto: CreateRecommendationRuleDto, createdById: string): Promise<RuleResponse>;
    /**
     * Atualiza uma regra existente
     */
    updateRule(salonId: string, ruleId: string, dto: UpdateRecommendationRuleDto): Promise<RuleResponse>;
    /**
     * Remove uma regra
     */
    deleteRule(salonId: string, ruleId: string): Promise<void>;
    /**
     * Obtém recomendações para um cliente baseado no perfil capilar
     */
    getRecommendationsForClient(salonId: string, clientId: string): Promise<ProductRecommendation[]>;
    /**
     * Registra uma recomendação mostrada ao cliente
     */
    logRecommendation(salonId: string, dto: LogRecommendationDto): Promise<void>;
    /**
     * Marca uma recomendação como aceita
     */
    acceptRecommendation(salonId: string, logId: string): Promise<void>;
    /**
     * Marca uma recomendação como rejeitada
     */
    rejectRecommendation(salonId: string, logId: string): Promise<void>;
    /**
     * Obtém estatísticas das recomendações
     */
    getStats(salonId: string, days?: number): Promise<RecommendationStats>;
    private mapRuleToResponse;
}
//# sourceMappingURL=recommendations.service.d.ts.map
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationRuleDto, UpdateRecommendationRuleDto, LogRecommendationDto } from './dto';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        salonId: string;
        role: string;
    };
}
/**
 * RecommendationsController
 * Endpoints para gerenciamento de recomendações de produtos
 */
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    /**
     * GET /recommendations/rules
     * Lista todas as regras de recomendação
     */
    listRules(req: AuthenticatedRequest): Promise<import("./dto").RuleResponse[]>;
    /**
     * GET /recommendations/rules/:ruleId
     * Obtém uma regra específica
     */
    getRule(ruleId: string, req: AuthenticatedRequest): Promise<import("./dto").RuleResponse>;
    /**
     * POST /recommendations/rules
     * Cria uma nova regra de recomendação
     */
    createRule(dto: CreateRecommendationRuleDto, req: AuthenticatedRequest): Promise<import("./dto").RuleResponse>;
    /**
     * PUT /recommendations/rules/:ruleId
     * Atualiza uma regra existente
     */
    updateRule(ruleId: string, dto: UpdateRecommendationRuleDto, req: AuthenticatedRequest): Promise<import("./dto").RuleResponse>;
    /**
     * DELETE /recommendations/rules/:ruleId
     * Remove uma regra
     */
    deleteRule(ruleId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * GET /recommendations/client/:clientId
     * Obtém recomendações para um cliente específico
     */
    getRecommendationsForClient(clientId: string, req: AuthenticatedRequest): Promise<import("./dto").ProductRecommendation[]>;
    /**
     * POST /recommendations/log
     * Registra uma recomendação mostrada
     */
    logRecommendation(dto: LogRecommendationDto, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * POST /recommendations/log/:logId/accept
     * Marca uma recomendação como aceita
     */
    acceptRecommendation(logId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * POST /recommendations/log/:logId/reject
     * Marca uma recomendação como rejeitada
     */
    rejectRecommendation(logId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * GET /recommendations/stats
     * Obtém estatísticas das recomendações
     */
    getStats(days: string, req: AuthenticatedRequest): Promise<import("./dto").RecommendationStats>;
}
export {};
//# sourceMappingURL=recommendations.controller.d.ts.map
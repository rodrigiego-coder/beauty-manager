import { LoyaltyService } from './loyalty.service';
import { CreateProgramDto, UpdateProgramDto, CreateTierDto, UpdateTierDto, CreateRewardDto, UpdateRewardDto, EnrollClientDto, AdjustPointsDto, UseVoucherDto } from './dto';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        salonId: string;
        role: string;
    };
}
/**
 * LoyaltyController
 * Endpoints para gerenciamento do programa de fidelidade
 */
export declare class LoyaltyController {
    private readonly loyaltyService;
    constructor(loyaltyService: LoyaltyService);
    /**
     * GET /loyalty/program
     * Obtém configuração do programa de fidelidade
     */
    getProgram(req: AuthenticatedRequest): Promise<import("./dto").ProgramResponse | null>;
    /**
     * POST /loyalty/program
     * Cria/ativa programa de fidelidade
     */
    createProgram(dto: CreateProgramDto, req: AuthenticatedRequest): Promise<import("./dto").ProgramResponse>;
    /**
     * PATCH /loyalty/program
     * Atualiza configurações do programa
     */
    updateProgram(dto: UpdateProgramDto, req: AuthenticatedRequest): Promise<import("./dto").ProgramResponse>;
    /**
     * GET /loyalty/tiers
     * Lista níveis do programa
     */
    listTiers(req: AuthenticatedRequest): Promise<import("./dto").TierResponse[]>;
    /**
     * POST /loyalty/tiers
     * Cria novo nível
     */
    createTier(dto: CreateTierDto, req: AuthenticatedRequest): Promise<import("./dto").TierResponse>;
    /**
     * PATCH /loyalty/tiers/:id
     * Atualiza nível
     */
    updateTier(id: string, dto: UpdateTierDto, req: AuthenticatedRequest): Promise<import("./dto").TierResponse>;
    /**
     * DELETE /loyalty/tiers/:id
     * Remove nível
     */
    deleteTier(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * GET /loyalty/rewards
     * Lista recompensas
     */
    listRewards(req: AuthenticatedRequest): Promise<import("./dto").RewardResponse[]>;
    /**
     * POST /loyalty/rewards
     * Cria nova recompensa
     */
    createReward(dto: CreateRewardDto, req: AuthenticatedRequest): Promise<import("./dto").RewardResponse>;
    /**
     * PATCH /loyalty/rewards/:id
     * Atualiza recompensa
     */
    updateReward(id: string, dto: UpdateRewardDto, req: AuthenticatedRequest): Promise<import("./dto").RewardResponse>;
    /**
     * DELETE /loyalty/rewards/:id
     * Remove recompensa (soft delete)
     */
    deleteReward(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * GET /loyalty/account/:clientId
     * Obtém conta de fidelidade do cliente
     */
    getAccount(clientId: string, req: AuthenticatedRequest): Promise<import("./dto").AccountResponse | null>;
    /**
     * POST /loyalty/account/:clientId/enroll
     * Inscreve cliente no programa
     */
    enrollClient(clientId: string, dto: EnrollClientDto, req: AuthenticatedRequest): Promise<import("./dto").AccountResponse>;
    /**
     * GET /loyalty/account/:clientId/transactions
     * Lista extrato de pontos do cliente
     */
    getTransactions(clientId: string, limit: string, req: AuthenticatedRequest): Promise<import("./dto").TransactionResponse[]>;
    /**
     * GET /loyalty/account/:clientId/available-rewards
     * Lista recompensas disponíveis para o cliente
     */
    getAvailableRewards(clientId: string, req: AuthenticatedRequest): Promise<import("./dto").RewardResponse[]>;
    /**
     * POST /loyalty/account/:clientId/redeem/:rewardId
     * Resgata recompensa
     */
    redeemReward(clientId: string, rewardId: string, req: AuthenticatedRequest): Promise<import("./dto").RedemptionResponse>;
    /**
     * POST /loyalty/account/:clientId/adjust
     * Ajuste manual de pontos (admin)
     */
    adjustPoints(clientId: string, dto: AdjustPointsDto, req: AuthenticatedRequest): Promise<import("./dto").AccountResponse>;
    /**
     * GET /loyalty/voucher/:code
     * Valida voucher
     */
    validateVoucher(code: string, req: AuthenticatedRequest): Promise<import("./dto").VoucherValidationResponse>;
    /**
     * POST /loyalty/voucher/:code/use
     * Usa voucher na comanda
     */
    useVoucher(code: string, dto: UseVoucherDto, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    /**
     * GET /loyalty/referral/:code
     * Info do código de indicação
     */
    getReferralInfo(code: string, req: AuthenticatedRequest): Promise<{
        clientName: string;
        clientId: string;
    } | null>;
    /**
     * GET /loyalty/stats
     * Estatísticas do programa
     */
    getStats(req: AuthenticatedRequest): Promise<import("./dto").LoyaltyStats>;
    /**
     * GET /loyalty/leaderboard
     * Ranking de clientes
     */
    getLeaderboard(limit: string, req: AuthenticatedRequest): Promise<import("./dto").LeaderboardEntry[]>;
    /**
     * GET /loyalty/options
     * Retorna opções para formulários
     */
    getOptions(): {
        rewardTypes: {
            value: string;
            label: string;
        }[];
        transactionTypes: {
            value: string;
            label: string;
        }[];
    };
    /**
     * GET /loyalty/calculate/:commandId
     * Calcula pontos para uma comanda
     */
    calculatePoints(commandId: string, req: AuthenticatedRequest): Promise<{
        servicePoints: number;
        productPoints: number;
        bonusPoints: number;
        total: number;
        multiplier: number;
    }>;
}
export {};
//# sourceMappingURL=loyalty.controller.d.ts.map
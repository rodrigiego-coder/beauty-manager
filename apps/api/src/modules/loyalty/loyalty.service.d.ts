import { CreateProgramDto, UpdateProgramDto, CreateTierDto, UpdateTierDto, CreateRewardDto, UpdateRewardDto, AdjustPointsDto, ProgramResponse, TierResponse, RewardResponse, AccountResponse, TransactionResponse, RedemptionResponse, VoucherValidationResponse, LoyaltyStats, LeaderboardEntry } from './dto';
export declare class LoyaltyService {
    getProgram(salonId: string): Promise<ProgramResponse | null>;
    createProgram(salonId: string, dto: CreateProgramDto): Promise<ProgramResponse>;
    updateProgram(salonId: string, dto: UpdateProgramDto): Promise<ProgramResponse>;
    private createDefaultTiers;
    listTiers(salonId: string): Promise<TierResponse[]>;
    createTier(salonId: string, dto: CreateTierDto): Promise<TierResponse>;
    updateTier(salonId: string, tierId: string, dto: UpdateTierDto): Promise<TierResponse>;
    deleteTier(salonId: string, tierId: string): Promise<void>;
    listRewards(salonId: string): Promise<RewardResponse[]>;
    createReward(salonId: string, dto: CreateRewardDto): Promise<RewardResponse>;
    updateReward(salonId: string, rewardId: string, dto: UpdateRewardDto): Promise<RewardResponse>;
    deleteReward(salonId: string, rewardId: string): Promise<void>;
    getAccount(salonId: string, clientId: string): Promise<AccountResponse | null>;
    enrollClient(salonId: string, clientId: string, referralCode?: string, userId?: string): Promise<AccountResponse>;
    getTransactions(salonId: string, clientId: string, limit?: number): Promise<TransactionResponse[]>;
    getAvailableRewards(salonId: string, clientId: string): Promise<RewardResponse[]>;
    redeemReward(salonId: string, clientId: string, rewardId: string, userId?: string): Promise<RedemptionResponse>;
    adjustPoints(salonId: string, clientId: string, dto: AdjustPointsDto, userId: string): Promise<AccountResponse>;
    validateVoucher(salonId: string, code: string): Promise<VoucherValidationResponse>;
    useVoucher(salonId: string, code: string, commandId: string): Promise<void>;
    addPoints(accountId: string, salonId: string, points: number, type: string, description: string, userId?: string, expireDays?: number | null, rewardId?: string, commandId?: string, appointmentId?: string): Promise<TransactionResponse>;
    calculatePointsForCommand(salonId: string, commandId: string): Promise<{
        servicePoints: number;
        productPoints: number;
        bonusPoints: number;
        total: number;
        multiplier: number;
    }>;
    /**
     * Processa pontos de fidelidade ao fechar uma comanda
     * Retorna o total de pontos ganhos ou 0 se não aplicável
     */
    processCommandPoints(salonId: string, commandId: string, clientId: string, userId?: string): Promise<{
        pointsEarned: number;
        newTotal: number;
        tierUpgraded: boolean;
        newTierName?: string;
    }>;
    checkTierUpgrade(accountId: string, salonId: string, totalPoints: number): Promise<void>;
    getStats(salonId: string): Promise<LoyaltyStats>;
    getLeaderboard(salonId: string, limit?: number): Promise<LeaderboardEntry[]>;
    private generateReferralCode;
    private generateVoucherCode;
    private logMarketingEvent;
    getReferralInfo(salonId: string, code: string): Promise<{
        clientName: string;
        clientId: string;
    } | null>;
    processExpiredPoints(salonId: string): Promise<number>;
    processBirthdayPoints(salonId: string): Promise<number>;
}
//# sourceMappingURL=loyalty.service.d.ts.map
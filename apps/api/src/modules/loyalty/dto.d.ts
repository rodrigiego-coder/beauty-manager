export declare class CreateProgramDto {
    name?: string;
    pointsPerRealService?: number;
    pointsPerRealProduct?: number;
    pointsExpireDays?: number;
    minimumRedeemPoints?: number;
    welcomePoints?: number;
    birthdayPoints?: number;
    referralPoints?: number;
}
export declare class UpdateProgramDto extends CreateProgramDto {
    isActive?: boolean;
}
export declare class TierBenefitsDto {
    discountPercent?: number;
    priorityBooking?: boolean;
    freeServices?: string[];
    extraBenefits?: string;
}
export declare class CreateTierDto {
    name: string;
    code: string;
    minPoints: number;
    color?: string;
    icon?: string;
    benefits?: TierBenefitsDto;
    pointsMultiplier?: number;
    sortOrder?: number;
}
export declare class UpdateTierDto {
    name?: string;
    minPoints?: number;
    color?: string;
    icon?: string;
    benefits?: TierBenefitsDto;
    pointsMultiplier?: number;
    sortOrder?: number;
}
export declare const RewardTypes: readonly ["DISCOUNT_VALUE", "DISCOUNT_PERCENT", "FREE_SERVICE", "FREE_PRODUCT", "GIFT"];
export type RewardType = typeof RewardTypes[number];
export declare class CreateRewardDto {
    name: string;
    description?: string;
    type: RewardType;
    pointsCost: number;
    value?: number;
    productId?: number;
    serviceId?: number;
    minTier?: string;
    maxRedemptionsPerClient?: number;
    totalAvailable?: number;
    validDays?: number;
    imageUrl?: string;
}
export declare class UpdateRewardDto extends CreateRewardDto {
    isActive?: boolean;
}
export declare class EnrollClientDto {
    referralCode?: string;
}
export declare class AdjustPointsDto {
    points: number;
    description: string;
}
export declare const TransactionTypes: readonly ["EARN", "REDEEM", "EXPIRE", "ADJUST", "BONUS", "REFERRAL", "BIRTHDAY", "WELCOME"];
export type TransactionType = typeof TransactionTypes[number];
export declare class UseVoucherDto {
    commandId: string;
}
export declare class ApplyReferralDto {
    newClientId: string;
    referralCode: string;
}
export interface ProgramResponse {
    id: string;
    salonId: string;
    name: string;
    isActive: boolean;
    pointsPerRealService: string;
    pointsPerRealProduct: string;
    pointsExpireDays: number | null;
    minimumRedeemPoints: number;
    welcomePoints: number;
    birthdayPoints: number;
    referralPoints: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface TierResponse {
    id: string;
    programId: string;
    name: string;
    code: string;
    minPoints: number;
    color: string;
    icon: string | null;
    benefits: TierBenefitsDto | null;
    pointsMultiplier: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface RewardResponse {
    id: string;
    salonId: string;
    programId: string;
    name: string;
    description: string | null;
    type: string;
    pointsCost: number;
    value: string | null;
    productId: number | null;
    serviceId: number | null;
    minTier: string | null;
    maxRedemptionsPerClient: number | null;
    totalAvailable: number | null;
    validDays: number;
    isActive: boolean;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    productName?: string;
    serviceName?: string;
}
export interface AccountResponse {
    id: string;
    salonId: string;
    clientId: string;
    programId: string;
    currentPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    currentTierId: string | null;
    tierAchievedAt: Date | null;
    nextTierProgress: number;
    referralCode: string;
    referredById: string | null;
    createdAt: Date;
    updatedAt: Date;
    clientName?: string;
    currentTier?: TierResponse;
    nextTier?: TierResponse | null;
}
export interface TransactionResponse {
    id: string;
    accountId: string;
    salonId: string;
    type: string;
    points: number;
    balance: number;
    description: string;
    commandId: string | null;
    appointmentId: string | null;
    rewardId: string | null;
    expiresAt: Date | null;
    createdById: string | null;
    createdAt: Date;
}
export interface RedemptionResponse {
    id: string;
    accountId: string;
    rewardId: string;
    transactionId: string;
    pointsSpent: number;
    status: string;
    code: string;
    usedAt: Date | null;
    usedInCommandId: string | null;
    expiresAt: Date;
    createdAt: Date;
    rewardName?: string;
    rewardType?: string;
    rewardValue?: string | null;
}
export interface VoucherValidationResponse {
    valid: boolean;
    voucher?: RedemptionResponse & {
        reward: RewardResponse;
    };
    error?: string;
}
export interface LoyaltyStats {
    totalEnrolledClients: number;
    pointsInCirculation: number;
    pointsEarnedThisMonth: number;
    pointsRedeemedThisMonth: number;
    redemptionsThisMonth: number;
    revenueInfluenced: number;
    tierDistribution: Array<{
        tierId: string;
        tierName: string;
        tierColor: string;
        count: number;
    }>;
    topRewards: Array<{
        rewardId: string;
        rewardName: string;
        redemptionCount: number;
    }>;
}
export interface LeaderboardEntry {
    clientId: string;
    clientName: string;
    currentPoints: number;
    totalPointsEarned: number;
    tierId: string | null;
    tierName: string | null;
    tierColor: string | null;
    rank: number;
}
export declare const RewardTypeLabels: Record<RewardType, string>;
export declare const TransactionTypeLabels: Record<TransactionType, string>;
//# sourceMappingURL=dto.d.ts.map
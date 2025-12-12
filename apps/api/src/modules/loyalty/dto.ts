import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== Program DTOs ====================

export class CreateProgramDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsPerRealService?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsPerRealProduct?: number;

  @IsOptional()
  @IsNumber()
  pointsExpireDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumRedeemPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  welcomePoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  birthdayPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  referralPoints?: number;
}

export class UpdateProgramDto extends CreateProgramDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== Tier DTOs ====================

export class TierBenefitsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  priorityBooking?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  freeServices?: string[];

  @IsOptional()
  @IsString()
  extraBenefits?: string;
}

export class CreateTierDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsNumber()
  @Min(0)
  minPoints!: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TierBenefitsDto)
  benefits?: TierBenefitsDto;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  pointsMultiplier?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateTierDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPoints?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TierBenefitsDto)
  benefits?: TierBenefitsDto;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  pointsMultiplier?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// ==================== Reward DTOs ====================

export const RewardTypes = ['DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT'] as const;
export type RewardType = typeof RewardTypes[number];

export class CreateRewardDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type!: RewardType;

  @IsNumber()
  @Min(1)
  pointsCost!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @IsOptional()
  @IsString()
  minTier?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptionsPerClient?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAvailable?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  validDays?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateRewardDto extends CreateRewardDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== Account DTOs ====================

export class EnrollClientDto {
  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class AdjustPointsDto {
  @IsNumber()
  points!: number;

  @IsString()
  description!: string;
}

// ==================== Transaction DTOs ====================

export const TransactionTypes = ['EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'BONUS', 'REFERRAL', 'BIRTHDAY', 'WELCOME'] as const;
export type TransactionType = typeof TransactionTypes[number];

// ==================== Voucher DTOs ====================

export class UseVoucherDto {
  @IsUUID()
  commandId!: string;
}

// ==================== Referral DTOs ====================

export class ApplyReferralDto {
  @IsUUID()
  newClientId!: string;

  @IsString()
  referralCode!: string;
}

// ==================== Response Interfaces ====================

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
  // Joined data
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
  // Joined data
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
  // Joined data
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

// ==================== Labels ====================

export const RewardTypeLabels: Record<RewardType, string> = {
  DISCOUNT_VALUE: 'Desconto em Valor (R$)',
  DISCOUNT_PERCENT: 'Desconto em Porcentagem (%)',
  FREE_SERVICE: 'Serviço Grátis',
  FREE_PRODUCT: 'Produto Grátis',
  GIFT: 'Brinde',
};

export const TransactionTypeLabels: Record<TransactionType, string> = {
  EARN: 'Pontos Ganhos',
  REDEEM: 'Pontos Resgatados',
  EXPIRE: 'Pontos Expirados',
  ADJUST: 'Ajuste Manual',
  BONUS: 'Bônus',
  REFERRAL: 'Indicação',
  BIRTHDAY: 'Aniversário',
  WELCOME: 'Boas-vindas',
};

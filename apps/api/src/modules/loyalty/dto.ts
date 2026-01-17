import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== Program DTOs ====================

export class CreateProgramDto {
  @ApiPropertyOptional({ description: 'Nome do programa de fidelidade', example: 'Programa Fidelidade Beleza' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Pontos ganhos por real gasto em serviços', example: 1, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsPerRealService?: number;

  @ApiPropertyOptional({ description: 'Pontos ganhos por real gasto em produtos', example: 0.5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsPerRealProduct?: number;

  @ApiPropertyOptional({ description: 'Dias para expiração dos pontos (null = não expira)', example: 365 })
  @IsOptional()
  @IsNumber()
  pointsExpireDays?: number;

  @ApiPropertyOptional({ description: 'Mínimo de pontos para resgate', example: 100, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumRedeemPoints?: number;

  @ApiPropertyOptional({ description: 'Pontos de boas-vindas ao se cadastrar', example: 50, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  welcomePoints?: number;

  @ApiPropertyOptional({ description: 'Pontos de aniversário', example: 100, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  birthdayPoints?: number;

  @ApiPropertyOptional({ description: 'Pontos por indicação de novo cliente', example: 200, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  referralPoints?: number;
}

export class UpdateProgramDto extends CreateProgramDto {
  @ApiPropertyOptional({ description: 'Programa ativo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== Tier DTOs ====================

export class TierBenefitsDto {
  @ApiPropertyOptional({ description: 'Percentual de desconto do tier', example: 10, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Prioridade no agendamento', example: true })
  @IsOptional()
  @IsBoolean()
  priorityBooking?: boolean;

  @ApiPropertyOptional({ description: 'Lista de serviços gratuitos', example: ['corte', 'escova'], isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  freeServices?: string[];

  @ApiPropertyOptional({ description: 'Benefícios extras em texto', example: 'Acesso VIP, estacionamento gratuito' })
  @IsOptional()
  @IsString()
  extraBenefits?: string;
}

export class CreateTierDto {
  @ApiProperty({ description: 'Nome do tier', example: 'Ouro' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Código único do tier', example: 'GOLD' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Pontos mínimos para atingir o tier', example: 1000, minimum: 0 })
  @IsNumber()
  @Min(0)
  minPoints!: number;

  @ApiPropertyOptional({ description: 'Cor do tier em hexadecimal', example: '#FFD700' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Ícone do tier', example: 'crown' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Benefícios do tier', type: TierBenefitsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TierBenefitsDto)
  benefits?: TierBenefitsDto;

  @ApiPropertyOptional({ description: 'Multiplicador de pontos', example: 1.5, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  pointsMultiplier?: number;

  @ApiPropertyOptional({ description: 'Ordem de exibição', example: 2 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateTierDto {
  @ApiPropertyOptional({ description: 'Nome do tier', example: 'Ouro' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Pontos mínimos para atingir o tier', example: 1000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({ description: 'Cor do tier em hexadecimal', example: '#FFD700' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Ícone do tier', example: 'crown' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Benefícios do tier', type: TierBenefitsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TierBenefitsDto)
  benefits?: TierBenefitsDto;

  @ApiPropertyOptional({ description: 'Multiplicador de pontos', example: 1.5, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  pointsMultiplier?: number;

  @ApiPropertyOptional({ description: 'Ordem de exibição', example: 2 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// ==================== Reward DTOs ====================

export const RewardTypes = ['DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT'] as const;
export type RewardType = typeof RewardTypes[number];

export class CreateRewardDto {
  @ApiProperty({ description: 'Nome da recompensa', example: 'Desconto de R$50' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Descrição da recompensa', example: 'Desconto de R$50 em qualquer serviço' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tipo da recompensa', enum: ['DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT'], example: 'DISCOUNT_VALUE' })
  @IsString()
  type!: RewardType;

  @ApiProperty({ description: 'Custo em pontos', example: 500, minimum: 1 })
  @IsNumber()
  @Min(1)
  pointsCost!: number;

  @ApiPropertyOptional({ description: 'Valor do desconto (R$ ou %)', example: 50, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'ID do produto (para FREE_PRODUCT)', example: 123 })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'ID do serviço (para FREE_SERVICE)', example: 456 })
  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @ApiPropertyOptional({ description: 'Tier mínimo para resgatar', example: 'GOLD' })
  @IsOptional()
  @IsString()
  minTier?: string;

  @ApiPropertyOptional({ description: 'Máximo de resgates por cliente', example: 3, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptionsPerClient?: number;

  @ApiPropertyOptional({ description: 'Total disponível para resgate', example: 100, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAvailable?: number;

  @ApiPropertyOptional({ description: 'Dias de validade após resgate', example: 30, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validDays?: number;

  @ApiPropertyOptional({ description: 'URL da imagem da recompensa', example: 'https://example.com/reward.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateRewardDto extends CreateRewardDto {
  @ApiPropertyOptional({ description: 'Recompensa ativa', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== Account DTOs ====================

export class EnrollClientDto {
  @ApiPropertyOptional({ description: 'Código de indicação', example: 'ABC123' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class AdjustPointsDto {
  @ApiProperty({ description: 'Quantidade de pontos (positivo para adicionar, negativo para remover)', example: 100 })
  @IsNumber()
  points!: number;

  @ApiProperty({ description: 'Motivo do ajuste', example: 'Compensação por problema no serviço' })
  @IsString()
  description!: string;
}

// ==================== Transaction DTOs ====================

export const TransactionTypes = ['EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'BONUS', 'REFERRAL', 'BIRTHDAY', 'WELCOME'] as const;
export type TransactionType = typeof TransactionTypes[number];

// ==================== Voucher DTOs ====================

export class UseVoucherDto {
  @ApiProperty({ description: 'ID da comanda onde usar o voucher', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  commandId!: string;
}

// ==================== Referral DTOs ====================

export class ApplyReferralDto {
  @ApiProperty({ description: 'ID do novo cliente indicado', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  newClientId!: string;

  @ApiProperty({ description: 'Código de indicação do cliente que indicou', example: 'ABC123' })
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

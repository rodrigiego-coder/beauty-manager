import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, IsDateString } from 'class-validator';

// ==================== RULE DTOs ====================

export class CreateUpsellRuleDto {
  @IsString()
  name!: string;

  @IsEnum(['SERVICE', 'PRODUCT', 'HAIR_PROFILE', 'APPOINTMENT'])
  triggerType!: string;

  @IsOptional()
  @IsArray()
  triggerServiceIds?: number[];

  @IsOptional()
  @IsArray()
  triggerProductIds?: number[];

  @IsOptional()
  @IsArray()
  triggerHairTypes?: string[];

  @IsOptional()
  @IsArray()
  recommendedProducts?: { productId: number; discount: number; reason: string }[];

  @IsOptional()
  @IsArray()
  recommendedServices?: { serviceId: number; discount: number; reason: string }[];

  @IsOptional()
  @IsString()
  displayMessage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsNumber()
  maxUsesTotal?: number;

  @IsOptional()
  @IsNumber()
  maxUsesPerClient?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateUpsellRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['SERVICE', 'PRODUCT', 'HAIR_PROFILE', 'APPOINTMENT'])
  triggerType?: string;

  @IsOptional()
  @IsArray()
  triggerServiceIds?: number[];

  @IsOptional()
  @IsArray()
  triggerProductIds?: number[];

  @IsOptional()
  @IsArray()
  triggerHairTypes?: string[];

  @IsOptional()
  @IsArray()
  recommendedProducts?: { productId: number; discount: number; reason: string }[];

  @IsOptional()
  @IsArray()
  recommendedServices?: { serviceId: number; discount: number; reason: string }[];

  @IsOptional()
  @IsString()
  displayMessage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsNumber()
  maxUsesTotal?: number;

  @IsOptional()
  @IsNumber()
  maxUsesPerClient?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== OFFER DTOs ====================

export class AcceptOfferDto {
  @IsOptional()
  @IsString()
  commandId?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface UpsellRuleResponse {
  id: string;
  salonId: string;
  name: string;
  triggerType: string;
  triggerServiceIds: number[];
  triggerProductIds: number[];
  triggerHairTypes: string[];
  recommendedProducts: { productId: number; discount: number; reason: string }[];
  recommendedServices: { serviceId: number; discount: number; reason: string }[];
  displayMessage: string | null;
  discountPercent: string | null;
  validFrom: string | null;
  validUntil: string | null;
  maxUsesTotal: number | null;
  maxUsesPerClient: number | null;
  currentUses: number | null;
  isActive: boolean | null;
  priority: number | null;
  conversionRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsellOfferResponse {
  id: string;
  salonId: string;
  ruleId: string;
  clientId: string | null;
  appointmentId: string | null;
  commandId: string | null;
  status: string;
  offeredProducts: { productId: number; name: string; originalPrice: number; discountedPrice: number }[];
  offeredServices: { serviceId: number; name: string; originalPrice: number; discountedPrice: number }[];
  totalOriginalPrice: string;
  totalDiscountedPrice: string;
  savings: number;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  expiresAt: Date | null;
  rule?: UpsellRuleResponse;
  createdAt: Date;
}

export interface UpsellStatsResponse {
  totalRules: number;
  activeRules: number;
  totalOffers: number;
  acceptedOffers: number;
  declinedOffers: number;
  conversionRate: number;
  totalRevenue: number;
  averageDiscount: number;
}

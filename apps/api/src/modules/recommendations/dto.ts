import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Condições para regra de recomendação
 */
export class RuleConditionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hairTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hairThickness?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hairLength?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hairPorosity?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scalpTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chemicalHistory?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mainConcerns?: string[];

  @IsOptional()
  @IsString()
  logic?: 'AND' | 'OR';
}

/**
 * Produto recomendado na regra
 */
export class RecommendedProductDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  priority!: number;

  @IsString()
  reason!: string;
}

/**
 * DTO para criar regra de recomendação
 */
export class CreateRecommendationRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => RuleConditionsDto)
  conditions!: RuleConditionsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedProductDto)
  recommendedProducts?: RecommendedProductDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

/**
 * DTO para atualizar regra de recomendação
 */
export class UpdateRecommendationRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RuleConditionsDto)
  conditions?: RuleConditionsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedProductDto)
  recommendedProducts?: RecommendedProductDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

/**
 * DTO para registrar aceitação/rejeição de recomendação
 */
export class LogRecommendationDto {
  @IsUUID()
  clientId!: string;

  @IsNumber()
  productId!: number;

  @IsOptional()
  @IsUUID()
  commandId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  ruleId?: string;

  @IsOptional()
  @IsString()
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

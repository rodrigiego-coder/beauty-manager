import { IsString, IsNumber, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== AB TEST DTOs ====================

export class VariantConfigDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  timing?: string;

  @IsOptional()
  offer?: any;
}

export class CreateABTestDto {
  @IsString()
  name!: string;

  @IsEnum(['MESSAGE', 'OFFER', 'DISCOUNT', 'TIMING'])
  type!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantConfigDto)
  variantA?: VariantConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantConfigDto)
  variantB?: VariantConfigDto;
}

export class UpdateABTestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantConfigDto)
  variantA?: VariantConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantConfigDto)
  variantB?: VariantConfigDto;
}

export class RecordConversionDto {
  @IsString()
  testId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface VariantConfig {
  message?: string;
  discount?: number;
  timing?: string;
  offer?: any;
}

export interface ABTestResponse {
  id: string;
  salonId: string;
  name: string;
  type: string;
  status: string;
  variantA: VariantConfig;
  variantB: VariantConfig;
  variantAViews: number;
  variantAConversions: number;
  variantBViews: number;
  variantBConversions: number;
  variantAConversionRate: number;
  variantBConversionRate: number;
  winningVariant: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestAssignmentResponse {
  id: string;
  testId: string;
  clientId: string | null;
  clientPhone: string | null;
  variant: string;
  converted: boolean;
  convertedAt: Date | null;
  createdAt: Date;
}

export interface ABTestStatsResponse {
  totalTests: number;
  runningTests: number;
  completedTests: number;
  pausedTests: number;
  draftTests: number;
  totalViews: number;
  totalConversions: number;
  overallConversionRate: number;
}

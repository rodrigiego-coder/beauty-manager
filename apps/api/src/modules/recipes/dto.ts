import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para linha da receita
export class RecipeLineDto {
  @IsNumber()
  productId!: number;

  @IsOptional()
  @IsUUID()
  productGroupId?: string;

  @IsNumber()
  @Min(0.001)
  quantityStandard!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityBuffer?: number;

  @IsString()
  unit!: string; // 'ML', 'G', 'UN', etc.

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// DTO para variação
export class RecipeVariantDto {
  @IsString()
  code!: string; // 'DEFAULT', 'SHORT', 'MEDIUM', 'LONG', etc.

  @IsString()
  name!: string; // 'Cabelo Curto', 'Cabelo Médio', etc.

  @IsNumber()
  @Min(0.1)
  multiplier!: number; // 0.6, 1.0, 1.5, etc.

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// DTO para criar/atualizar receita completa
export class SaveRecipeDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetMarginPercent?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeLineDto)
  lines!: RecipeLineDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeVariantDto)
  variants?: RecipeVariantDto[];
}

// Response types
export interface RecipeLineResponse {
  id: string;
  productId: number;
  productName: string;
  productUnit: string;
  productCost: number;
  productGroupId?: string;
  quantityStandard: number;
  quantityBuffer: number;
  unit: string;
  isRequired: boolean;
  notes?: string;
  sortOrder: number;
  lineCost: number; // quantityStandard * productCost
}

export interface RecipeVariantResponse {
  id: string;
  code: string;
  name: string;
  multiplier: number;
  isDefault: boolean;
  sortOrder: number;
  estimatedCost: number; // custo base * multiplier
}

export interface RecipeResponse {
  id: string;
  serviceId: number;
  serviceName: string;
  version: number;
  status: string;
  effectiveFrom: string;
  notes?: string;
  estimatedCost: number;
  targetMarginPercent: number;
  lines: RecipeLineResponse[];
  variants: RecipeVariantResponse[];
  createdAt: string;
  updatedAt: string;
}

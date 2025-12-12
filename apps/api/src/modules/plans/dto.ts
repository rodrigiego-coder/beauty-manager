import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, MaxLength } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MaxLength(20)
  code!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  priceMonthly!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @IsNumber()
  @Min(1)
  maxUsers!: number;

  @IsNumber()
  @Min(0)
  maxClients!: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxSalons?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  hasFiscal?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAutomation?: boolean;

  @IsBoolean()
  @IsOptional()
  hasReports?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAI?: boolean;

  @IsNumber()
  @IsOptional()
  trialDays?: number;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePlanDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxClients?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxSalons?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  hasFiscal?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAutomation?: boolean;

  @IsBoolean()
  @IsOptional()
  hasReports?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAI?: boolean;

  @IsNumber()
  @IsOptional()
  trialDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

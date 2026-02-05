import { IsString, IsNumber, IsOptional, IsEnum, Min, MinLength, Max } from 'class-validator';

export enum ServiceCategory {
  HAIR = 'HAIR',
  BARBER = 'BARBER',
  NAILS = 'NAILS',
  SKIN = 'SKIN',
  MAKEUP = 'MAKEUP',
  OTHER = 'OTHER',
}

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @IsNumber()
  @Min(0.01)
  basePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalSessions?: number;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  totalSessions?: number;
}

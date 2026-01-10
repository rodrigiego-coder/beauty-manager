import { IsString, IsUUID, IsOptional, IsArray, IsDateString } from 'class-validator';

export class PayCommissionsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  commissionIds!: string[];
}

export class PayProfessionalCommissionsDto {
  @IsUUID()
  professionalId!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ListCommissionsQueryDto {
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'PAID' | 'CANCELLED';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

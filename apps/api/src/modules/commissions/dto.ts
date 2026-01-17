import { IsString, IsUUID, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayCommissionsDto {
  @ApiProperty({ description: 'Lista de IDs das comissões a pagar', example: ['550e8400-e29b-41d4-a716-446655440000'], isArray: true, type: String })
  @IsArray()
  @IsUUID('all', { each: true })
  commissionIds!: string[];
}

export class PayProfessionalCommissionsDto {
  @ApiProperty({ description: 'ID do profissional', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  professionalId!: string;

  @ApiPropertyOptional({ description: 'Data inicial do período (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final do período (ISO 8601)', example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ListCommissionsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por profissional', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: ['PENDING', 'PAID', 'CANCELLED'], example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'PAID' | 'CANCELLED';

  @ApiPropertyOptional({ description: 'Data inicial do período (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final do período (ISO 8601)', example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

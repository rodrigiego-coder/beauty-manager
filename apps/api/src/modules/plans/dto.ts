import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ description: 'Código único do plano', example: 'PRO', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiProperty({ description: 'Nome do plano', example: 'Plano Profissional', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Descrição do plano', example: 'Plano ideal para salões de médio porte' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Preço mensal em reais', example: 99.90, minimum: 0 })
  @IsNumber()
  @Min(0)
  priceMonthly!: number;

  @ApiPropertyOptional({ description: 'Preço anual em reais (desconto)', example: 999.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @ApiProperty({ description: 'Máximo de usuários permitidos', example: 5, minimum: 1 })
  @IsNumber()
  @Min(1)
  maxUsers!: number;

  @ApiProperty({ description: 'Máximo de clientes permitidos (0 = ilimitado)', example: 500, minimum: 0 })
  @IsNumber()
  @Min(0)
  maxClients!: number;

  @ApiPropertyOptional({ description: 'Máximo de salões permitidos', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxSalons?: number;

  @ApiPropertyOptional({ description: 'Lista de features inclusas', example: ['agendamento', 'clientes', 'financeiro'], isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: 'Possui módulo fiscal', example: true })
  @IsBoolean()
  @IsOptional()
  hasFiscal?: boolean;

  @ApiPropertyOptional({ description: 'Possui automação (WhatsApp)', example: true })
  @IsBoolean()
  @IsOptional()
  hasAutomation?: boolean;

  @ApiPropertyOptional({ description: 'Possui relatórios avançados', example: true })
  @IsBoolean()
  @IsOptional()
  hasReports?: boolean;

  @ApiPropertyOptional({ description: 'Possui inteligência artificial', example: false })
  @IsBoolean()
  @IsOptional()
  hasAI?: boolean;

  @ApiPropertyOptional({ description: 'Dias de trial', example: 14 })
  @IsNumber()
  @IsOptional()
  trialDays?: number;

  @ApiPropertyOptional({ description: 'Ordem de exibição', example: 2 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Nome do plano', example: 'Plano Profissional', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do plano', example: 'Plano ideal para salões de médio porte' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Preço mensal em reais', example: 99.90, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

  @ApiPropertyOptional({ description: 'Preço anual em reais (desconto)', example: 999.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @ApiPropertyOptional({ description: 'Máximo de usuários permitidos', example: 5, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Máximo de clientes permitidos (0 = ilimitado)', example: 500, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxClients?: number;

  @ApiPropertyOptional({ description: 'Máximo de salões permitidos', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxSalons?: number;

  @ApiPropertyOptional({ description: 'Lista de features inclusas', example: ['agendamento', 'clientes', 'financeiro'], isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: 'Possui módulo fiscal', example: true })
  @IsBoolean()
  @IsOptional()
  hasFiscal?: boolean;

  @ApiPropertyOptional({ description: 'Possui automação (WhatsApp)', example: true })
  @IsBoolean()
  @IsOptional()
  hasAutomation?: boolean;

  @ApiPropertyOptional({ description: 'Possui relatórios avançados', example: true })
  @IsBoolean()
  @IsOptional()
  hasReports?: boolean;

  @ApiPropertyOptional({ description: 'Possui inteligência artificial', example: false })
  @IsBoolean()
  @IsOptional()
  hasAI?: boolean;

  @ApiPropertyOptional({ description: 'Dias de trial', example: 14 })
  @IsNumber()
  @IsOptional()
  trialDays?: number;

  @ApiPropertyOptional({ description: 'Plano ativo', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Ordem de exibição', example: 2 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

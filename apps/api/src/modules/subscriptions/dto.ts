import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartTrialDto {
  @ApiProperty({ description: 'ID do plano para iniciar trial (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  planId!: string;

  @ApiPropertyOptional({ description: 'Duração do período de trial em dias', example: 14 })
  @IsNumber()
  @IsOptional()
  trialDays?: number;
}

export class ChangePlanDto {
  @ApiProperty({ description: 'ID do novo plano (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  newPlanId!: string;

  @ApiPropertyOptional({ description: 'Período de cobrança', enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' })
  @IsEnum(['MONTHLY', 'YEARLY'])
  @IsOptional()
  billingPeriod?: 'MONTHLY' | 'YEARLY';
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ description: 'Cancelar ao fim do período atual', example: true })
  @IsBoolean()
  @IsOptional()
  cancelAtPeriodEnd?: boolean;

  @ApiPropertyOptional({ description: 'Motivo do cancelamento', example: 'Não estou usando o sistema' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ReactivateSubscriptionDto {
  @ApiPropertyOptional({ description: 'ID do plano para reativar (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  planId?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'ID da assinatura (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  subscriptionId!: string;

  @ApiProperty({ description: 'Valor da fatura em reais', example: 99.90 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Data de vencimento (ISO 8601)', example: '2024-02-15T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  dueDate!: Date;
}

export class PayInvoiceDto {
  @ApiProperty({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'BOLETO'], example: 'PIX' })
  @IsEnum(['PIX', 'CARD', 'BOLETO'])
  method!: 'PIX' | 'CARD' | 'BOLETO';

  @ApiPropertyOptional({ description: 'Token do cartão (quando pagamento por cartão)', example: 'tok_xxxxxxxxxxxx' })
  @IsString()
  @IsOptional()
  cardToken?: string;
}

export class InvoiceFiltersDto {
  @ApiPropertyOptional({ description: 'Status da fatura', enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED'], example: 'PENDING' })
  @IsEnum(['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Data inicial do filtro (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Data final do filtro (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;
}

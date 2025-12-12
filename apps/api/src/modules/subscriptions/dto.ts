import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class StartTrialDto {
  @IsUUID()
  planId!: string;

  @IsNumber()
  @IsOptional()
  trialDays?: number;
}

export class ChangePlanDto {
  @IsUUID()
  newPlanId!: string;

  @IsEnum(['MONTHLY', 'YEARLY'])
  @IsOptional()
  billingPeriod?: 'MONTHLY' | 'YEARLY';
}

export class CancelSubscriptionDto {
  @IsBoolean()
  @IsOptional()
  cancelAtPeriodEnd?: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ReactivateSubscriptionDto {
  @IsUUID()
  @IsOptional()
  planId?: string;
}

export class CreateInvoiceDto {
  @IsUUID()
  subscriptionId!: string;

  @IsNumber()
  amount!: number;

  @Type(() => Date)
  @IsDate()
  dueDate!: Date;
}

export class PayInvoiceDto {
  @IsEnum(['PIX', 'CARD', 'BOLETO'])
  method!: 'PIX' | 'CARD' | 'BOLETO';

  @IsString()
  @IsOptional()
  cardToken?: string;
}

export class InvoiceFiltersDto {
  @IsEnum(['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED'])
  @IsOptional()
  status?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;
}

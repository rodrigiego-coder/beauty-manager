import { IsString, IsNumber, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreatePreferenceDto {
  @IsUUID()
  invoiceId!: string;

  @IsString()
  @IsOptional()
  successUrl?: string;

  @IsString()
  @IsOptional()
  failureUrl?: string;

  @IsString()
  @IsOptional()
  pendingUrl?: string;
}

export class CreatePixDto {
  @IsUUID()
  invoiceId!: string;

  @IsNumber()
  @IsOptional()
  expirationMinutes?: number;
}

export class WebhookDto {
  @IsString()
  type!: string;

  @IsString()
  action!: string;

  @IsObject()
  data!: {
    id: string;
  };
}

export class CardPaymentDto {
  @IsUUID()
  invoiceId!: string;

  @IsString()
  token!: string;

  @IsString()
  paymentMethodId!: string;

  @IsNumber()
  installments!: number;

  @IsString()
  @IsOptional()
  email?: string;
}

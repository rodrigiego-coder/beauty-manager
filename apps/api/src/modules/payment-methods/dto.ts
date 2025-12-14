import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  MinLength,
} from 'class-validator';

// Tipos de forma de pagamento
export const PAYMENT_METHOD_TYPES = [
  'CASH',
  'PIX',
  'CARD_CREDIT',
  'CARD_DEBIT',
  'TRANSFER',
  'VOUCHER',
  'OTHER',
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

// Tipos de taxa/desconto
export const FEE_TYPES = ['DISCOUNT', 'FEE'] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const FEE_MODES = ['PERCENT', 'FIXED'] as const;
export type FeeMode = (typeof FEE_MODES)[number];

// DTO para criar forma de pagamento
export class CreatePaymentMethodDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name!: string;

  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(PAYMENT_METHOD_TYPES, {
    message: `Tipo deve ser: ${PAYMENT_METHOD_TYPES.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type!: PaymentMethodType;

  @IsString({ message: 'Tipo de taxa deve ser uma string' })
  @IsIn(FEE_TYPES, { message: `Tipo de taxa deve ser: ${FEE_TYPES.join(', ')}` })
  @IsOptional()
  feeType?: FeeType;

  @IsString({ message: 'Modo de taxa deve ser uma string' })
  @IsIn(FEE_MODES, { message: `Modo de taxa deve ser: ${FEE_MODES.join(', ')}` })
  @IsOptional()
  feeMode?: FeeMode;

  @IsNumber({}, { message: 'Valor da taxa deve ser um número' })
  @Min(0, { message: 'Valor da taxa não pode ser negativo' })
  @IsOptional()
  feeValue?: number;

  @IsNumber({}, { message: 'Ordem deve ser um número' })
  @Min(0, { message: 'Ordem não pode ser negativa' })
  @IsOptional()
  sortOrder?: number;
}

// DTO para atualizar forma de pagamento
export class UpdatePaymentMethodDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(PAYMENT_METHOD_TYPES, {
    message: `Tipo deve ser: ${PAYMENT_METHOD_TYPES.join(', ')}`,
  })
  @IsOptional()
  type?: PaymentMethodType;

  @IsString({ message: 'Tipo de taxa deve ser uma string' })
  @IsIn([...FEE_TYPES, null], { message: `Tipo de taxa deve ser: ${FEE_TYPES.join(', ')} ou null` })
  @IsOptional()
  feeType?: FeeType | null;

  @IsString({ message: 'Modo de taxa deve ser uma string' })
  @IsIn([...FEE_MODES, null], { message: `Modo de taxa deve ser: ${FEE_MODES.join(', ')} ou null` })
  @IsOptional()
  feeMode?: FeeMode | null;

  @IsNumber({}, { message: 'Valor da taxa deve ser um número' })
  @Min(0, { message: 'Valor da taxa não pode ser negativo' })
  @IsOptional()
  feeValue?: number;

  @IsNumber({}, { message: 'Ordem deve ser um número' })
  @Min(0, { message: 'Ordem não pode ser negativa' })
  @IsOptional()
  sortOrder?: number;

  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;
}

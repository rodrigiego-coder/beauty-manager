import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

// Tipos de destino
export const PAYMENT_DESTINATION_TYPES = [
  'BANK',
  'CARD_MACHINE',
  'CASH_DRAWER',
  'OTHER',
] as const;

export type PaymentDestinationType = (typeof PAYMENT_DESTINATION_TYPES)[number];

// Tipos de taxa/desconto (reutilizados do payment-methods)
export const FEE_TYPES = ['DISCOUNT', 'FEE'] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const FEE_MODES = ['PERCENT', 'FIXED'] as const;
export type FeeMode = (typeof FEE_MODES)[number];

// DTO para criar destino de pagamento
export class CreatePaymentDestinationDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name!: string;

  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(PAYMENT_DESTINATION_TYPES, {
    message: `Tipo deve ser: ${PAYMENT_DESTINATION_TYPES.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type!: PaymentDestinationType;

  @IsString({ message: 'Nome do banco deve ser uma string' })
  @IsOptional()
  bankName?: string;

  @IsString({ message: 'Últimos dígitos deve ser uma string' })
  @MaxLength(10, { message: 'Últimos dígitos deve ter no máximo 10 caracteres' })
  @IsOptional()
  lastDigits?: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

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

// DTO para atualizar destino de pagamento
export class UpdatePaymentDestinationDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(PAYMENT_DESTINATION_TYPES, {
    message: `Tipo deve ser: ${PAYMENT_DESTINATION_TYPES.join(', ')}`,
  })
  @IsOptional()
  type?: PaymentDestinationType;

  @IsString({ message: 'Nome do banco deve ser uma string' })
  @IsOptional()
  bankName?: string | null;

  @IsString({ message: 'Últimos dígitos deve ser uma string' })
  @MaxLength(10, { message: 'Últimos dígitos deve ter no máximo 10 caracteres' })
  @IsOptional()
  lastDigits?: string | null;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string | null;

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

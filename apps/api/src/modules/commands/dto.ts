import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';

// Status da comanda
export enum CommandStatus {
  OPEN = 'OPEN',
  IN_SERVICE = 'IN_SERVICE',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
}

// Tipo de item
export enum CommandItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

// Métodos de pagamento
export enum PaymentMethod {
  CASH = 'CASH',
  CARD_CREDIT = 'CARD_CREDIT',
  CARD_DEBIT = 'CARD_DEBIT',
  PIX = 'PIX',
  VOUCHER = 'VOUCHER',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

// DTO para abrir comanda
export class OpenCommandDto {
  @IsString({ message: 'Numero do cartao deve ser uma string' })
  @IsNotEmpty({ message: 'Numero do cartao e obrigatorio' })
  cardNumber!: string;

  @IsUUID('4', { message: 'ID do cliente deve ser um UUID valido' })
  @IsOptional()
  clientId?: string;

  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}

// DTO para adicionar item
export class AddItemDto {
  @IsEnum(CommandItemType, { message: 'Tipo deve ser SERVICE ou PRODUCT' })
  @IsNotEmpty({ message: 'Tipo e obrigatorio' })
  type!: CommandItemType;

  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  description!: string;

  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0.01, { message: 'Quantidade deve ser maior que zero' })
  @IsOptional()
  quantity?: number;

  @IsNumber({}, { message: 'Preco unitario deve ser um numero' })
  @Min(0, { message: 'Preco unitario deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Preco unitario e obrigatorio' })
  unitPrice!: number;

  @IsNumber({}, { message: 'Desconto deve ser um numero' })
  @Min(0, { message: 'Desconto deve ser maior ou igual a zero' })
  @IsOptional()
  discount?: number;

  @IsUUID('4', { message: 'ID do profissional deve ser um UUID valido' })
  @IsOptional()
  performerId?: string;

  @IsUUID('4', { message: 'ID de referencia deve ser um UUID valido' })
  @IsOptional()
  referenceId?: string;
}

// DTO para atualizar item
export class UpdateItemDto {
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0.01, { message: 'Quantidade deve ser maior que zero' })
  @IsOptional()
  quantity?: number;

  @IsNumber({}, { message: 'Preco unitario deve ser um numero' })
  @Min(0, { message: 'Preco unitario deve ser maior ou igual a zero' })
  @IsOptional()
  unitPrice?: number;

  @IsNumber({}, { message: 'Desconto deve ser um numero' })
  @Min(0, { message: 'Desconto deve ser maior ou igual a zero' })
  @IsOptional()
  discount?: number;

  @IsUUID('4', { message: 'ID do profissional deve ser um UUID valido' })
  @IsOptional()
  performerId?: string;
}

// DTO para remover item
export class RemoveItemDto {
  @IsString({ message: 'Motivo deve ser uma string' })
  @IsOptional()
  reason?: string;
}

// DTO para aplicar desconto geral
export class ApplyDiscountDto {
  @IsNumber({}, { message: 'Valor do desconto deve ser um numero' })
  @Min(0, { message: 'Desconto deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor do desconto e obrigatorio' })
  discountAmount!: number;

  @IsString({ message: 'Motivo deve ser uma string' })
  @IsOptional()
  reason?: string;
}

// DTO para adicionar pagamento
export class AddPaymentDto {
  @IsEnum(PaymentMethod, { message: 'Metodo de pagamento invalido' })
  @IsNotEmpty({ message: 'Metodo de pagamento e obrigatorio' })
  method!: PaymentMethod;

  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  amount!: number;

  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}

// DTO para adicionar nota
export class AddNoteDto {
  @IsString({ message: 'Nota deve ser uma string' })
  @IsNotEmpty({ message: 'Nota e obrigatoria' })
  note!: string;
}

// DTO para vincular cliente
export class LinkClientDto {
  @IsUUID('4', { message: 'ID do cliente deve ser um UUID valido' })
  @IsNotEmpty({ message: 'ID do cliente e obrigatorio' })
  clientId!: string;
}
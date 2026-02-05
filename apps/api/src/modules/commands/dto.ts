import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsNumberString,
  IsEnum,
  IsBoolean,
  Min,
  ValidateIf,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Regex para UUID genérico (aceita qualquer versão/formato)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  @ApiPropertyOptional({ description: 'Número do cartão/ficha da comanda', example: '42' })
  @IsString({ message: 'Numero do cartao deve ser uma string' })
  @IsOptional()
  cardNumber?: string;

  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Matches(UUID_REGEX, { message: 'ID do cliente deve ser um UUID valido' })
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Notas da comanda', example: 'Cliente aguardando no sofá' })
  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}

// DTO para adicionar item
export class AddItemDto {
  @ApiProperty({ description: 'Tipo do item', enum: CommandItemType, example: 'SERVICE' })
  @IsEnum(CommandItemType, { message: 'Tipo deve ser SERVICE ou PRODUCT' })
  @IsNotEmpty({ message: 'Tipo e obrigatorio' })
  type!: CommandItemType;

  @ApiProperty({ description: 'Descrição do item', example: 'Corte Feminino' })
  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  description!: string;

  @ApiPropertyOptional({ description: 'Quantidade', example: 1, minimum: 0.01 })
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0.01, { message: 'Quantidade deve ser maior que zero' })
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Preço unitário em reais', example: 80.0, minimum: 0 })
  @IsNumber({}, { message: 'Preco unitario deve ser um numero' })
  @Min(0, { message: 'Preco unitario deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Preco unitario e obrigatorio' })
  unitPrice!: number;

  @ApiPropertyOptional({ description: 'Desconto em reais', example: 10.0, minimum: 0 })
  @IsNumber({}, { message: 'Desconto deve ser um numero' })
  @Min(0, { message: 'Desconto deve ser maior ou igual a zero' })
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'ID do profissional que executou (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @Matches(UUID_REGEX, { message: 'ID do profissional deve ser um UUID valido' })
  @IsOptional()
  performerId?: string;

  // HARDENING: referenceId obrigatório para PRODUCT, opcional para SERVICE
  @ApiPropertyOptional({ description: 'ID de referência (obrigatório para PRODUCT)', example: '123' })
  @ValidateIf((o) => o.type === 'PRODUCT')
  @IsNotEmpty({ message: 'referenceId e obrigatorio para itens do tipo PRODUCT' })
  @IsNumberString({}, { message: 'ID de referencia deve ser um numero inteiro' })
  referenceId?: string;

  // Variante da receita (para serviços com tamanho de cabelo)
  @ApiPropertyOptional({ description: 'ID da variante de receita (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' })
  @Matches(UUID_REGEX, { message: 'ID da variante deve ser um UUID valido' })
  @IsOptional()
  variantId?: string;

  // Controle de pacote de sessões
  @ApiPropertyOptional({ description: 'Indica se deve usar sessão do pacote do cliente (default: auto-detecta)', example: true })
  @IsBoolean({ message: 'paidByPackage deve ser um booleano' })
  @IsOptional()
  paidByPackage?: boolean;
}

// DTO para atualizar item
export class UpdateItemDto {
  @ApiPropertyOptional({ description: 'Quantidade', example: 2, minimum: 0.01 })
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0.01, { message: 'Quantidade deve ser maior que zero' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Preço unitário em reais', example: 80.0, minimum: 0 })
  @IsNumber({}, { message: 'Preco unitario deve ser um numero' })
  @Min(0, { message: 'Preco unitario deve ser maior ou igual a zero' })
  @IsOptional()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Desconto em reais', example: 10.0, minimum: 0 })
  @IsNumber({}, { message: 'Desconto deve ser um numero' })
  @Min(0, { message: 'Desconto deve ser maior ou igual a zero' })
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'ID do profissional que executou (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @Matches(UUID_REGEX, { message: 'ID do profissional deve ser um UUID valido' })
  @IsOptional()
  performerId?: string;
}

// DTO para remover item
export class RemoveItemDto {
  @ApiPropertyOptional({ description: 'Motivo da remoção', example: 'Cliente desistiu do serviço' })
  @IsString({ message: 'Motivo deve ser uma string' })
  @IsOptional()
  reason?: string;
}

// DTO para aplicar desconto geral
export class ApplyDiscountDto {
  @ApiProperty({ description: 'Valor do desconto em reais', example: 20.0, minimum: 0 })
  @IsNumber({}, { message: 'Valor do desconto deve ser um numero' })
  @Min(0, { message: 'Desconto deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor do desconto e obrigatorio' })
  discountAmount!: number;

  @ApiPropertyOptional({ description: 'Motivo do desconto', example: 'Desconto de aniversário' })
  @IsString({ message: 'Motivo deve ser uma string' })
  @IsOptional()
  reason?: string;
}

// DTO para adicionar pagamento (compatível com formato legado e novo)
export class AddPaymentDto {
  // Formato legado (mantido para compatibilidade)
  @ApiPropertyOptional({ description: 'Método de pagamento (formato legado)', enum: PaymentMethod, example: 'PIX' })
  @IsEnum(PaymentMethod, { message: 'Metodo de pagamento invalido' })
  @IsOptional()
  method?: PaymentMethod;

  // Novo formato: ID da forma de pagamento configurada
  @ApiPropertyOptional({ description: 'ID da forma de pagamento configurada (UUID)', example: '550e8400-e29b-41d4-a716-446655440003' })
  @Matches(UUID_REGEX, { message: 'ID da forma de pagamento deve ser um UUID valido' })
  @IsOptional()
  paymentMethodId?: string;

  // Novo: ID do destino do pagamento (opcional)
  @ApiPropertyOptional({ description: 'ID do destino do pagamento (UUID)', example: '550e8400-e29b-41d4-a716-446655440004' })
  @Matches(UUID_REGEX, { message: 'ID do destino deve ser um UUID valido' })
  @IsOptional()
  paymentDestinationId?: string;

  @ApiProperty({ description: 'Valor do pagamento em reais', example: 150.0, minimum: 0.01 })
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  amount!: number;

  @ApiPropertyOptional({ description: 'Notas do pagamento', example: 'Pagamento parcial' })
  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}

// DTO para reabrir comanda (apenas OWNER/MANAGER)
export class ReopenCommandDto {
  @ApiProperty({ description: 'Motivo para reabrir a comanda', example: 'Esqueceu de adicionar serviço' })
  @IsString({ message: 'Motivo deve ser uma string' })
  @IsNotEmpty({ message: 'Motivo e obrigatorio' })
  reason!: string;
}

// DTO para adicionar nota
export class AddNoteDto {
  @ApiProperty({ description: 'Nota a adicionar na comanda', example: 'Cliente solicitou água' })
  @IsString({ message: 'Nota deve ser uma string' })
  @IsNotEmpty({ message: 'Nota e obrigatoria' })
  note!: string;
}

// DTO para vincular cliente
export class LinkClientDto {
  @ApiProperty({ description: 'ID do cliente a vincular (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Matches(UUID_REGEX, { message: 'ID do cliente deve ser um UUID valido' })
  @IsNotEmpty({ message: 'ID do cliente e obrigatorio' })
  clientId!: string;
}
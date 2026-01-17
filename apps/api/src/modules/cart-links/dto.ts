import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== CART LINK DTOs ====================

export class CartLinkItemDto {
  @ApiProperty({ description: 'Tipo do item', enum: ['PRODUCT', 'SERVICE'], example: 'PRODUCT' })
  @IsEnum(['PRODUCT', 'SERVICE'])
  type!: string;

  @ApiProperty({ description: 'ID do item (produto ou serviço)', example: 123 })
  @IsNumber()
  itemId!: number;

  @ApiPropertyOptional({ description: 'Quantidade', example: 2, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Desconto em reais', example: 10.00, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateCartLinkDto {
  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Telefone do cliente', example: '11999998888' })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiPropertyOptional({ description: 'Nome do cliente', example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ description: 'Origem do link', enum: ['WHATSAPP', 'SMS', 'EMAIL', 'MANUAL'], example: 'WHATSAPP' })
  @IsEnum(['WHATSAPP', 'SMS', 'EMAIL', 'MANUAL'])
  source!: string;

  @ApiPropertyOptional({ description: 'Mensagem personalizada', example: 'Confira esses produtos!' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Data de expiração (ISO 8601)', example: '2024-02-28T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Itens do carrinho', type: [CartLinkItemDto], isArray: true })
  @IsArray()
  items!: CartLinkItemDto[];
}

export class UpdateCartLinkDto {
  @ApiPropertyOptional({ description: 'Mensagem personalizada', example: 'Confira esses produtos!' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Data de expiração (ISO 8601)', example: '2024-02-28T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Itens do carrinho', type: [CartLinkItemDto], isArray: true })
  @IsOptional()
  @IsArray()
  items?: CartLinkItemDto[];

  @ApiPropertyOptional({ description: 'Link ativo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ConvertCartLinkDto {
  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Nome do cliente', example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Telefone do cliente', example: '11999998888' })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiProperty({ description: 'Tipo de entrega', enum: ['PICKUP', 'DELIVERY'], example: 'PICKUP' })
  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType!: string;

  @ApiPropertyOptional({ description: 'Endereço de entrega (para DELIVERY)', example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'CASH'], example: 'PIX' })
  @IsEnum(['PIX', 'CARD', 'CASH'])
  paymentMethod!: string;

  @ApiPropertyOptional({ description: 'Observações', example: 'Entregar após as 18h' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface CartLinkItemResponse {
  type: string;
  itemId: number;
  name: string;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  quantity: number;
}

export interface CartLinkResponse {
  id: string;
  salonId: string;
  code: string;
  clientId: string | null;
  clientPhone: string | null;
  clientName: string | null;
  source: string;
  status: string;
  items: CartLinkItemResponse[];
  message: string | null;
  totalOriginalPrice: string;
  totalDiscount: string;
  totalFinalPrice: string;
  viewCount: number;
  lastViewedAt: Date | null;
  convertedAt: Date | null;
  commandId: string | null;
  expiresAt: Date | null;
  publicUrl: string;
  createdAt: Date;
  updatedAt: Date;
  salon?: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  };
}

export interface CartLinkViewResponse {
  id: string;
  linkId: string;
  viewedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
}

export interface CartLinkStatsResponse {
  totalLinks: number;
  activeLinks: number;
  convertedLinks: number;
  expiredLinks: number;
  conversionRate: number;
  totalViews: number;
  totalRevenue: number;
  bySource: {
    source: string;
    count: number;
    converted: number;
    revenue: number;
  }[];
}

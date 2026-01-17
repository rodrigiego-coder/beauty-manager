import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== PLAN DTOs ====================

export class CreatePlanItemDto {
  @ApiProperty({ description: 'ID do produto', example: 1 })
  @IsNumber()
  productId!: number;

  @ApiPropertyOptional({ description: 'Quantidade do produto', example: 1, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;
}

export class CreatePlanDto {
  @ApiProperty({ description: 'Nome do plano de assinatura', example: 'Kit Mensal Cabelos' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Descrição do plano', example: 'Receba mensalmente os melhores produtos' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Período de cobrança', enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY'], example: 'MONTHLY' })
  @IsEnum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY'])
  billingPeriod!: string;

  @ApiPropertyOptional({ description: 'Percentual de desconto', example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'URL da imagem do plano', example: 'https://example.com/plan.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Lista de benefícios', example: ['Frete grátis', 'Desconto exclusivo'], isArray: true, type: String })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({ description: 'Máximo de assinantes', example: 100, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSubscribers?: number;

  @ApiProperty({ description: 'Itens do plano', type: [CreatePlanItemDto], isArray: true })
  @IsArray()
  items!: CreatePlanItemDto[];
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Nome do plano', example: 'Kit Mensal Cabelos' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do plano', example: 'Receba mensalmente os melhores produtos' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Período de cobrança', enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY'], example: 'MONTHLY' })
  @IsOptional()
  @IsEnum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY'])
  billingPeriod?: string;

  @ApiPropertyOptional({ description: 'Percentual de desconto', example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'URL da imagem do plano', example: 'https://example.com/plan.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Lista de benefícios', example: ['Frete grátis', 'Desconto exclusivo'], isArray: true, type: String })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({ description: 'Máximo de assinantes', example: 100, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSubscribers?: number;

  @ApiPropertyOptional({ description: 'Plano ativo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddPlanItemDto {
  @ApiProperty({ description: 'ID do produto', example: 1 })
  @IsNumber()
  productId!: number;

  @ApiPropertyOptional({ description: 'Quantidade do produto', example: 1, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;
}

// ==================== SUBSCRIPTION DTOs ====================

export class SubscribeDto {
  @ApiProperty({ description: 'Tipo de entrega', enum: ['PICKUP', 'DELIVERY'], example: 'DELIVERY' })
  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType!: string;

  @ApiPropertyOptional({ description: 'Endereço de entrega (para DELIVERY)', example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'CASH_ON_DELIVERY'], example: 'PIX' })
  @IsEnum(['PIX', 'CARD', 'CASH_ON_DELIVERY'])
  paymentMethod!: string;

  @ApiProperty({ description: 'Data de início da assinatura (ISO 8601)', example: '2024-02-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ description: 'Observações', example: 'Entregar sempre após as 14h' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ description: 'Tipo de entrega', enum: ['PICKUP', 'DELIVERY'], example: 'DELIVERY' })
  @IsOptional()
  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType?: string;

  @ApiPropertyOptional({ description: 'Endereço de entrega', example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: 'Método de pagamento', enum: ['PIX', 'CARD', 'CASH_ON_DELIVERY'], example: 'PIX' })
  @IsOptional()
  @IsEnum(['PIX', 'CARD', 'CASH_ON_DELIVERY'])
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Observações', example: 'Entregar sempre após as 14h' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PauseSubscriptionDto {
  @ApiPropertyOptional({ description: 'Motivo da pausa', example: 'Viajando por 2 meses' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ description: 'Motivo do cancelamento', example: 'Não preciso mais dos produtos' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== DELIVERY DTOs ====================

export class UpdateDeliveryStatusDto {
  @ApiProperty({ description: 'Status da entrega', enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'], example: 'DELIVERED' })
  @IsEnum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])
  status!: string;

  @ApiPropertyOptional({ description: 'Observações da entrega', example: 'Entregue ao porteiro' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ==================== RESPONSE DTOs ====================

export interface PlanResponse {
  id: string;
  salonId: string;
  name: string;
  description: string | null;
  billingPeriod: string;
  originalPrice: string;
  discountPercent: string | null;
  finalPrice: string;
  isActive: boolean | null;
  maxSubscribers: number | null;
  currentSubscribers: number | null;
  imageUrl: string | null;
  benefits: string[] | null;
  items?: PlanItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanItemResponse {
  id: string;
  planId: string;
  productId: number;
  quantity: string;
  product?: {
    id: number;
    name: string;
    salePrice: string;
  } | null;
}

export interface SubscriptionResponse {
  id: string;
  salonId: string;
  clientId: string;
  planId: string;
  status: string;
  deliveryType: string | null;
  deliveryAddress: string | null;
  startDate: string;
  nextDeliveryDate: string;
  lastDeliveryDate: string | null;
  totalDeliveries: number | null;
  paymentMethod: string | null;
  notes: string | null;
  pausedAt: Date | null;
  pauseReason: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  plan?: PlanResponse;
  client?: {
    id: string;
    name: string | null;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryResponse {
  id: string;
  subscriptionId: string;
  salonId: string;
  scheduledDate: string;
  deliveredDate: string | null;
  status: string;
  deliveryType: string;
  commandId: string | null;
  totalAmount: string;
  notes: string | null;
  subscription?: SubscriptionResponse;
  items?: DeliveryItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItemResponse {
  id: string;
  deliveryId: string;
  productId: number;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  product?: {
    id: number;
    name: string;
  } | null;
}

export interface SubscriptionStats {
  totalPlans: number;
  activePlans: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingDeliveriesToday: number;
  monthlyRecurringRevenue: number;
}

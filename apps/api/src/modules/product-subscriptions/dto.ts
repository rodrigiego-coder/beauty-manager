import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, IsDateString } from 'class-validator';

// ==================== PLAN DTOs ====================

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY'])
  billingPeriod!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSubscribers?: number;

  @IsArray()
  items!: CreatePlanItemDto[];
}

export class CreatePlanItemDto {
  @IsNumber()
  productId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY'])
  billingPeriod?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSubscribers?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddPlanItemDto {
  @IsNumber()
  productId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;
}

// ==================== SUBSCRIPTION DTOs ====================

export class SubscribeDto {
  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType!: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsEnum(['PIX', 'CARD', 'CASH_ON_DELIVERY'])
  paymentMethod!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsEnum(['PIX', 'CARD', 'CASH_ON_DELIVERY'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PauseSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== DELIVERY DTOs ====================

export class UpdateDeliveryStatusDto {
  @IsEnum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])
  status!: string;

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

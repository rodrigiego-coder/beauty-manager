import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, IsDateString } from 'class-validator';

// ==================== CART LINK DTOs ====================

export class CreateCartLinkDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsEnum(['WHATSAPP', 'SMS', 'EMAIL', 'MANUAL'])
  source!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsArray()
  items!: CartLinkItemDto[];
}

export class CartLinkItemDto {
  @IsEnum(['PRODUCT', 'SERVICE'])
  type!: string;

  @IsNumber()
  itemId!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class UpdateCartLinkDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  items?: CartLinkItemDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ConvertCartLinkDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType!: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsEnum(['PIX', 'CARD', 'CASH'])
  paymentMethod!: string;

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

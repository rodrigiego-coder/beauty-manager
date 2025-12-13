import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, IsDateString } from 'class-validator';

// ==================== RESERVATION DTOs ====================

export class CreateReservationDto {
  @IsString()
  clientId!: string;

  @IsArray()
  items!: ReservationItemDto[];

  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType!: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReservationItemDto {
  @IsNumber()
  productId!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class UpdateReservationDto {
  @IsOptional()
  @IsEnum(['PICKUP', 'DELIVERY'])
  deliveryType?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReservationStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED'])
  status!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface ReservationItemResponse {
  id: string;
  reservationId: string;
  productId: number;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  product?: {
    id: number;
    name: string;
    sku: string | null;
  } | null;
}

export interface ReservationResponse {
  id: string;
  salonId: string;
  clientId: string;
  status: string;
  deliveryType: string;
  deliveryAddress: string | null;
  scheduledDate: string | null;
  totalAmount: string;
  commandId: string | null;
  notes: string | null;
  confirmedAt: Date | null;
  readyAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  items?: ReservationItemResponse[];
  client?: {
    id: string;
    name: string | null;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationStatsResponse {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  readyReservations: number;
  deliveredReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  averageValue: number;
  byDeliveryType: {
    type: string;
    count: number;
    revenue: number;
  }[];
}

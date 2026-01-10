import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsEnum,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

// ==================== ENUMS ====================

export enum DepositType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum HoldStatus {
  ACTIVE = 'ACTIVE',
  CONVERTED = 'CONVERTED',
  EXPIRED = 'EXPIRED',
  RELEASED = 'RELEASED',
}

export enum OtpType {
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  CANCEL_BOOKING = 'CANCEL_BOOKING',
}

export enum DepositStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FORFEITED = 'FORFEITED',
}

export enum BookingRuleType {
  BLOCKED = 'BLOCKED',
  VIP_ONLY = 'VIP_ONLY',
  DEPOSIT_REQUIRED = 'DEPOSIT_REQUIRED',
  RESTRICTED_SERVICES = 'RESTRICTED_SERVICES',
}

// ==================== ONLINE BOOKING SETTINGS DTOs ====================

export class CreateOnlineBookingSettingsDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  @IsOptional()
  slug?: string;

  @IsNumber()
  @Min(0)
  @Max(168) // máximo 1 semana em horas
  @IsOptional()
  minAdvanceHours?: number;

  @IsNumber()
  @Min(1)
  @Max(365)
  @IsOptional()
  maxAdvanceDays?: number;

  @IsNumber()
  @Min(5)
  @Max(60)
  @IsOptional()
  holdDurationMinutes?: number;

  @IsNumber()
  @Min(0)
  @Max(168)
  @IsOptional()
  cancellationHours?: number;

  @IsBoolean()
  @IsOptional()
  allowRescheduling?: boolean;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxReschedules?: number;

  @IsBoolean()
  @IsOptional()
  requirePhoneVerification?: boolean;

  @IsBoolean()
  @IsOptional()
  requireDeposit?: boolean;

  @IsEnum(DepositType)
  @IsOptional()
  depositType?: DepositType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  depositMinServices?: number;

  @IsBoolean()
  @IsOptional()
  allowNewClients?: boolean;

  @IsBoolean()
  @IsOptional()
  newClientRequiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  newClientDepositRequired?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxDailyBookings?: number;

  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  maxWeeklyBookingsPerClient?: number;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  welcomeMessage?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  confirmationMessage?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  cancellationMessage?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  termsUrl?: string;

  @IsBoolean()
  @IsOptional()
  requireTermsAcceptance?: boolean;

  @IsBoolean()
  @IsOptional()
  sendWhatsappConfirmation?: boolean;

  @IsBoolean()
  @IsOptional()
  sendWhatsappReminder?: boolean;

  @IsNumber()
  @Min(1)
  @Max(72)
  @IsOptional()
  reminderHoursBefore?: number;
}

export class UpdateOnlineBookingSettingsDto extends CreateOnlineBookingSettingsDto {}

// ==================== APPOINTMENT HOLD DTOs ====================

export class CreateHoldDto {
  @IsUUID()
  professionalId!: string;

  @IsNumber()
  serviceId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })
  date!: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime deve estar no formato HH:MM' })
  startTime!: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime deve estar no formato HH:MM' })
  endTime!: string;

  @Matches(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })
  clientPhone!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  clientName?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  sessionId?: string;
}

export class ConvertHoldDto {
  @IsUUID()
  holdId!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  clientName?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  acceptedTerms?: boolean;
}

// ==================== OTP DTOs ====================

export class SendOtpDto {
  @Matches(/^\d{10,11}$/, { message: 'phone deve ter 10 ou 11 dígitos' })
  phone!: string;

  @IsEnum(OtpType)
  type!: OtpType;

  @IsUUID()
  @IsOptional()
  holdId?: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;
}

export class VerifyOtpDto {
  @Matches(/^\d{10,11}$/, { message: 'phone deve ter 10 ou 11 dígitos' })
  phone!: string;

  @Matches(/^\d{6}$/, { message: 'code deve ter 6 dígitos' })
  code!: string;

  @IsEnum(OtpType)
  type!: OtpType;
}

// ==================== CLIENT BOOKING RULE DTOs ====================

export class CreateClientBookingRuleDto {
  @Matches(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })
  @IsOptional()
  clientPhone?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsEnum(BookingRuleType)
  ruleType!: BookingRuleType;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  restrictedServiceIds?: number[];

  @IsString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdateClientBookingRuleDto {
  @IsEnum(BookingRuleType)
  @IsOptional()
  ruleType?: BookingRuleType;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  restrictedServiceIds?: number[];

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ==================== DEPOSIT DTOs ====================

export class CreateDepositDto {
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsUUID()
  @IsOptional()
  holdId?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class ProcessDepositPaymentDto {
  @IsUUID()
  depositId!: string;

  @IsString()
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  mercadoPagoPaymentId?: string;
}

// ==================== PUBLIC BOOKING DTOs ====================

export class CheckAvailabilityDto {
  @IsUUID()
  professionalId!: string;

  @IsNumber()
  serviceId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })
  date!: string;
}

export class GetAvailableSlotsDto {
  @IsUUID()
  @IsOptional()
  professionalId?: string;

  @IsNumber()
  @IsOptional()
  serviceId?: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate deve estar no formato YYYY-MM-DD' })
  startDate!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate deve estar no formato YYYY-MM-DD' })
  @IsOptional()
  endDate?: string;
}

export class CreateOnlineBookingDto {
  @IsUUID()
  professionalId!: string;

  @IsNumber()
  serviceId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })
  date!: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'time deve estar no formato HH:MM' })
  time!: string;

  @Matches(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })
  clientPhone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  clientName!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  acceptedTerms?: boolean;

  @IsString()
  @IsOptional()
  otpCode?: string;
}

export class CancelOnlineBookingDto {
  @IsUUID()
  appointmentId!: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  otpCode?: string;

  @IsUUID()
  @IsOptional()
  clientAccessToken?: string;
}

export class RescheduleOnlineBookingDto {
  @IsUUID()
  appointmentId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'newDate deve estar no formato YYYY-MM-DD' })
  newDate!: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'newTime deve estar no formato HH:MM' })
  newTime!: string;

  @IsUUID()
  @IsOptional()
  newProfessionalId?: string;

  @IsString()
  @IsOptional()
  otpCode?: string;

  @IsUUID()
  @IsOptional()
  clientAccessToken?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface OnlineBookingSettingsResponse {
  id: string;
  salonId: string;
  slug: string | null;
  enabled: boolean;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  holdDurationMinutes: number;
  cancellationHours: number;
  allowRescheduling: boolean;
  maxReschedules: number;
  requirePhoneVerification: boolean;
  requireDeposit: boolean;
  depositType: string | null;
  depositValue: string | null;
  depositMinServices: string | null;
  allowNewClients: boolean;
  newClientRequiresApproval: boolean;
  newClientDepositRequired: boolean;
  maxDailyBookings: number | null;
  maxWeeklyBookingsPerClient: number | null;
  welcomeMessage: string | null;
  confirmationMessage: string | null;
  cancellationMessage: string | null;
  termsUrl: string | null;
  requireTermsAcceptance: boolean;
  sendWhatsappConfirmation: boolean;
  sendWhatsappReminder: boolean;
  reminderHoursBefore: number;
}

export interface AvailableSlot {
  date: string;
  time: string;
  endTime: string;
  professionalId: string;
  professionalName: string;
  serviceId: number;
  serviceName: string;
  duration: number;
  price: string;
}

export interface HoldResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  professionalName: string;
  serviceName: string;
  expiresAt: Date;
  expiresInSeconds: number;
}

export interface BookingConfirmation {
  appointmentId: string;
  date: string;
  time: string;
  professionalName: string;
  serviceName: string;
  clientAccessToken: string;
  depositRequired: boolean;
  depositAmount?: string;
  depositPixCode?: string;
}

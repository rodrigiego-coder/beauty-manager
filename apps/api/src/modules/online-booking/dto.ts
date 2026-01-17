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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== ENUMS ====================

export enum DepositType {
  NONE = 'NONE',
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

export enum OperationMode {
  SECRETARY_ONLY = 'SECRETARY_ONLY',
  SECRETARY_AND_ONLINE = 'SECRETARY_AND_ONLINE',
  SECRETARY_WITH_LINK = 'SECRETARY_WITH_LINK',
}

export enum DepositAppliesTo {
  ALL = 'ALL',
  NEW_CLIENTS = 'NEW_CLIENTS',
  SPECIFIC_SERVICES = 'SPECIFIC_SERVICES',
  SELECTED_CLIENTS = 'SELECTED_CLIENTS',
}

export class CreateOnlineBookingSettingsDto {
  @ApiPropertyOptional({ description: 'Agendamento online habilitado', example: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Slug único do salão para URL pública', example: 'meu-salao', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Modo de operação', enum: OperationMode, example: 'SECRETARY_AND_ONLINE' })
  @IsEnum(OperationMode)
  @IsOptional()
  operationMode?: OperationMode;

  @ApiPropertyOptional({ description: 'Antecedência mínima em horas', example: 2, minimum: 0, maximum: 168 })
  @IsNumber()
  @Min(0)
  @Max(168)
  @IsOptional()
  minAdvanceHours?: number;

  @ApiPropertyOptional({ description: 'Antecedência máxima em dias', example: 30, minimum: 1, maximum: 365 })
  @IsNumber()
  @Min(1)
  @Max(365)
  @IsOptional()
  maxAdvanceDays?: number;

  @ApiPropertyOptional({ description: 'Duração da reserva temporária em minutos', example: 15, minimum: 5, maximum: 60 })
  @IsNumber()
  @Min(5)
  @Max(60)
  @IsOptional()
  holdDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Intervalo entre slots em minutos', example: 30, minimum: 15, maximum: 120 })
  @IsNumber()
  @Min(15)
  @Max(120)
  @IsOptional()
  slotIntervalMinutes?: number;

  @ApiPropertyOptional({ description: 'Permitir agendamento no mesmo dia', example: true })
  @IsBoolean()
  @IsOptional()
  allowSameDayBooking?: boolean;

  @ApiPropertyOptional({ description: 'Horas mínimas para cancelamento', example: 24, minimum: 0, maximum: 168 })
  @IsNumber()
  @Min(0)
  @Max(168)
  @IsOptional()
  cancellationHours?: number;

  @ApiPropertyOptional({ description: 'Política de cancelamento', example: 'Cancelamentos devem ser feitos com 24h de antecedência', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  cancellationPolicy?: string;

  @ApiPropertyOptional({ description: 'Permitir reagendamento', example: true })
  @IsBoolean()
  @IsOptional()
  allowRescheduling?: boolean;

  @ApiPropertyOptional({ description: 'Máximo de reagendamentos permitidos', example: 2, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxReschedules?: number;

  @ApiPropertyOptional({ description: 'Exigir verificação de telefone por OTP', example: true })
  @IsBoolean()
  @IsOptional()
  requirePhoneVerification?: boolean;

  @ApiPropertyOptional({ description: 'Exigir depósito/sinal', example: false })
  @IsBoolean()
  @IsOptional()
  requireDeposit?: boolean;

  @ApiPropertyOptional({ description: 'Tipo de depósito', enum: DepositType, example: 'FIXED' })
  @IsEnum(DepositType)
  @IsOptional()
  depositType?: DepositType;

  @ApiPropertyOptional({ description: 'Valor do depósito (fixo ou percentual)', example: 50.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  depositValue?: number;

  @ApiPropertyOptional({ description: 'Mínimo de serviços para exigir depósito', example: 1, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  depositMinServices?: number;

  @ApiPropertyOptional({ description: 'A quem se aplica o depósito', enum: DepositAppliesTo, example: 'NEW_CLIENTS' })
  @IsEnum(DepositAppliesTo)
  @IsOptional()
  depositAppliesTo?: DepositAppliesTo;

  @ApiPropertyOptional({ description: 'Permitir novos clientes', example: true })
  @IsBoolean()
  @IsOptional()
  allowNewClients?: boolean;

  @ApiPropertyOptional({ description: 'Novos clientes precisam aprovação', example: false })
  @IsBoolean()
  @IsOptional()
  newClientRequiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Novos clientes exigem depósito', example: true })
  @IsBoolean()
  @IsOptional()
  newClientDepositRequired?: boolean;

  @ApiPropertyOptional({ description: 'Máximo de agendamentos por dia', example: 50, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxDailyBookings?: number;

  @ApiPropertyOptional({ description: 'Máximo de agendamentos semanais por cliente', example: 3, minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  maxWeeklyBookingsPerClient?: number;

  @ApiPropertyOptional({ description: 'Mensagem de boas-vindas', example: 'Bem-vindo ao nosso sistema de agendamento!', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  welcomeMessage?: string;

  @ApiPropertyOptional({ description: 'Mensagem de confirmação', example: 'Seu agendamento foi confirmado!', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  confirmationMessage?: string;

  @ApiPropertyOptional({ description: 'Mensagem de cancelamento', example: 'Seu agendamento foi cancelado.', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  cancellationMessage?: string;

  @ApiPropertyOptional({ description: 'URL dos termos de uso', example: 'https://meusalao.com/termos', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  termsUrl?: string;

  @ApiPropertyOptional({ description: 'Exigir aceite dos termos', example: true })
  @IsBoolean()
  @IsOptional()
  requireTermsAcceptance?: boolean;

  @ApiPropertyOptional({ description: 'Enviar confirmação via WhatsApp', example: true })
  @IsBoolean()
  @IsOptional()
  sendWhatsappConfirmation?: boolean;

  @ApiPropertyOptional({ description: 'Enviar lembrete via WhatsApp', example: true })
  @IsBoolean()
  @IsOptional()
  sendWhatsappReminder?: boolean;

  @ApiPropertyOptional({ description: 'Horas antes para enviar lembrete', example: 24, minimum: 1, maximum: 72 })
  @IsNumber()
  @Min(1)
  @Max(72)
  @IsOptional()
  reminderHoursBefore?: number;
}

export class UpdateOnlineBookingSettingsDto extends CreateOnlineBookingSettingsDto {}

// ==================== APPOINTMENT HOLD DTOs ====================

export class CreateHoldDto {
  @ApiProperty({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  professionalId!: string;

  @ApiProperty({ description: 'ID do serviço', example: 1 })
  @IsNumber()
  serviceId!: number;

  @ApiProperty({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2024-02-15' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ description: 'Horário de início (HH:MM)', example: '14:00' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime deve estar no formato HH:MM' })
  startTime!: string;

  @ApiProperty({ description: 'Horário de fim (HH:MM)', example: '15:00' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime deve estar no formato HH:MM' })
  endTime!: string;

  @ApiProperty({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' })
  @Matches(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })
  clientPhone!: string;

  @ApiPropertyOptional({ description: 'Nome do cliente', example: 'Maria Silva', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional({ description: 'ID da sessão do cliente', example: 'sess_abc123', maxLength: 100 })
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
  @ApiProperty({ description: 'Telefone para envio do OTP (10-11 dígitos)', example: '11999998888' })
  @Matches(/^\d{10,11}$/, { message: 'phone deve ter 10 ou 11 dígitos' })
  phone!: string;

  @ApiProperty({ description: 'Tipo de OTP', enum: OtpType, example: 'PHONE_VERIFICATION' })
  @IsEnum(OtpType)
  type!: OtpType;

  @ApiPropertyOptional({ description: 'ID da reserva temporária (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsOptional()
  holdId?: string;

  @ApiPropertyOptional({ description: 'ID do agendamento (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Telefone usado no envio (10-11 dígitos)', example: '11999998888' })
  @Matches(/^\d{10,11}$/, { message: 'phone deve ter 10 ou 11 dígitos' })
  phone!: string;

  @ApiProperty({ description: 'Código OTP de 6 dígitos', example: '123456' })
  @Matches(/^\d{6}$/, { message: 'code deve ter 6 dígitos' })
  code!: string;

  @ApiProperty({ description: 'Tipo de OTP', enum: OtpType, example: 'PHONE_VERIFICATION' })
  @IsEnum(OtpType)
  type!: OtpType;
}

// ==================== CLIENT BOOKING RULE DTOs ====================

export class CreateClientBookingRuleDto {
  @ApiPropertyOptional({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' })
  @Matches(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })
  @IsOptional()
  clientPhone?: string;

  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ description: 'Tipo da regra de bloqueio', enum: ['BLOCKED', 'VIP_ONLY', 'DEPOSIT_REQUIRED', 'RESTRICTED_SERVICES'], example: 'BLOCKED' })
  @IsEnum(BookingRuleType)
  ruleType!: BookingRuleType;

  @ApiPropertyOptional({ description: 'Motivo da regra', example: 'Cliente não compareceu 3x seguidas', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'IDs dos serviços restritos (para RESTRICTED_SERVICES)', example: [1, 2, 3], isArray: true, type: Number })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  restrictedServiceIds?: number[];

  @ApiPropertyOptional({ description: 'Data de expiração da regra (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @IsString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdateClientBookingRuleDto {
  @ApiPropertyOptional({ description: 'Tipo da regra de bloqueio', enum: ['BLOCKED', 'VIP_ONLY', 'DEPOSIT_REQUIRED', 'RESTRICTED_SERVICES'], example: 'BLOCKED' })
  @IsEnum(BookingRuleType)
  @IsOptional()
  ruleType?: BookingRuleType;

  @ApiPropertyOptional({ description: 'Motivo da regra', example: 'Cliente não compareceu 3x seguidas', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'IDs dos serviços restritos (para RESTRICTED_SERVICES)', example: [1, 2, 3], isArray: true, type: Number })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  restrictedServiceIds?: number[];

  @ApiPropertyOptional({ description: 'Data de expiração da regra (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @IsString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Regra ativa', example: true })
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
  @ApiProperty({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  professionalId!: string;

  @ApiProperty({ description: 'ID do serviço', example: 123 })
  @IsNumber()
  serviceId!: number;

  @ApiProperty({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2024-02-15' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve estar no formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ description: 'Horário do agendamento (HH:MM)', example: '14:30' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'time deve estar no formato HH:MM' })
  time!: string;

  @ApiProperty({ description: 'Telefone do cliente (10-11 dígitos)', example: '11999998888' })
  @Matches(/^\d{10,11}$/, { message: 'clientPhone deve ter 10 ou 11 dígitos' })
  clientPhone!: string;

  @ApiProperty({ description: 'Nome do cliente', example: 'Maria Silva', minLength: 2, maxLength: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  clientName!: string;

  @ApiPropertyOptional({ description: 'Email do cliente', example: 'maria@email.com', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional({ description: 'Observações do agendamento', example: 'Primeira vez no salão', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Cliente aceitou os termos', example: true })
  @IsBoolean()
  @IsOptional()
  acceptedTerms?: boolean;

  @ApiPropertyOptional({ description: 'Código OTP de verificação', example: '123456' })
  @IsString()
  @IsOptional()
  otpCode?: string;
}

export class CancelOnlineBookingDto {
  @ApiProperty({ description: 'ID do agendamento a cancelar (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  appointmentId!: string;

  @ApiPropertyOptional({ description: 'Motivo do cancelamento', example: 'Imprevisto pessoal', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Código OTP de verificação', example: '123456' })
  @IsString()
  @IsOptional()
  otpCode?: string;

  @ApiPropertyOptional({ description: 'Token de acesso do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
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
  operationMode: string;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  slotIntervalMinutes: number;
  allowSameDayBooking: boolean;
  holdDurationMinutes: number;
  cancellationHours: number;
  cancellationPolicy: string | null;
  allowRescheduling: boolean;
  maxReschedules: number;
  requirePhoneVerification: boolean;
  requireDeposit: boolean;
  depositType: string | null;
  depositValue: string | null;
  depositMinServices: string | null;
  depositAppliesTo: string;
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

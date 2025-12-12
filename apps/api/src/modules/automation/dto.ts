import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, Min, Max } from 'class-validator';

// ==================== ENUMS ====================

export enum MessageTemplateType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
  BIRTHDAY = 'BIRTHDAY',
  WELCOME = 'WELCOME',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  CUSTOM = 'CUSTOM',
}

export enum MessageChannel {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  BOTH = 'BOTH',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum WhatsAppProvider {
  META = 'META',
  TWILIO = 'TWILIO',
  ZENVIA = 'ZENVIA',
}

export enum SMSProvider {
  TWILIO = 'TWILIO',
  ZENVIA = 'ZENVIA',
  AWS_SNS = 'AWS_SNS',
}

// ==================== DTOs ====================

export class UpdateAutomationSettingsDto {
  // WhatsApp
  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;

  @IsEnum(WhatsAppProvider)
  @IsOptional()
  whatsappProvider?: WhatsAppProvider;

  @IsString()
  @IsOptional()
  whatsappApiKey?: string;

  @IsString()
  @IsOptional()
  whatsappPhoneNumberId?: string;

  @IsString()
  @IsOptional()
  whatsappBusinessAccountId?: string;

  // SMS
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsEnum(SMSProvider)
  @IsOptional()
  smsProvider?: SMSProvider;

  @IsString()
  @IsOptional()
  smsApiKey?: string;

  @IsString()
  @IsOptional()
  smsAccountSid?: string;

  @IsString()
  @IsOptional()
  smsPhoneNumber?: string;

  // Lembretes
  @IsBoolean()
  @IsOptional()
  reminderEnabled?: boolean;

  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  reminderHoursBefore?: number;

  // Confirmação
  @IsBoolean()
  @IsOptional()
  confirmationEnabled?: boolean;

  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  confirmationHoursBefore?: number;

  // Aniversário
  @IsBoolean()
  @IsOptional()
  birthdayEnabled?: boolean;

  @IsString()
  @IsOptional()
  birthdayTime?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  birthdayDiscountPercent?: number;

  // Review
  @IsBoolean()
  @IsOptional()
  reviewRequestEnabled?: boolean;

  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  reviewRequestHoursAfter?: number;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsEnum(MessageTemplateType)
  type!: MessageTemplateType;

  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  content!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsNumber()
  @IsOptional()
  triggerHoursBefore?: number;
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(MessageTemplateType)
  @IsOptional()
  type?: MessageTemplateType;

  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsNumber()
  @IsOptional()
  triggerHoursBefore?: number;
}

export class SendMessageDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsString()
  phoneNumber!: string;

  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @IsString()
  content!: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;
}

export class SendTestMessageDto {
  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @IsString()
  phoneNumber!: string;
}

export class MessageLogFiltersDto {
  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;

  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}

// ==================== INTERFACES ====================

export interface AutomationSettingsResponse {
  id: string;
  salonId: string;
  whatsappEnabled: boolean;
  whatsappProvider: WhatsAppProvider;
  whatsappConnected: boolean;
  smsEnabled: boolean;
  smsProvider: SMSProvider;
  smsConnected: boolean;
  smsBalance?: number;
  reminderEnabled: boolean;
  reminderHoursBefore: number;
  confirmationEnabled: boolean;
  confirmationHoursBefore: number;
  birthdayEnabled: boolean;
  birthdayTime: string;
  birthdayDiscountPercent?: number;
  reviewRequestEnabled: boolean;
  reviewRequestHoursAfter: number;
}

export interface MessageStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  totalCost: number;
  byChannel: {
    whatsapp: { sent: number; delivered: number; read: number; failed: number };
    sms: { sent: number; delivered: number; cost: number; failed: number };
  };
  byType: {
    reminder: number;
    confirmation: number;
    birthday: number;
    custom: number;
  };
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  cost?: number;
  error?: string;
}

export interface TemplateVariables {
  nome?: string;
  data?: string;
  horario?: string;
  servico?: string;
  profissional?: string;
  salonNome?: string;
  salonTelefone?: string;
  linkConfirmacao?: string;
  cupomDesconto?: string;
}

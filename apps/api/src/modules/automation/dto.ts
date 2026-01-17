import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({ description: 'Habilitar WhatsApp', example: true })
  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Provedor WhatsApp', enum: WhatsAppProvider, example: 'META' })
  @IsEnum(WhatsAppProvider)
  @IsOptional()
  whatsappProvider?: WhatsAppProvider;

  @ApiPropertyOptional({ description: 'API Key do WhatsApp', example: 'EAAxxxxxxxx' })
  @IsString()
  @IsOptional()
  whatsappApiKey?: string;

  @ApiPropertyOptional({ description: 'ID do número de telefone WhatsApp', example: '123456789012345' })
  @IsString()
  @IsOptional()
  whatsappPhoneNumberId?: string;

  @ApiPropertyOptional({ description: 'ID da conta WhatsApp Business', example: '987654321098765' })
  @IsString()
  @IsOptional()
  whatsappBusinessAccountId?: string;

  // SMS
  @ApiPropertyOptional({ description: 'Habilitar SMS', example: true })
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Provedor SMS', enum: SMSProvider, example: 'TWILIO' })
  @IsEnum(SMSProvider)
  @IsOptional()
  smsProvider?: SMSProvider;

  @ApiPropertyOptional({ description: 'API Key do SMS', example: 'SKxxxxxxxx' })
  @IsString()
  @IsOptional()
  smsApiKey?: string;

  @ApiPropertyOptional({ description: 'Account SID do SMS (Twilio)', example: 'ACxxxxxxxx' })
  @IsString()
  @IsOptional()
  smsAccountSid?: string;

  @ApiPropertyOptional({ description: 'Número de telefone para SMS', example: '+5511999998888' })
  @IsString()
  @IsOptional()
  smsPhoneNumber?: string;

  // Lembretes
  @ApiPropertyOptional({ description: 'Habilitar lembretes automáticos', example: true })
  @IsBoolean()
  @IsOptional()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Horas antes do agendamento para enviar lembrete', example: 24, minimum: 1, maximum: 168 })
  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  reminderHoursBefore?: number;

  // Confirmação
  @ApiPropertyOptional({ description: 'Habilitar confirmação automática', example: true })
  @IsBoolean()
  @IsOptional()
  confirmationEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Horas antes do agendamento para pedir confirmação', example: 48, minimum: 1, maximum: 168 })
  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  confirmationHoursBefore?: number;

  // Aniversário
  @ApiPropertyOptional({ description: 'Habilitar mensagens de aniversário', example: true })
  @IsBoolean()
  @IsOptional()
  birthdayEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Horário para enviar mensagem de aniversário (HH:mm)', example: '09:00' })
  @IsString()
  @IsOptional()
  birthdayTime?: string;

  @ApiPropertyOptional({ description: 'Percentual de desconto para aniversariantes', example: 10, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  birthdayDiscountPercent?: number;

  // Review
  @ApiPropertyOptional({ description: 'Habilitar solicitação de avaliação', example: true })
  @IsBoolean()
  @IsOptional()
  reviewRequestEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Horas após o atendimento para solicitar avaliação', example: 2, minimum: 1, maximum: 168 })
  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  reviewRequestHoursAfter?: number;
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'Nome do template', example: 'Lembrete 24h' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Tipo do template', enum: MessageTemplateType, example: 'APPOINTMENT_REMINDER' })
  @IsEnum(MessageTemplateType)
  type!: MessageTemplateType;

  @ApiPropertyOptional({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' })
  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @ApiPropertyOptional({ description: 'Assunto (para email)', example: 'Lembrete de agendamento' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Conteúdo do template (suporta variáveis)', example: 'Olá {{nome}}, seu agendamento é amanhã às {{horario}}' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ description: 'Template ativo', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Template padrão para o tipo', example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Horas antes do evento para disparar', example: 24 })
  @IsNumber()
  @IsOptional()
  triggerHoursBefore?: number;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: 'Nome do template', example: 'Lembrete 24h' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Tipo do template', enum: MessageTemplateType, example: 'APPOINTMENT_REMINDER' })
  @IsEnum(MessageTemplateType)
  @IsOptional()
  type?: MessageTemplateType;

  @ApiPropertyOptional({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' })
  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @ApiPropertyOptional({ description: 'Assunto (para email)', example: 'Lembrete de agendamento' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'Conteúdo do template', example: 'Olá {{nome}}, seu agendamento é amanhã às {{horario}}' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Template ativo', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Template padrão para o tipo', example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Horas antes do evento para disparar', example: 24 })
  @IsNumber()
  @IsOptional()
  triggerHoursBefore?: number;
}

export class SendMessageDto {
  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ description: 'Número de telefone', example: '5511999998888' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' })
  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @ApiProperty({ description: 'Conteúdo da mensagem', example: 'Olá! Esta é uma mensagem de teste.' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ description: 'ID do template (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: 'ID do agendamento (UUID)', example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;
}

export class SendTestMessageDto {
  @ApiProperty({ description: 'Canal de envio', enum: MessageChannel, example: 'WHATSAPP' })
  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @ApiProperty({ description: 'Número de telefone para teste', example: '5511999998888' })
  @IsString()
  phoneNumber!: string;
}

export class MessageLogFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por status da mensagem', enum: MessageStatus, example: 'SENT' })
  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;

  @ApiPropertyOptional({ description: 'Filtrar por canal de envio', enum: MessageChannel, example: 'WHATSAPP' })
  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @ApiPropertyOptional({ description: 'Filtrar por cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Data inicial (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Limite de registros', example: 50 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset para paginação', example: 0 })
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

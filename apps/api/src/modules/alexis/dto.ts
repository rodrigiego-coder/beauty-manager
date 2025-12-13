import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, MinLength, MaxLength } from 'class-validator';

/**
 * =====================================================
 * ALEXIS DTOs
 * =====================================================
 */

// ==================== MENSAGENS ====================

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  message!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  clientName?: string;
}

export class HumanMessageDto {
  @IsString()
  sessionId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  message!: string;
}

export class TakeoverDto {
  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== CONFIGURAÇÕES ====================

export class UpdateAlexisSettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  assistantName?: string;

  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @IsOptional()
  @IsString()
  personality?: 'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL';

  @IsOptional()
  @IsString()
  language?: string;

  // Compliance
  @IsOptional()
  @IsString()
  complianceLevel?: 'STRICT' | 'MODERATE' | 'RELAXED';

  @IsOptional()
  @IsBoolean()
  anvisaWarningsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  lgpdConsentRequired?: boolean;

  @IsOptional()
  @IsNumber()
  dataRetentionDays?: number;

  // Controle de IA
  @IsOptional()
  @IsBoolean()
  autoResponseEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  maxResponsesPerMinute?: number;

  @IsOptional()
  @IsArray()
  humanTakeoverKeywords?: string[];

  @IsOptional()
  @IsArray()
  aiResumeKeywords?: string[];

  // Horários
  @IsOptional()
  @IsBoolean()
  operatingHoursEnabled?: boolean;

  @IsOptional()
  @IsString()
  operatingHoursStart?: string;

  @IsOptional()
  @IsString()
  operatingHoursEnd?: string;

  @IsOptional()
  @IsString()
  outOfHoursMessage?: string;

  // Integrações
  @IsOptional()
  @IsString()
  whatsappIntegrationId?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

// ==================== KEYWORDS ====================

export class CreateBlockedKeywordDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  keyword!: string;

  @IsString()
  category!: 'ANVISA' | 'LGPD' | 'PROFANITY' | 'CUSTOM';

  @IsString()
  violationType!: string;

  @IsOptional()
  @IsString()
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsOptional()
  @IsString()
  action?: 'BLOCK' | 'WARN' | 'FLAG' | 'SANITIZE';

  @IsOptional()
  @IsString()
  replacement?: string;

  @IsOptional()
  @IsString()
  warningMessage?: string;
}

// ==================== TEMPLATES ====================

export class CreateResponseTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  category!: 'GREETING' | 'SCHEDULING' | 'SERVICES' | 'PRICES' | 'HOURS' | 'FAQ' | 'GOODBYE';

  @IsOptional()
  @IsArray()
  triggerKeywords?: string[];

  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsArray()
  variables?: string[];
}

export class UpdateResponseTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  triggerKeywords?: string[];

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== SESSÕES ====================

export class EndSessionDto {
  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}

// ==================== WEBHOOK ====================

export class WhatsAppWebhookDto {
  object!: string;
  entry!: any[];
}

// ==================== RESPONSES ====================

export interface AlexisStatusResponse {
  isEnabled: boolean;
  isConfigured: boolean;
  model: string;
  assistantName: string;
  complianceLevel: string;
  features: {
    whatsapp: boolean;
    autoResponse: boolean;
    lgpdConsent: boolean;
    anvisaWarnings: boolean;
  };
}

export interface SessionSummary {
  id: string;
  clientPhone: string;
  clientName: string | null;
  status: string;
  controlMode: string;
  messageCount: number;
  lastMessageAt: Date | null;
  startedAt: Date;
}

export interface ConversationMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  respondedBy: 'AI' | 'HUMAN';
  complianceRisk: string;
  createdAt: Date;
}

export interface ComplianceStats {
  totalBlocks: number;
  totalFlags: number;
  byCategory: {
    ANVISA: number;
    LGPD: number;
    PROFANITY: number;
    CUSTOM: number;
  };
  recentViolations: {
    id: string;
    type: string;
    riskLevel: string;
    createdAt: Date;
  }[];
}

export interface MetricsSummary {
  period: string;
  totalSessions: number;
  totalMessages: number;
  aiResponses: number;
  humanResponses: number;
  humanTakeovers: number;
  avgResponseTime: number | null;
  complianceBlocks: number;
  appointmentsBooked: number;
}

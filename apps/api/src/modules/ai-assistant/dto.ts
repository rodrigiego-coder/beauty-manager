import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  message!: string;
}

export class UpdateAISettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  assistantName?: string;

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsBoolean()
  dailyBriefingEnabled?: boolean;

  @IsOptional()
  @IsString()
  dailyBriefingTime?: string;

  @IsOptional()
  @IsBoolean()
  alertsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  tipsEnabled?: boolean;
}

export class CreateClientNoteDto {
  @IsString()
  clientId!: string;

  @IsString()
  noteType!: string; // PREFERENCE, ALLERGY, PERSONALITY, IMPORTANT

  @IsString()
  content!: string;
}

export interface BriefingResponse {
  message: string;
  alerts: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  tips: string[];
}

export interface ChatResponse {
  response: string;
}

export interface InsightResponse {
  insight: string;
}

export interface AISettingsResponse {
  id: string;
  salonId: string;
  isEnabled: boolean;
  assistantName: string;
  personality: string;
  dailyBriefingEnabled: boolean;
  dailyBriefingTime: string;
  alertsEnabled: boolean;
  tipsEnabled: boolean;
}

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

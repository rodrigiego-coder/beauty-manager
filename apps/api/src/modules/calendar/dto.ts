import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID, IsArray } from 'class-validator';

// ==================== ENUMS ====================

export enum SyncDirection {
  GOOGLE_TO_APP = 'GOOGLE_TO_APP',
  APP_TO_GOOGLE = 'APP_TO_GOOGLE',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
  DISCONNECTED = 'DISCONNECTED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
}

export enum ConflictStatus {
  PENDING = 'PENDING',
  RESOLVED_KEEP_LOCAL = 'RESOLVED_KEEP_LOCAL',
  RESOLVED_KEEP_GOOGLE = 'RESOLVED_KEEP_GOOGLE',
  RESOLVED_MERGE = 'RESOLVED_MERGE',
  IGNORED = 'IGNORED',
}

export enum ConflictResolution {
  KEEP_LOCAL = 'KEEP_LOCAL',
  KEEP_GOOGLE = 'KEEP_GOOGLE',
  MERGE = 'MERGE',
  IGNORE = 'IGNORE',
}

// ==================== DTOs ====================

export class ConnectGoogleCalendarDto {
  @IsUUID()
  @IsOptional()
  professionalId?: string; // Se não informado, usa o usuário atual

  @IsString()
  @IsOptional()
  calendarId?: string; // Se não informado, usa 'primary'

  @IsEnum(SyncDirection)
  @IsOptional()
  syncDirection?: SyncDirection;
}

export class GoogleOAuthCallbackDto {
  @IsString()
  code!: string;

  @IsString()
  state!: string; // Contém salonId, professionalId, etc.
}

export class UpdateIntegrationSettingsDto {
  @IsString()
  @IsOptional()
  calendarId?: string;

  @IsEnum(SyncDirection)
  @IsOptional()
  syncDirection?: SyncDirection;

  @IsBoolean()
  @IsOptional()
  syncEnabled?: boolean;
}

export class ManualSyncDto {
  @IsUUID()
  @IsOptional()
  professionalId?: string;

  @IsBoolean()
  @IsOptional()
  fullSync?: boolean; // Se true, faz sync completo. Se false, incremental
}

export class ResolveConflictDto {
  @IsUUID()
  conflictId!: string;

  @IsEnum(ConflictResolution)
  resolution!: ConflictResolution;
}

export class BulkResolveConflictsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  conflictIds!: string[];

  @IsEnum(ConflictResolution)
  resolution!: ConflictResolution;
}

// ==================== INTERFACES ====================

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string; // Para eventos de dia inteiro
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status: string;
  created: string;
  updated: string;
  colorId?: string;
  location?: string;
  recurrence?: string[];
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface IntegrationStatusResponse {
  connected: boolean;
  professionalId?: string;
  googleEmail?: string;
  calendarId?: string;
  syncDirection?: SyncDirection;
  syncEnabled?: boolean;
  lastSyncAt?: Date;
  status?: IntegrationStatus;
  errorMessage?: string;
}

export interface SyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsFound: number;
  errors: string[];
}

export interface ConflictDetails {
  id: string;
  conflictType: string;
  localEvent?: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  };
  googleEvent?: {
    id: string;
    summary: string;
    start: string;
    end: string;
  };
  status: ConflictStatus;
  createdAt: Date;
}

export interface SyncLogDetails {
  id: string;
  syncType: string;
  direction: SyncDirection;
  status: string;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsFound: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

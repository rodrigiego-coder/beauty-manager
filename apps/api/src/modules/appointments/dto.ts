import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, Min, Max } from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum LocationType {
  SALON = 'SALON',
  HOME = 'HOME',
  ONLINE = 'ONLINE',
}

export enum Priority {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  URGENT = 'URGENT',
}

export enum AppointmentSource {
  MANUAL = 'MANUAL',
  ONLINE = 'ONLINE',
  WHATSAPP = 'WHATSAPP',
  APP = 'APP',
}

export enum BlockType {
  DAY_OFF = 'DAY_OFF',
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  PERSONAL = 'PERSONAL',
  LUNCH = 'LUNCH',
  TRAINING = 'TRAINING',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

export enum BlockStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum RecurringPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

// ==================== APPOINTMENT DTOs ====================

export class CreateAppointmentDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsUUID()
  professionalId!: string;

  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @IsString()
  service!: string;

  @IsString()
  date!: string;

  @IsString()
  time!: string;

  @IsNumber()
  @Min(5)
  @Max(480)
  duration!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferBefore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferAfter?: number;

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @IsOptional()
  @IsString()
  service?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferBefore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferAfter?: number;

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class RescheduleAppointmentDto {
  @IsString()
  date!: string;

  @IsString()
  time!: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;
}

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CheckAvailabilityDto {
  @IsUUID()
  professionalId!: string;

  @IsString()
  date!: string;

  @IsString()
  startTime!: string;

  @IsNumber()
  @Min(5)
  duration!: number;
}

// ==================== BLOCK DTOs ====================

export class CreateBlockDto {
  @IsUUID()
  professionalId!: string;

  @IsEnum(BlockType)
  type!: BlockType;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @IsOptional()
  @IsArray()
  recurringDays?: number[];

  @IsOptional()
  @IsString()
  recurringEndDate?: string;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class UpdateBlockDto {
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @IsOptional()
  @IsArray()
  recurringDays?: number[];

  @IsOptional()
  @IsString()
  recurringEndDate?: string;
}

export class RejectBlockDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== WORKING HOURS DTOs ====================

export class WorkingHourDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  breakStartTime?: string;

  @IsOptional()
  @IsString()
  breakEndTime?: string;

  @IsBoolean()
  isActive!: boolean;
}

export class SetWorkingHoursDto {
  @IsUUID()
  professionalId!: string;

  @IsArray()
  hours!: WorkingHourDto[];
}

export class UpdateWorkingHourDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  breakStartTime?: string;

  @IsOptional()
  @IsString()
  breakEndTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== FILTER DTOs ====================

export class AppointmentFiltersDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class BlockFiltersDto {
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsEnum(BlockStatus)
  status?: BlockStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

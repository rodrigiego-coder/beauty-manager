import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Nome do cliente (para cliente avulso)', example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Telefone do cliente', example: '11999998888' })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiPropertyOptional({ description: 'Email do cliente', example: 'maria@exemplo.com' })
  @IsOptional()
  @IsString()
  clientEmail?: string;

  @ApiProperty({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  professionalId!: string;

  @ApiPropertyOptional({ description: 'ID do serviço', example: 1 })
  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @ApiProperty({ description: 'Nome do serviço', example: 'Corte Feminino' })
  @IsString()
  service!: string;

  @ApiProperty({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2026-01-20' })
  @IsString()
  date!: string;

  @ApiProperty({ description: 'Horário do agendamento (HH:mm)', example: '14:30' })
  @IsString()
  time!: string;

  @ApiProperty({ description: 'Duração em minutos', example: 60, minimum: 5, maximum: 480 })
  @IsNumber()
  @Min(5)
  @Max(480)
  duration!: number;

  @ApiPropertyOptional({ description: 'Buffer antes do atendimento (minutos)', example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferBefore?: number;

  @ApiPropertyOptional({ description: 'Buffer após o atendimento (minutos)', example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferAfter?: number;

  @ApiPropertyOptional({ description: 'Tipo de local', enum: LocationType, example: 'SALON' })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional({ description: 'Endereço (para atendimento externo)', example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Prioridade do agendamento', enum: Priority, example: 'NORMAL' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Cor para exibição na agenda', example: '#FF5733' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Preço do serviço', example: '150.00' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Observações visíveis ao cliente', example: 'Trazer referência de corte' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Notas internas (não visíveis ao cliente)', example: 'Cliente prefere horários pela manhã' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Origem do agendamento', enum: AppointmentSource, example: 'MANUAL' })
  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ description: 'ID do cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Nome do cliente', example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Telefone do cliente', example: '11999998888' })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiPropertyOptional({ description: 'Email do cliente', example: 'maria@exemplo.com' })
  @IsOptional()
  @IsString()
  clientEmail?: string;

  @ApiPropertyOptional({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @ApiPropertyOptional({ description: 'ID do serviço', example: 1 })
  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @ApiPropertyOptional({ description: 'Nome do serviço', example: 'Corte Feminino' })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({ description: 'Data do agendamento (YYYY-MM-DD)', example: '2026-01-20' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'Horário do agendamento (HH:mm)', example: '14:30' })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional({ description: 'Duração em minutos', example: 60, minimum: 5, maximum: 480 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  duration?: number;

  @ApiPropertyOptional({ description: 'Buffer antes do atendimento (minutos)', example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferBefore?: number;

  @ApiPropertyOptional({ description: 'Buffer após o atendimento (minutos)', example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferAfter?: number;

  @ApiPropertyOptional({ description: 'Tipo de local', enum: LocationType, example: 'SALON' })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional({ description: 'Endereço (para atendimento externo)', example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Prioridade do agendamento', enum: Priority, example: 'NORMAL' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Cor para exibição na agenda', example: '#FF5733' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Preço do serviço', example: '150.00' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Observações visíveis ao cliente', example: 'Trazer referência de corte' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Notas internas (não visíveis ao cliente)', example: 'Cliente prefere horários pela manhã' })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class RescheduleAppointmentDto {
  @ApiProperty({ description: 'Nova data do agendamento (YYYY-MM-DD)', example: '2026-01-25' })
  @IsString()
  date!: string;

  @ApiProperty({ description: 'Novo horário do agendamento (HH:mm)', example: '10:00' })
  @IsString()
  time!: string;

  @ApiPropertyOptional({ description: 'Novo profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  professionalId?: string;
}

export class CancelAppointmentDto {
  @ApiPropertyOptional({ description: 'Motivo do cancelamento', example: 'Cliente solicitou reagendamento' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CheckAvailabilityDto {
  @ApiProperty({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  professionalId!: string;

  @ApiProperty({ description: 'Data para verificar disponibilidade (YYYY-MM-DD)', example: '2026-01-20' })
  @IsString()
  date!: string;

  @ApiProperty({ description: 'Horário inicial (HH:mm)', example: '14:00' })
  @IsString()
  startTime!: string;

  @ApiProperty({ description: 'Duração desejada em minutos', example: 60, minimum: 5 })
  @IsNumber()
  @Min(5)
  duration!: number;
}

// ==================== BLOCK DTOs ====================

export class CreateBlockDto {
  @ApiProperty({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  professionalId!: string;

  @ApiProperty({ description: 'Tipo de bloqueio', enum: BlockType, example: 'VACATION' })
  @IsEnum(BlockType)
  type!: BlockType;

  @ApiProperty({ description: 'Título do bloqueio', example: 'Férias de Janeiro' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Descrição adicional', example: 'Viagem com a família' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Data de início (YYYY-MM-DD)', example: '2026-01-15' })
  @IsString()
  startDate!: string;

  @ApiProperty({ description: 'Data de término (YYYY-MM-DD)', example: '2026-01-30' })
  @IsString()
  endDate!: string;

  @ApiPropertyOptional({ description: 'Horário de início (HH:mm)', example: '08:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Horário de término (HH:mm)', example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Bloqueio de dia inteiro', example: true })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiPropertyOptional({ description: 'Bloqueio recorrente', example: false })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @ApiPropertyOptional({ description: 'Padrão de recorrência', enum: RecurringPattern, example: 'WEEKLY' })
  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ description: 'Dias da semana (0=Dom, 6=Sáb)', example: [1, 3, 5], type: [Number] })
  @IsOptional()
  @IsArray()
  recurringDays?: number[];

  @ApiPropertyOptional({ description: 'Data final da recorrência (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsString()
  recurringEndDate?: string;

  @ApiPropertyOptional({ description: 'Requer aprovação do gerente', example: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class UpdateBlockDto {
  @ApiPropertyOptional({ description: 'Tipo de bloqueio', enum: BlockType, example: 'VACATION' })
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @ApiPropertyOptional({ description: 'Título do bloqueio', example: 'Férias de Janeiro' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição adicional', example: 'Viagem com a família' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Data de início (YYYY-MM-DD)', example: '2026-01-15' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data de término (YYYY-MM-DD)', example: '2026-01-30' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Horário de início (HH:mm)', example: '08:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Horário de término (HH:mm)', example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Bloqueio de dia inteiro', example: true })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiPropertyOptional({ description: 'Bloqueio recorrente', example: false })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @ApiPropertyOptional({ description: 'Padrão de recorrência', enum: RecurringPattern, example: 'WEEKLY' })
  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ description: 'Dias da semana (0=Dom, 6=Sáb)', example: [1, 3, 5], type: [Number] })
  @IsOptional()
  @IsArray()
  recurringDays?: number[];

  @ApiPropertyOptional({ description: 'Data final da recorrência (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsString()
  recurringEndDate?: string;
}

export class RejectBlockDto {
  @ApiPropertyOptional({ description: 'Motivo da rejeição', example: 'Período já reservado para outro profissional' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== WORKING HOURS DTOs ====================

export class WorkingHourDto {
  @ApiProperty({ description: 'Dia da semana (0=Dom, 6=Sáb)', example: 1, minimum: 0, maximum: 6 })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ description: 'Horário de início (HH:mm)', example: '09:00' })
  @IsString()
  startTime!: string;

  @ApiProperty({ description: 'Horário de término (HH:mm)', example: '18:00' })
  @IsString()
  endTime!: string;

  @ApiPropertyOptional({ description: 'Início do intervalo (HH:mm)', example: '12:00' })
  @IsOptional()
  @IsString()
  breakStartTime?: string;

  @ApiPropertyOptional({ description: 'Fim do intervalo (HH:mm)', example: '13:00' })
  @IsOptional()
  @IsString()
  breakEndTime?: string;

  @ApiProperty({ description: 'Dia de trabalho ativo', example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class SetWorkingHoursDto {
  @ApiProperty({ description: 'ID do profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  professionalId!: string;

  @ApiProperty({ description: 'Lista de horários de trabalho', type: [WorkingHourDto] })
  @IsArray()
  hours!: WorkingHourDto[];
}

export class UpdateWorkingHourDto {
  @ApiPropertyOptional({ description: 'Horário de início (HH:mm)', example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Horário de término (HH:mm)', example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Início do intervalo (HH:mm)', example: '12:00' })
  @IsOptional()
  @IsString()
  breakStartTime?: string;

  @ApiPropertyOptional({ description: 'Fim do intervalo (HH:mm)', example: '13:00' })
  @IsOptional()
  @IsString()
  breakEndTime?: string;

  @ApiPropertyOptional({ description: 'Dia de trabalho ativo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== FILTER DTOs ====================

export class AppointmentFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por data específica (YYYY-MM-DD)', example: '2026-01-20' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'Filtrar por profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: AppointmentStatus, example: 'SCHEDULED' })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Filtrar por cliente (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Data inicial do período (YYYY-MM-DD)', example: '2026-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final do período (YYYY-MM-DD)', example: '2026-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class BlockFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por profissional (UUID)', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: BlockStatus, example: 'APPROVED' })
  @IsOptional()
  @IsEnum(BlockStatus)
  status?: BlockStatus;

  @ApiPropertyOptional({ description: 'Data inicial do período (YYYY-MM-DD)', example: '2026-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final do período (YYYY-MM-DD)', example: '2026-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

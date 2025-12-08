import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  Min,
  Matches,
} from 'class-validator';

// Enum de status
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// DTO para criar agendamento
export class CreateAppointmentDto {
  @IsUUID('4', { message: 'SalonId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'SalonId é obrigatório' })
  salonId!: string;

  @IsUUID('4', { message: 'ClientId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ClientId é obrigatório' })
  clientId!: string;

  @IsUUID('4', { message: 'ProfessionalId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ProfessionalId é obrigatório' })
  professionalId!: string;

  @IsString({ message: 'Serviço deve ser uma string' })
  @IsNotEmpty({ message: 'Serviço é obrigatório' })
  service!: string;

  @IsString({ message: 'Data deve ser uma string' })
  @IsNotEmpty({ message: 'Data é obrigatória' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  date!: string;

  @IsString({ message: 'Horário deve ser uma string' })
  @IsNotEmpty({ message: 'Horário é obrigatório' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Horário deve estar no formato HH:MM' })
  time!: string;

  @IsNumber({}, { message: 'Duração deve ser um número' })
  @Min(15, { message: 'Duração mínima é de 15 minutos' })
  duration!: number;

  @IsNumber({}, { message: 'Preço deve ser um número' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  price!: number;

  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}

// DTO para atualizar agendamento
export class UpdateAppointmentDto {
  @IsUUID('4', { message: 'ProfessionalId deve ser um UUID válido' })
  @IsOptional()
  professionalId?: string;

  @IsString({ message: 'Serviço deve ser uma string' })
  @IsOptional()
  service?: string;

  @IsString({ message: 'Data deve ser uma string' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  date?: string;

  @IsString({ message: 'Horário deve ser uma string' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Horário deve estar no formato HH:MM' })
  time?: string;

  @IsNumber({}, { message: 'Duração deve ser um número' })
  @Min(15, { message: 'Duração mínima é de 15 minutos' })
  @IsOptional()
  duration?: number;

  @IsNumber({}, { message: 'Preço deve ser um número' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  @IsOptional()
  price?: number;

  @IsEnum(AppointmentStatus, { message: 'Status deve ser pending, confirmed, completed ou cancelled' })
  @IsOptional()
  status?: AppointmentStatus;

  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}
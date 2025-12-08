import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  MinLength,
  Min,
  Max,
  IsObject,
} from 'class-validator';

// Enum de roles
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  STYLIST = 'STYLIST',
}

// DTO para criar usuário
export class CreateUserDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'SalonId deve ser uma string' })
  @IsNotEmpty({ message: 'SalonId é obrigatório' })
  salonId!: string;

  @IsNumber({}, { message: 'Taxa de comissão deve ser um número' })
  @Min(0, { message: 'Taxa de comissão deve ser no mínimo 0' })
  @Max(1, { message: 'Taxa de comissão deve ser no máximo 1' })
  @IsOptional()
  commissionRate?: number;

  @IsString({ message: 'Especialidades deve ser uma string' })
  @IsOptional()
  specialties?: string;

  @IsObject({ message: 'Horário de trabalho deve ser um objeto' })
  @IsOptional()
  workSchedule?: Record<string, string>;
}

// DTO para atualizar usuário
export class UpdateUserDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' })
  @IsOptional()
  role?: UserRole;

  @IsNumber({}, { message: 'Taxa de comissão deve ser um número' })
  @Min(0, { message: 'Taxa de comissão deve ser no mínimo 0' })
  @Max(1, { message: 'Taxa de comissão deve ser no máximo 1' })
  @IsOptional()
  commissionRate?: number;

  @IsString({ message: 'Especialidades deve ser uma string' })
  @IsOptional()
  specialties?: string;

  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;
}

// DTO para atualizar horário de trabalho
export class UpdateWorkScheduleDto {
  @IsString({ message: 'Horário de segunda deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  seg?: string;

  @IsString({ message: 'Horário de terça deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  ter?: string;

  @IsString({ message: 'Horário de quarta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  qua?: string;

  @IsString({ message: 'Horário de quinta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  qui?: string;

  @IsString({ message: 'Horário de sexta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  sex?: string;

  @IsString({ message: 'Horário de sábado deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  sab?: string;

  @IsString({ message: 'Horário de domingo deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  dom?: string;
}
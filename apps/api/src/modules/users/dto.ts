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

// DTO para criar usuario
export class CreateUserDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  name!: string;

  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'SalonId deve ser uma string' })
  @IsNotEmpty({ message: 'SalonId e obrigatorio' })
  salonId!: string;

  @IsNumber({}, { message: 'Taxa de comissao deve ser um numero' })
  @Min(0, { message: 'Taxa de comissao deve ser no minimo 0' })
  @Max(1, { message: 'Taxa de comissao deve ser no maximo 1' })
  @IsOptional()
  commissionRate?: number;

  @IsString({ message: 'Especialidades deve ser uma string' })
  @IsOptional()
  specialties?: string;

  @IsObject({ message: 'Horario de trabalho deve ser um objeto' })
  @IsOptional()
  workSchedule?: Record<string, string>;
}

// DTO para atualizar usuario
export class UpdateUserDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' })
  @IsOptional()
  role?: UserRole;

  @IsNumber({}, { message: 'Taxa de comissao deve ser um numero' })
  @Min(0, { message: 'Taxa de comissao deve ser no minimo 0' })
  @Max(1, { message: 'Taxa de comissao deve ser no maximo 1' })
  @IsOptional()
  commissionRate?: number;

  @IsString({ message: 'Especialidades deve ser uma string' })
  @IsOptional()
  specialties?: string;

  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;
}

// DTO para atualizar horario de trabalho
export class UpdateWorkScheduleDto {
  @IsString({ message: 'Horario de segunda deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  seg?: string;

  @IsString({ message: 'Horario de terca deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  ter?: string;

  @IsString({ message: 'Horario de quarta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  qua?: string;

  @IsString({ message: 'Horario de quinta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  qui?: string;

  @IsString({ message: 'Horario de sexta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  sex?: string;

  @IsString({ message: 'Horario de sabado deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  sab?: string;

  @IsString({ message: 'Horario de domingo deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  dom?: string;
}

// DTO para atualizar perfil do usuario logado
export class UpdateProfileDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;
}

// DTO para alterar senha
export class ChangePasswordDto {
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual e obrigatoria' })
  currentPassword!: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha e obrigatoria' })
  @MinLength(6, { message: 'Nova senha deve ter no minimo 6 caracteres' })
  newPassword!: string;
}
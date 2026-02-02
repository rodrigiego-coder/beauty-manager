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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enum de roles
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  STYLIST = 'STYLIST',
}

// DTO para criar usuario
export class CreateUserDto {
  @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  name!: string;

  @ApiPropertyOptional({ description: 'Email do usuário', example: 'joao@exemplo.com' })
  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Senha (mínimo 6 caracteres)', example: 'senha123', minLength: 6 })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: 'Telefone do usuário', example: '11999998888' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Papel do usuário no sistema', enum: UserRole, example: 'STYLIST' })
  @IsEnum(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'ID do salão (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString({ message: 'SalonId deve ser uma string' })
  @IsNotEmpty({ message: 'SalonId e obrigatorio' })
  salonId!: string;

  @ApiPropertyOptional({ description: 'Taxa de comissão (0 a 1)', example: 0.3, minimum: 0, maximum: 1 })
  @IsNumber({}, { message: 'Taxa de comissao deve ser um numero' })
  @Min(0, { message: 'Taxa de comissao deve ser no minimo 0' })
  @Max(1, { message: 'Taxa de comissao deve ser no maximo 1' })
  @IsOptional()
  commissionRate?: number;

  @ApiPropertyOptional({ description: 'Especialidades do profissional', example: 'Corte, Coloração' })
  @IsString({ message: 'Especialidades deve ser uma string' })
  @IsOptional()
  specialties?: string;

  @ApiPropertyOptional({ description: 'Horário de trabalho por dia da semana', example: { seg: '09:00-18:00', ter: '09:00-18:00' } })
  @IsObject({ message: 'Horario de trabalho deve ser um objeto' })
  @IsOptional()
  workSchedule?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Enviar link de criação de senha via WhatsApp (default: true se sem senha)', example: true })
  @IsBoolean({ message: 'sendPasswordLink deve ser um booleano' })
  @IsOptional()
  sendPasswordLink?: boolean;

  @ApiPropertyOptional({ description: 'Se o usuário é um profissional que atende clientes', example: false })
  @IsBoolean({ message: 'isProfessional deve ser um booleano' })
  @IsOptional()
  isProfessional?: boolean;
}

// DTO para atualizar usuario
export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nome do usuário', example: 'João Silva' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Email do usuário', example: 'joao@exemplo.com' })
  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone do usuário', example: '11999998888' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Papel do usuário no sistema', enum: UserRole, example: 'STYLIST' })
  @IsEnum(UserRole, { message: 'Role deve ser OWNER, MANAGER, RECEPTIONIST ou STYLIST' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Taxa de comissão (0 a 1)', example: 0.3, minimum: 0, maximum: 1 })
  @IsNumber({}, { message: 'Taxa de comissao deve ser um numero' })
  @Min(0, { message: 'Taxa de comissao deve ser no minimo 0' })
  @Max(1, { message: 'Taxa de comissao deve ser no maximo 1' })
  @IsOptional()
  commissionRate?: number;

  @ApiPropertyOptional({ description: 'Especialidades do profissional', example: 'Corte, Coloração' })
  @IsString({ message: 'Especialidades deve ser uma string' })
  @IsOptional()
  specialties?: string;

  @ApiPropertyOptional({ description: 'Usuário ativo', example: true })
  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Se o usuário é um profissional que atende clientes', example: false })
  @IsBoolean({ message: 'isProfessional deve ser um booleano' })
  @IsOptional()
  isProfessional?: boolean;
}

// DTO para atualizar horario de trabalho
export class UpdateWorkScheduleDto {
  @ApiPropertyOptional({ description: 'Horário de segunda-feira (HH:MM-HH:MM)', example: '09:00-18:00' })
  @IsString({ message: 'Horario de segunda deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  seg?: string;

  @ApiPropertyOptional({ description: 'Horário de terça-feira (HH:MM-HH:MM)', example: '09:00-18:00' })
  @IsString({ message: 'Horario de terca deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  ter?: string;

  @ApiPropertyOptional({ description: 'Horário de quarta-feira (HH:MM-HH:MM)', example: '09:00-18:00' })
  @IsString({ message: 'Horario de quarta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  qua?: string;

  @ApiPropertyOptional({ description: 'Horário de quinta-feira (HH:MM-HH:MM)', example: '09:00-18:00' })
  @IsString({ message: 'Horario de quinta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  qui?: string;

  @ApiPropertyOptional({ description: 'Horário de sexta-feira (HH:MM-HH:MM)', example: '09:00-18:00' })
  @IsString({ message: 'Horario de sexta deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  sex?: string;

  @ApiPropertyOptional({ description: 'Horário de sábado (HH:MM-HH:MM)', example: '09:00-14:00' })
  @IsString({ message: 'Horario de sabado deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  sab?: string;

  @ApiPropertyOptional({ description: 'Horário de domingo (HH:MM-HH:MM)', example: null })
  @IsString({ message: 'Horario de domingo deve ser no formato HH:MM-HH:MM' })
  @IsOptional()
  dom?: string;
}

// DTO para atualizar perfil do usuario logado
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nome do usuário', example: 'João Silva' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Email do usuário', example: 'joao@exemplo.com' })
  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone do usuário', example: '11999998888' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;
}

// DTO para alterar senha
export class ChangePasswordDto {
  @ApiProperty({ description: 'Senha atual do usuário', example: 'senhaAtual123' })
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual e obrigatoria' })
  currentPassword!: string;

  @ApiProperty({ description: 'Nova senha (mínimo 6 caracteres)', example: 'novaSenha456', minLength: 6 })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha e obrigatoria' })
  @MinLength(6, { message: 'Nova senha deve ter no minimo 6 caracteres' })
  newPassword!: string;
}
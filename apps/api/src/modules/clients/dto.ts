import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Validador customizado para nome completo (mínimo 2 palavras)
 */
@ValidatorConstraint({ name: 'isFullName', async: false })
export class IsFullNameConstraint implements ValidatorConstraintInterface {
  validate(name: string, _args: ValidationArguments): boolean {
    if (!name || typeof name !== 'string') return false;

    // Remove espaços extras e divide por espaços
    const words = name.trim().split(/\s+/).filter(word => word.length > 0);

    // Deve ter pelo menos 2 palavras
    return words.length >= 2;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Nome completo é obrigatório (nome e sobrenome)';
  }
}

/**
 * Validador customizado para telefone brasileiro (10-11 dígitos)
 */
@ValidatorConstraint({ name: 'isBrazilianPhone', async: false })
export class IsBrazilianPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: string, _args: ValidationArguments): boolean {
    if (!phone || typeof phone !== 'string') return false;

    // Remove tudo que não é dígito
    const digits = phone.replace(/\D/g, '');

    // Telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular com 9)
    return digits.length >= 10 && digits.length <= 11;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos)';
  }
}

/**
 * DTO para criar cliente
 */
export class CreateClientDto {
  @ApiProperty({ description: 'Nome completo do cliente (nome e sobrenome)', example: 'Maria Silva Santos', minLength: 3 })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @Validate(IsFullNameConstraint)
  name!: string;

  @ApiProperty({ description: 'Telefone brasileiro (DDD + número)', example: '11999998888' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Validate(IsBrazilianPhoneConstraint)
  phone!: string;

  @ApiPropertyOptional({ description: 'Email do cliente', example: 'maria@exemplo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Notas técnicas (visíveis apenas para profissionais)', example: 'Alergia a amônia, preferir coloração sem' })
  @IsString({ message: 'Notas técnicas deve ser uma string' })
  @IsOptional()
  technicalNotes?: string;

  @ApiPropertyOptional({ description: 'Preferências do cliente', example: 'Prefere atendimento pela manhã, gosta de café' })
  @IsString({ message: 'Preferências deve ser uma string' })
  @IsOptional()
  preferences?: string;

  @ApiPropertyOptional({ description: 'Ativar assistente IA para este cliente', example: true })
  @IsBoolean({ message: 'aiActive deve ser um booleano' })
  @IsOptional()
  aiActive?: boolean;
}

/**
 * DTO para atualizar cliente
 */
export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'Nome completo do cliente (nome e sobrenome)', example: 'Maria Silva Santos', minLength: 3 })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @Validate(IsFullNameConstraint)
  name?: string;

  @ApiPropertyOptional({ description: 'Telefone brasileiro (DDD + número)', example: '11999998888' })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  @Validate(IsBrazilianPhoneConstraint)
  phone?: string;

  @ApiPropertyOptional({ description: 'Email do cliente', example: 'maria@exemplo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Notas técnicas (visíveis apenas para profissionais)', example: 'Alergia a amônia, preferir coloração sem' })
  @IsString({ message: 'Notas técnicas deve ser uma string' })
  @IsOptional()
  technicalNotes?: string;

  @ApiPropertyOptional({ description: 'Preferências do cliente', example: 'Prefere atendimento pela manhã, gosta de café' })
  @IsString({ message: 'Preferências deve ser uma string' })
  @IsOptional()
  preferences?: string;

  @ApiPropertyOptional({ description: 'Ativar assistente IA para este cliente', example: true })
  @IsBoolean({ message: 'aiActive deve ser um booleano' })
  @IsOptional()
  aiActive?: boolean;
}
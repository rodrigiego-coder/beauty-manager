import { IsEmail, IsString, IsNotEmpty, MinLength, IsUUID, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para login
 */
export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string;
}

/**
 * DTO para refresh token
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token JWT para renovar o access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken!: string;
}

/**
 * DTO para logout
 */
export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token JWT a ser invalidado',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken!: string;
}

/**
 * DTO para criar senha via token
 */
export class CreatePasswordDto {
  @ApiProperty({
    description: 'Token de criação de senha recebido via WhatsApp',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token!: string;

  @ApiProperty({
    description: 'Nova senha (mínimo 6 caracteres)',
    example: 'minhaSenha123',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string;
}

/**
 * DTO para signup (cadastro público)
 */
export class SignupDto {
  @ApiProperty({
    description: 'Nome do salão/estabelecimento',
    example: 'Studio Maria Beleza',
  })
  @IsString({ message: 'Nome do salão deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do salão é obrigatório' })
  salonName!: string;

  @ApiProperty({
    description: 'Nome completo do proprietário',
    example: 'Maria Silva',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  ownerName!: string;

  @ApiProperty({
    description: 'Email do proprietário',
    example: 'maria@exemplo.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({
    description: 'Telefone com DDD (apenas números)',
    example: '11999999999',
  })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })
  phone!: string;

  @ApiProperty({
    description: 'Senha (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @ApiPropertyOptional({
    description: 'ID do plano escolhido (UUID). Se não informado, usa o plano Professional.',
    example: 'eeeeeee1-eeee-eeee-eeee-eeeeeeeeeeee',
  })
  @IsUUID('4', { message: 'planId deve ser um UUID válido' })
  @IsOptional()
  planId?: string;
}
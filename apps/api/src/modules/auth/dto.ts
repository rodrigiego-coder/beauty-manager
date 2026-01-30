import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
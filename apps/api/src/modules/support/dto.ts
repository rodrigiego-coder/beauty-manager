import { IsString, IsNotEmpty, IsUUID, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para criar uma sessão de suporte delegado
 */
export class CreateSupportSessionDto {
  @IsUUID('all', { message: 'salonId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'salonId é obrigatório' })
  salonId!: string;

  @IsString({ message: 'reason deve ser uma string' })
  @IsNotEmpty({ message: 'Motivo é obrigatório para compliance' })
  @MinLength(10, { message: 'Motivo deve ter pelo menos 10 caracteres' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  reason!: string;
}

/**
 * DTO para consumir um token de suporte
 */
export class ConsumeSupportTokenDto {
  @IsString({ message: 'token deve ser uma string' })
  @IsNotEmpty({ message: 'token é obrigatório' })
  @MinLength(64, { message: 'Token inválido' })
  @MaxLength(64, { message: 'Token inválido' })
  token!: string;
}

/**
 * Interface para o payload JWT de suporte delegado
 */
export interface SupportTokenPayload {
  sub: string;
  id: string;
  email: string;
  role: 'SUPER_ADMIN';
  salonId: string | null;
  actingAsSalonId: string;
  supportSessionId: string;
  type: 'access';
}

/**
 * Interface para resposta de criação de sessão
 */
export interface CreateSessionResponse {
  sessionId: string;
  token: string;
  expiresAt: Date;
  salonName: string;
  salonId: string;
}

/**
 * Interface para resposta de consumo de token
 */
export interface ConsumeTokenResponse {
  accessToken: string;
  expiresIn: number;
  salonId: string;
  salonName: string;
}

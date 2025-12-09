import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

/**
 * DTO para criar cliente
 */
export class CreateClientDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  phone!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Notas técnicas deve ser uma string' })
  @IsOptional()
  technicalNotes?: string;

  @IsString({ message: 'Preferências deve ser uma string' })
  @IsOptional()
  preferences?: string;

  @IsBoolean({ message: 'aiActive deve ser um booleano' })
  @IsOptional()
  aiActive?: boolean;
}

/**
 * DTO para atualizar cliente
 */
export class UpdateClientDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Notas técnicas deve ser uma string' })
  @IsOptional()
  technicalNotes?: string;

  @IsString({ message: 'Preferências deve ser uma string' })
  @IsOptional()
  preferences?: string;

  @IsBoolean({ message: 'aiActive deve ser um booleano' })
  @IsOptional()
  aiActive?: boolean;
}
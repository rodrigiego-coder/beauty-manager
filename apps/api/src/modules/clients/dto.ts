import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

// DTO para criar cliente
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

  @IsUUID('4', { message: 'SalonId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'SalonId é obrigatório' })
  salonId!: string;

  @IsBoolean({ message: 'aiActive deve ser um booleano' })
  @IsOptional()
  aiActive?: boolean;

  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}

// DTO para atualizar cliente
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

  @IsBoolean({ message: 'aiActive deve ser um booleano' })
  @IsOptional()
  aiActive?: boolean;

  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;

  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;
}
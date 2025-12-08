import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';

// DTO para criar produto
export class CreateProductDto {
  @IsUUID('4', { message: 'SalonId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'SalonId é obrigatório' })
  salonId!: string;

  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  @IsNumber({}, { message: 'Preço de custo deve ser um número' })
  @Min(0, { message: 'Preço de custo não pode ser negativo' })
  @IsNotEmpty({ message: 'Preço de custo é obrigatório' })
  costPrice!: number;

  @IsNumber({}, { message: 'Preço de venda deve ser um número' })
  @Min(0, { message: 'Preço de venda não pode ser negativo' })
  @IsNotEmpty({ message: 'Preço de venda é obrigatório' })
  salePrice!: number;

  @IsNumber({}, { message: 'Estoque atual deve ser um número' })
  @Min(0, { message: 'Estoque atual não pode ser negativo' })
  @IsOptional()
  currentStock?: number;

  @IsNumber({}, { message: 'Estoque mínimo deve ser um número' })
  @Min(0, { message: 'Estoque mínimo não pode ser negativo' })
  @IsOptional()
  minStock?: number;

  @IsString({ message: 'Unidade deve ser uma string' })
  @IsOptional()
  unit?: string;
}

// DTO para atualizar produto
export class UpdateProductDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @IsNumber({}, { message: 'Preço de custo deve ser um número' })
  @Min(0, { message: 'Preço de custo não pode ser negativo' })
  @IsOptional()
  costPrice?: number;

  @IsNumber({}, { message: 'Preço de venda deve ser um número' })
  @Min(0, { message: 'Preço de venda não pode ser negativo' })
  @IsOptional()
  salePrice?: number;

  @IsNumber({}, { message: 'Estoque atual deve ser um número' })
  @Min(0, { message: 'Estoque atual não pode ser negativo' })
  @IsOptional()
  currentStock?: number;

  @IsNumber({}, { message: 'Estoque mínimo deve ser um número' })
  @Min(0, { message: 'Estoque mínimo não pode ser negativo' })
  @IsOptional()
  minStock?: number;

  @IsString({ message: 'Unidade deve ser uma string' })
  @IsOptional()
  unit?: string;

  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;
}

// DTO para entrada de estoque
export class StockEntryDto {
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity!: number;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;
}
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  MinLength,
} from 'class-validator';

// DTO para criar produto
export class CreateProductDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name!: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

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
  @IsIn(['UN', 'ML', 'KG', 'L', 'G'], { message: 'Unidade deve ser UN, ML, KG, L ou G' })
  @IsOptional()
  unit?: 'UN' | 'ML' | 'KG' | 'L' | 'G';

  @IsBoolean({ message: 'isRetail deve ser um booleano' })
  @IsOptional()
  isRetail?: boolean;

  @IsBoolean({ message: 'isBackbar deve ser um booleano' })
  @IsOptional()
  isBackbar?: boolean;
}

// DTO para atualizar produto
export class UpdateProductDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

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
  @IsIn(['UN', 'ML', 'KG', 'L', 'G'], { message: 'Unidade deve ser UN, ML, KG, L ou G' })
  @IsOptional()
  unit?: 'UN' | 'ML' | 'KG' | 'L' | 'G';

  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;

  @IsBoolean({ message: 'isRetail deve ser um booleano' })
  @IsOptional()
  isRetail?: boolean;

  @IsBoolean({ message: 'isBackbar deve ser um booleano' })
  @IsOptional()
  isBackbar?: boolean;
}

// DTO para ajuste de estoque
export class AdjustStockDto {
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity!: number;

  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['IN', 'OUT'], { message: 'Tipo deve ser IN (entrada) ou OUT (saída)' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type!: 'IN' | 'OUT';

  @IsString({ message: 'Motivo deve ser uma string' })
  @IsNotEmpty({ message: 'Motivo é obrigatório' })
  @MinLength(3, { message: 'Motivo deve ter pelo menos 3 caracteres' })
  reason!: string;
}

// DTO legado para entrada de estoque (mantido para compatibilidade)
export class StockEntryDto {
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity!: number;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;
}

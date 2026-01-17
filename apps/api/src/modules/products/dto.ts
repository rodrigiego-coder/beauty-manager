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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO para criar produto
export class CreateProductDto {
  @ApiProperty({ description: 'Nome do produto', example: 'Shampoo Profissional 1L', minLength: 2 })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name!: string;

  @ApiPropertyOptional({ description: 'Descrição do produto', example: 'Shampoo para cabelos oleosos' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Preço de custo em reais', example: 25.0, minimum: 0 })
  @IsNumber({}, { message: 'Preço de custo deve ser um número' })
  @Min(0, { message: 'Preço de custo não pode ser negativo' })
  @IsNotEmpty({ message: 'Preço de custo é obrigatório' })
  costPrice!: number;

  @ApiProperty({ description: 'Preço de venda em reais', example: 45.0, minimum: 0 })
  @IsNumber({}, { message: 'Preço de venda deve ser um número' })
  @Min(0, { message: 'Preço de venda não pode ser negativo' })
  @IsNotEmpty({ message: 'Preço de venda é obrigatório' })
  salePrice!: number;

  // Dual stock system - Estoque Loja (Retail)
  @ApiPropertyOptional({ description: 'Estoque Loja (para venda)', example: 10, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Loja deve ser um número' })
  @Min(0, { message: 'Estoque Loja não pode ser negativo' })
  @IsOptional()
  stockRetail?: number;

  @ApiPropertyOptional({ description: 'Estoque mínimo Loja (alerta)', example: 3, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Mínimo Loja deve ser um número' })
  @Min(0, { message: 'Estoque Mínimo Loja não pode ser negativo' })
  @IsOptional()
  minStockRetail?: number;

  // Dual stock system - Estoque Salão (Internal)
  @ApiPropertyOptional({ description: 'Estoque Salão (uso interno)', example: 5, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Salão deve ser um número' })
  @Min(0, { message: 'Estoque Salão não pode ser negativo' })
  @IsOptional()
  stockInternal?: number;

  @ApiPropertyOptional({ description: 'Estoque mínimo Salão (alerta)', example: 2, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Mínimo Salão deve ser um número' })
  @Min(0, { message: 'Estoque Mínimo Salão não pode ser negativo' })
  @IsOptional()
  minStockInternal?: number;

  @ApiPropertyOptional({ description: 'Unidade de medida', enum: ['UN', 'ML', 'KG', 'L', 'G'], example: 'UN' })
  @IsString({ message: 'Unidade deve ser uma string' })
  @IsIn(['UN', 'ML', 'KG', 'L', 'G'], { message: 'Unidade deve ser UN, ML, KG, L ou G' })
  @IsOptional()
  unit?: 'UN' | 'ML' | 'KG' | 'L' | 'G';

  @ApiPropertyOptional({ description: 'Produto para venda (Loja)', example: true })
  @IsBoolean({ message: 'isRetail deve ser um booleano' })
  @IsOptional()
  isRetail?: boolean;

  @ApiPropertyOptional({ description: 'Produto para uso interno (Backbar)', example: true })
  @IsBoolean({ message: 'isBackbar deve ser um booleano' })
  @IsOptional()
  isBackbar?: boolean;
}

// DTO para atualizar produto
export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Nome do produto', example: 'Shampoo Profissional 1L', minLength: 2 })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do produto', example: 'Shampoo para cabelos oleosos' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Preço de custo em reais', example: 25.0, minimum: 0 })
  @IsNumber({}, { message: 'Preço de custo deve ser um número' })
  @Min(0, { message: 'Preço de custo não pode ser negativo' })
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Preço de venda em reais', example: 45.0, minimum: 0 })
  @IsNumber({}, { message: 'Preço de venda deve ser um número' })
  @Min(0, { message: 'Preço de venda não pode ser negativo' })
  @IsOptional()
  salePrice?: number;

  // Dual stock system - Estoque Loja (Retail)
  @ApiPropertyOptional({ description: 'Estoque Loja (para venda)', example: 10, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Loja deve ser um número' })
  @Min(0, { message: 'Estoque Loja não pode ser negativo' })
  @IsOptional()
  stockRetail?: number;

  @ApiPropertyOptional({ description: 'Estoque mínimo Loja (alerta)', example: 3, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Mínimo Loja deve ser um número' })
  @Min(0, { message: 'Estoque Mínimo Loja não pode ser negativo' })
  @IsOptional()
  minStockRetail?: number;

  // Dual stock system - Estoque Salão (Internal)
  @ApiPropertyOptional({ description: 'Estoque Salão (uso interno)', example: 5, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Salão deve ser um número' })
  @Min(0, { message: 'Estoque Salão não pode ser negativo' })
  @IsOptional()
  stockInternal?: number;

  @ApiPropertyOptional({ description: 'Estoque mínimo Salão (alerta)', example: 2, minimum: 0 })
  @IsNumber({}, { message: 'Estoque Mínimo Salão deve ser um número' })
  @Min(0, { message: 'Estoque Mínimo Salão não pode ser negativo' })
  @IsOptional()
  minStockInternal?: number;

  @ApiPropertyOptional({ description: 'Unidade de medida', enum: ['UN', 'ML', 'KG', 'L', 'G'], example: 'UN' })
  @IsString({ message: 'Unidade deve ser uma string' })
  @IsIn(['UN', 'ML', 'KG', 'L', 'G'], { message: 'Unidade deve ser UN, ML, KG, L ou G' })
  @IsOptional()
  unit?: 'UN' | 'ML' | 'KG' | 'L' | 'G';

  @ApiPropertyOptional({ description: 'Produto ativo', example: true })
  @IsBoolean({ message: 'Active deve ser um booleano' })
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Produto para venda (Loja)', example: true })
  @IsBoolean({ message: 'isRetail deve ser um booleano' })
  @IsOptional()
  isRetail?: boolean;

  @ApiPropertyOptional({ description: 'Produto para uso interno (Backbar)', example: true })
  @IsBoolean({ message: 'isBackbar deve ser um booleano' })
  @IsOptional()
  isBackbar?: boolean;
}

// DTO para ajuste de estoque
export class AdjustStockDto {
  @ApiProperty({ description: 'Quantidade a ajustar', example: 5, minimum: 1 })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity!: number;

  @ApiProperty({ description: 'Tipo de ajuste', enum: ['IN', 'OUT'], example: 'IN' })
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['IN', 'OUT'], { message: 'Tipo deve ser IN (entrada) ou OUT (saída)' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type!: 'IN' | 'OUT';

  @ApiProperty({ description: 'Motivo do ajuste', example: 'Compra de estoque', minLength: 3 })
  @IsString({ message: 'Motivo deve ser uma string' })
  @IsNotEmpty({ message: 'Motivo é obrigatório' })
  @MinLength(3, { message: 'Motivo deve ter pelo menos 3 caracteres' })
  reason!: string;
}

// DTO legado para entrada de estoque (mantido para compatibilidade)
export class StockEntryDto {
  @ApiProperty({ description: 'Quantidade a adicionar', example: 10, minimum: 1 })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity!: number;

  @ApiPropertyOptional({ description: 'Descrição da entrada', example: 'Reposição mensal' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;
}

// DTO para transferência de estoque entre localizações (RETAIL <-> INTERNAL)
export class TransferStockDto {
  @ApiProperty({ description: 'Quantidade a transferir', example: 3, minimum: 1 })
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity!: number;

  @ApiProperty({ description: 'Localização de origem', enum: ['RETAIL', 'INTERNAL'], example: 'RETAIL' })
  @IsString({ message: 'Origem deve ser uma string' })
  @IsIn(['RETAIL', 'INTERNAL'], { message: 'Origem deve ser RETAIL ou INTERNAL' })
  @IsNotEmpty({ message: 'Origem é obrigatória' })
  fromLocation!: 'RETAIL' | 'INTERNAL';

  @ApiProperty({ description: 'Localização de destino', enum: ['RETAIL', 'INTERNAL'], example: 'INTERNAL' })
  @IsString({ message: 'Destino deve ser uma string' })
  @IsIn(['RETAIL', 'INTERNAL'], { message: 'Destino deve ser RETAIL ou INTERNAL' })
  @IsNotEmpty({ message: 'Destino é obrigatório' })
  toLocation!: 'RETAIL' | 'INTERNAL';

  @ApiPropertyOptional({ description: 'Motivo da transferência', example: 'Reposição para uso no salão' })
  @IsString({ message: 'Motivo deve ser uma string' })
  @IsOptional()
  reason?: string;
}

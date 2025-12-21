import { IsNumber, IsString, IsOptional, IsArray, ValidateNested, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsumptionItemDto {
  @IsNumber({}, { message: 'productId deve ser um numero' })
  productId!: number;

  @IsNumber({}, { message: 'quantity deve ser um numero' })
  @Min(0.001, { message: 'quantity deve ser maior que 0' })
  quantity!: number;

  @IsString({ message: 'unit deve ser uma string' })
  @IsIn(['UN', 'ML', 'G', 'KG', 'L'], { message: 'unit deve ser UN, ML, G, KG ou L' })
  unit!: 'UN' | 'ML' | 'G' | 'KG' | 'L';

  @IsString({ message: 'notes deve ser uma string' })
  @IsOptional()
  notes?: string;
}

export class UpdateServiceConsumptionsDto {
  @IsArray({ message: 'items deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ConsumptionItemDto)
  items!: ConsumptionItemDto[];
}

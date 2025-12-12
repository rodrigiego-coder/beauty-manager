import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class OpenCashRegisterDto {
  @IsNumber()
  @Min(0)
  openingBalance!: number;
}

export class CloseCashRegisterDto {
  @IsNumber()
  @Min(0)
  closingBalance!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CashMovementDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  reason!: string;
}

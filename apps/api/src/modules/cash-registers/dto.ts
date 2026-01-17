import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenCashRegisterDto {
  @ApiProperty({ description: 'Saldo de abertura do caixa em reais', example: 200.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  openingBalance!: number;
}

export class CloseCashRegisterDto {
  @ApiProperty({ description: 'Saldo de fechamento do caixa em reais', example: 1500.00, minimum: 0 })
  @IsNumber()
  @Min(0)
  closingBalance!: number;

  @ApiPropertyOptional({ description: 'Notas ou observações do fechamento', example: 'Conferido por Maria' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CashMovementDto {
  @ApiProperty({ description: 'Valor da movimentação em reais', example: 50.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ description: 'Motivo da movimentação', example: 'Sangria para depósito bancário' })
  @IsString()
  reason!: string;
}

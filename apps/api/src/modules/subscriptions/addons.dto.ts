import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAddonDto {
  @ApiProperty({
    description: 'Código do add-on a ser ativado',
    example: 'WHATSAPP_BASIC_120',
    enum: [
      'WHATSAPP_BASIC_120',
      'WHATSAPP_BASIC_160',
      'WHATSAPP_BASIC_200',
      'WHATSAPP_BASIC_240',
      'WHATSAPP_PRO_120',
      'WHATSAPP_PRO_160',
      'WHATSAPP_PRO_200',
      'WHATSAPP_PRO_240',
    ],
  })
  @IsString()
  @IsNotEmpty({ message: 'O código do add-on é obrigatório' })
  addonCode!: string;
}

export class GrantCreditsDto {
  @ApiProperty({
    description: 'Código do pacote de créditos',
    example: 'WHATSAPP_EXTRA_20',
  })
  @IsString()
  @IsNotEmpty({ message: 'O código do pacote é obrigatório' })
  packageCode!: string;

  @ApiProperty({
    description: 'Quantidade de pacotes a comprar',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'A quantidade de pacotes deve ser um número inteiro' })
  @Min(1, { message: 'A quantidade mínima é 1 pacote' })
  @Max(100, { message: 'A quantidade máxima é 100 pacotes' })
  qtyPackages!: number;
}

import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class ActivateAddonDto {
  @IsString()
  @IsNotEmpty({ message: 'O código do add-on é obrigatório' })
  addonCode!: string;
}

export class GrantCreditsDto {
  @IsString()
  @IsNotEmpty({ message: 'O código do pacote é obrigatório' })
  packageCode!: string;

  @IsInt({ message: 'A quantidade de pacotes deve ser um número inteiro' })
  @Min(1, { message: 'A quantidade mínima é 1 pacote' })
  @Max(100, { message: 'A quantidade máxima é 100 pacotes' })
  qtyPackages!: number;
}

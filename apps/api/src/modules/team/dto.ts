import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, IsArray, Min, Max } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(['MANAGER', 'RECEPTIONIST', 'STYLIST'])
  role!: 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCommission?: number;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateTeamMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['MANAGER', 'RECEPTIONIST', 'STYLIST'])
  role?: 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCommission?: number;

  @IsOptional()
  @IsString()
  specialties?: string;
}

export class SetServicesDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  serviceIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  manualServiceIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  onlineServiceIds?: number[];
}

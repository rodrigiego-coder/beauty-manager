import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

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

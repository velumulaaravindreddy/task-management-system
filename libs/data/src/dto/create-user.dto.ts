import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsUUID, MinLength } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}


import { IsString, IsOptional, IsEmail, IsEnum, IsUUID } from 'class-validator';
import { Role } from '../enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}


import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  category?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  priority?: number;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}


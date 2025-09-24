import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsDateString()
  birthday: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({})
  height: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight: number;
}

import { IsNotEmpty, IsString, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsNotEmpty({ message: 'Display name field is required' })
  @IsString()
  displayName: string;

  @IsNotEmpty({ message: 'gender field is required' })
  @IsString()
  gender: string;

  @IsNotEmpty({ message: 'birthday field is required' })
  @IsDateString()
  birthday: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'height filed must be a number' })
  height: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Weight must be a number' })
  weight: number;
}

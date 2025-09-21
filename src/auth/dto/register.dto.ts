/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { Match } from '../validator/match.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email not valid' })
  email: string;

  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username min length is 3' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password min length is 6' })
  password: string;

  @IsNotEmpty({ message: 'confirm password is required' })
  @Validate(Match, ['password'], { message: 'password not match' })
  confirmPassword: string;
}

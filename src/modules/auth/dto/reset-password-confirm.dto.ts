import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordConfirmDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
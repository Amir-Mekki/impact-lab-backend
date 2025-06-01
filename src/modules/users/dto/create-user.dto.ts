import { IsEmail, IsString, MinLength, IsNotEmpty, Validate } from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  firstname: string;

  @IsString()
  @MinLength(3)
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;
}
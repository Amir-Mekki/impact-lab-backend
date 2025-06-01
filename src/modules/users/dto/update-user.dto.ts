import { IsEmail, IsOptional, IsString, MinLength, IsNotEmpty, ValidateIf, Validate } from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstname: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => o.password)
  @IsString()
  @IsNotEmpty()
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;
}

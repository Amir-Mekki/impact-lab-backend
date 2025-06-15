import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  Validate,
  ValidateIf,
} from 'class-validator';
import { MatchPasswordConstraint } from '../../../common/validators/match-password.validator';
import { Sex, UserRole } from '../../../database/schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  sex?: Sex;

  @IsOptional()
  @IsString()
  provider?: string;

  @ValidateIf((o) => !o.provider)
  @IsString()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => !o.provider)
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;
}

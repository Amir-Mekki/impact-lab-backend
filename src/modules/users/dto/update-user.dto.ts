import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsNotEmpty,
  ValidateIf,
  Validate,
  IsDate,
} from 'class-validator';
import { MatchPasswordConstraint } from '../../../common/validators/match-password.validator';
import { Sex, UserRole } from '../../../database/schemas/user.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  sex?: Sex;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ValidateIf((o) => o.password)
  @IsString()
  @IsNotEmpty()
  @Validate(MatchPasswordConstraint)
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  @IsOptional()
  @IsDate()
  resetPasswordExpires?: Date;
}

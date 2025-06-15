import { IsIn, IsObject, IsOptional } from 'class-validator';
import { Language, Languages, Mode, Modes } from '../../../database/schemas/account_setting.schema';

export class CreateAccountSettingDto {
  @IsIn(Object.keys(Languages))
  language: Language;

  @IsIn(Object.keys(Modes))
  mode: Mode;

  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    [module: string]: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

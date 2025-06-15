import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountSettingDto } from './create-account_setting.dto';

export class UpdateAccountSettingDto extends PartialType(CreateAccountSettingDto) {}

import { Module } from '@nestjs/common';
import { AccountSettingsService } from './account_settings.service';
import { AccountSettingsController } from './account_settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountSetting,
  AccountSettingSchema,
} from '../../database/schemas/account_setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AccountSetting.name, schema: AccountSettingSchema }]),
  ],
  controllers: [AccountSettingsController],
  providers: [AccountSettingsService],
  exports: [AccountSettingsService],
})
export class AccountSettingsModule {}

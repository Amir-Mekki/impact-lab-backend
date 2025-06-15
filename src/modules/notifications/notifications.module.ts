import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TwilioService } from './twilio.service';
import { FcmService } from './fcm.service';
import { AccountSettingsModule } from '../account_settings/account_settings.module';
import { CustomMailerModule } from '../../common/mailer/mailer.module';
import { NotificationsController } from './notifications.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CustomMailerModule, AccountSettingsModule, UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, TwilioService, FcmService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

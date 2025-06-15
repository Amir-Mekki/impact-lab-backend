import { Injectable } from '@nestjs/common';
import { MailerService } from '../../common/mailer/mailer.service';
import { TwilioService } from './twilio.service';
import { FcmService } from './fcm.service';
import { AccountSettingsService } from '../account_settings/account_settings.service';
import { UsersService } from '../users/users.service';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly twilioService: TwilioService,
    private readonly fcmService: FcmService,
    private readonly accountSettingsService: AccountSettingsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Sends an email notification.
   * @param to - Recipient's email address.
   * @param subject - Subject of the email.
   * @param template - Email template to use.
   * @param context - Context data for the email template.
   */
  async sendEmail(to: string, subject: string, template: string, context: any) {
    return this.mailerService.sendGenericEmail(to, subject, template, context);
  }

  /**
   * Sends an SMS notification.
   * @param to - Recipient's phone number.
   * @param message - Message to send via SMS.
   */
  async sendSMS(to: string, message: string) {
    return this.twilioService.sendSMS(to, message);
  }

  /**
   * Sends a push notification to a device.
   * @param toDeviceToken - Device token to send the notification to.
   * @param title - Title of the push notification.
   * @param body - Body of the push notification.
   */
  async sendPush(toDeviceToken: string, title: string, body: string) {
    return this.fcmService.sendNotificationToToken(toDeviceToken, title, body);
  }

  /**
   * Notifies a user based on their notification preferences.
   * @param user - User to notify.
   * @param module - Module for which the notification is sent (e.g., 'booking').
   * @param title - Title of the notification.
   * @param message - Message of the notification.
   * @param emailTemplate - Optional email template to use.
   * @param emailContext - Optional context for the email template.
   */
  async notifyUserByPreference(
    user: User,
    module: 'booking',
    title: string,
    message: string,
    emailTemplate?: string,
    emailContext?: any,
  ) {
    if (!user._id) return;
    const settings = await this.accountSettingsService.findByUser(user._id);

    if (!settings || !settings.notificationPreferences?.[module]) return;

    const preferences = settings.notificationPreferences[module];

    if (preferences.email && user.email && emailTemplate) {
      await this.sendEmail(user.email, title, emailTemplate, emailContext);
    }

    if (preferences.push && user.fcmToken) {
      await this.sendPush(user.fcmToken, title, message);
    }

    if (preferences.sms && user.phone) {
      await this.sendSMS(user.phone, message);
    }
  }

  /**
   * Notifies all admins of a specific module event.
   * @param module - Module for which the notification is sent (e.g., 'booking').
   * @param title - Title of the notification.
   * @param message - Message of the notification.
   * @param emailTemplate - Optional email template to use.
   * @param emailContext - Optional context for the email template.
   */
  async notifyAdmins(
    module: 'booking',
    title: string,
    message: string,
    emailTemplate?: string,
    emailContext?: any,
  ) {
    const admins = await this.usersService.findAdmins();

    for (const admin of admins) {
      await this.notifyUserByPreference(admin, module, title, message, emailTemplate, emailContext);
    }
  }
}

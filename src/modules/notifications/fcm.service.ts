import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(private readonly configService: ConfigService) {
    if (!admin.apps.length) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.error('Missing Firebase credentials');
        throw new Error('Firebase credentials are not configured properly');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
    }
  }

  /**
   * Sends a push notification to a specific device token.
   * @param token - The device token to send the notification to.
   * @param title - The title of the notification.
   * @param body - The body text of the notification.
   * @param data - Optional additional data to include with the notification.
   */
  async sendNotificationToToken(
    token: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ) {
    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data,
      });
      this.logger.log(`Notification sent to token`);
    } catch (error) {
      this.logger.error('Error sending push notification', error);
    }
  }

  /**
   * Sends a push notification to a specific topic.
   * @param topic - The topic to send the notification to.
   * @param title - The title of the notification.
   * @param body - The body text of the notification.
   * @param data - Optional additional data to include with the notification.
   */
  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ) {
    try {
      await admin.messaging().send({
        topic,
        notification: { title, body },
        data,
      });
      this.logger.log(`Notification sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Error sending topic notification to ${topic}`, error);
      throw new InternalServerErrorException('Failed to send notification');
    }
  }
}

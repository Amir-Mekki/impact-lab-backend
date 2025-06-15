import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly client: Twilio.Twilio;
  private readonly fromPhone: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    if (!fromPhone) {
      throw new Error('TWILIO_PHONE_NUMBER is not defined in environment variables');
    }
    this.fromPhone = fromPhone;

    this.client = Twilio(accountSid, authToken);
  }

  /**
   * Sends an SMS message using Twilio.
   * @param to - The recipient's phone number.
   * @param message - The message to send.
   * @returns A promise that resolves when the SMS is sent.
   */
  async sendSMS(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to,
      });

      this.logger.log(`SMS sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, error);
      throw new InternalServerErrorException('Failed to send SMS to the user');
    }
  }
}

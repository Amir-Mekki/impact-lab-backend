import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { TwilioService } from './twilio.service';
import { FcmService } from './fcm.service';
import { AccountSettingsService } from '../account_settings/account_settings.service';
import { UsersService } from '../users/users.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockTwilioService = {
    sendSMS: jest.fn(),
  };

  const mockFcmService = {
    sendNotificationToToken: jest.fn(),
  };

  const mockAccountSettingsService = {
    create: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: TwilioService, useValue: mockTwilioService },
        { provide: FcmService, useValue: mockFcmService },
        { provide: AccountSettingsService, useValue: mockAccountSettingsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

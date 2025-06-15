import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { TwilioService } from './twilio.service';
import { FcmService } from './fcm.service';
import { AccountSettingsService } from '../account_settings/account_settings.service';
import { UsersService } from '../users/users.service';

const mockMailerService = {
  sendGenericEmail: jest.fn(),
};

const mockTwilioService = {
  sendSMS: jest.fn(),
};

const mockFcmService = {
  sendNotificationToToken: jest.fn(),
};

const mockAccountSettingsService = {
  findByUser: jest.fn(),
};

const mockUsersService = {
  findAdmins: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: TwilioService, useValue: mockTwilioService },
        { provide: FcmService, useValue: mockFcmService },
        { provide: AccountSettingsService, useValue: mockAccountSettingsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

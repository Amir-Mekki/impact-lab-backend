import { Test, TestingModule } from '@nestjs/testing';
import { AccountSettingsController } from './account_settings.controller';
import { AccountSettingsService } from './account_settings.service';
import { UpdateAccountSettingDto } from './dto/update-account_setting.dto';

describe('AccountSettingsController', () => {
  let controller: AccountSettingsController;
  let service: AccountSettingsService;

  const mockUser = { userId: 'user123' };

  const mockAccountSetting = {
    user: 'user123',
    language: 'en',
    mode: 'dark',
    notificationPreferences: {
      booking: { email: true, push: true, sms: false },
    },
  };

  const mockUpdatedSetting = {
    user: 'user123',
    language: 'fr',
    mode: 'light',
    notificationPreferences: {
      booking: { email: false, push: true, sms: true },
    },
  };

  beforeEach(async () => {
    const mockService = {
      findByUser: jest.fn().mockResolvedValue(mockAccountSetting),
      updateByUser: jest.fn().mockResolvedValue(mockUpdatedSetting),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountSettingsController],
      providers: [
        {
          provide: AccountSettingsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AccountSettingsController>(AccountSettingsController);
    service = module.get<AccountSettingsService>(AccountSettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMyAccountSettings', () => {
    it('should return account settings for the current user', async () => {
      const result = await controller.findMyAccountSettings(mockUser);
      expect(service.findByUser).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual(mockAccountSetting);
    });
  });

  describe('updateMyAccountSettings', () => {
    it('should update and return updated account settings for the current user', async () => {
      const updateDto: UpdateAccountSettingDto = {
        language: 'fr',
        mode: 'light',
        notificationPreferences: {
          booking: { email: false, push: true, sms: true },
        },
      };

      const result = await controller.updateMyAccountSettings(updateDto, mockUser);

      expect(service.updateByUser).toHaveBeenCalledWith(updateDto, mockUser.userId);
      expect(result).toEqual(mockUpdatedSetting);
    });
  });
});

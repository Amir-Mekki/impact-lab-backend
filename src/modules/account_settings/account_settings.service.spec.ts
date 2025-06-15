import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AccountSettingsService } from './account_settings.service';
import { AccountSetting } from '../../database/schemas/account_setting.schema';
import { Model } from 'mongoose';
import { CreateAccountSettingDto } from './dto/create-account_setting.dto';

describe('AccountSettingsService', () => {
  let service: AccountSettingsService;
  let model: Model<AccountSetting>;

  const mockAccountSetting = {
    _id: 'mock-id',
    user: 'user123',
    language: 'en',
    mode: 'dark',
    notificationPreferences: {
      booking: {
        email: true,
        push: false,
        sms: true,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockModel = {
    create: jest.fn().mockResolvedValue(mockAccountSetting),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAccountSetting) }),
    findOneAndUpdate: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAccountSetting) }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountSettingsService,
        {
          provide: getModelToken(AccountSetting.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AccountSettingsService>(AccountSettingsService);
    model = module.get<Model<AccountSetting>>(getModelToken(AccountSetting.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new account setting', async () => {
      const dto: CreateAccountSettingDto = {
        language: 'en',
        mode: 'dark',
        notificationPreferences: {
          booking: { email: true, push: false, sms: true },
        },
      };
      const result = await service.create(dto, 'user123');
      expect(mockModel.create).toHaveBeenCalledWith({ ...dto, user: 'user123' });
      expect(result).toEqual(mockAccountSetting);
    });
  });

  describe('findByUser()', () => {
    it('should return the user account setting', async () => {
      const result = await service.findByUser('user123');
      expect(mockModel.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(result).toEqual(mockAccountSetting);
    });
  });

  describe('updateByUser()', () => {
    it('should update and return the user account setting', async () => {
      const dto: CreateAccountSettingDto = { language: 'fr', mode: 'light' };
      const result = await service.updateByUser(dto, 'user123');
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: 'user123' },
        { $set: dto },
        { new: true },
      );
      expect(result).toEqual(mockAccountSetting);
    });
  });
});

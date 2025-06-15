import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountSettingsService } from '../account_settings/account_settings.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  const mockUser = {
    _id: 'user-id-123',
    username: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: 'user',
  };

  const mockUserModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockUser]),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  };

  const mockAccountSettingsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: AccountSettingsService,
          useValue: mockAccountSettingsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const dto: CreateUserDto = {
        username: 'Jane Smith',
        email: 'jane@example.com',
        password: 'pass1234',
        confirmPassword: 'pass1234',
        role: 'user',
      };

      const result = await service.createUser(dto);

      expect(mockUserModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserModel.find.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce([mockUser]);

      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      mockUserModel.findById.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce(mockUser);

      const result = await service.findById('user-id-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail('john@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update and return the user', async () => {
      const updateDto: UpdateUserDto = { username: 'Updated' };
      mockUserModel.findByIdAndUpdate.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce({ ...mockUser, ...updateDto });

      const result = await service.updateUser('user-id-123', updateDto);
      expect(result).toEqual({ ...mockUser, ...updateDto });
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce(mockUser);

      const result = await service.deleteUser('user-id-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getMe (alias of findById)', () => {
    it('should return user by id (me)', async () => {
      mockUserModel.findById.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce(mockUser);

      const result = await service.findById('user-id-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMe (alias of updateUser)', () => {
    it('should update and return current user', async () => {
      const updateDto: UpdateUserDto = { username: 'Updated Self' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUserModel.findByIdAndUpdate.mockReturnThis();
      mockUserModel.exec.mockResolvedValueOnce(updatedUser);

      const result = await service.updateUser('user-id-123', updateDto);
      expect(result).toEqual(updatedUser);
    });
  });
});

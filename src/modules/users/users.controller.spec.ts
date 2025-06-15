import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        password: 'password123',
        confirmPassword: 'password123',
      };
      const result = { ...createUserDto, id: '123' };
      usersService.createUser!.mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          _id: '123',
          username: 'John Doe',
          email: 'john@example.com',
          password: 'hashed-password',
          role: 'user',
          sex: 'H',
          phone: '1234567890',
        },
      ];
      usersService.findAll!.mockResolvedValue(users);

      expect(await controller.findAll()).toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = {
        _id: '123',
        username: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        role: 'user',
        sex: 'H',
        phone: '1234567890',
      };
      usersService.findById!.mockResolvedValue(user);

      expect(await controller.findById('123')).toEqual(user);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      await expect(controller.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { username: 'Updated Name' };
      const updatedUser = {
        _id: '123',
        username: 'Updated Name',
        email: 'john@example.com',
        password: 'hashed-password',
        role: 'user',
        sex: 'H',
        phone: '1234567890',
      };
      usersService.updateUser!.mockResolvedValue(updatedUser);

      expect(await controller.update('123', updateUserDto)).toEqual(updatedUser);
    });

    it('should throw a NotFoundException if user to update is not found', async () => {
      usersService.updateUser!.mockResolvedValue(null);

      await expect(controller.update('999', {} as UpdateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const deletedUser = {
        _id: '123',
        username: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        role: 'user',
      };
      usersService.deleteUser!.mockResolvedValue(deletedUser);

      expect(await controller.delete('123')).toEqual(deletedUser);
    });

    it('should throw a NotFoundException if user to delete is not found', async () => {
      usersService.deleteUser!.mockResolvedValue(null);

      await expect(controller.delete('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMe', () => {
    it('should return the logged-in user', async () => {
      const user = { _id: '123', username: 'John Doe', email: 'john@example.com', role: 'user' };
      usersService.findById!.mockResolvedValue(user);

      const req = { user: { sub: '123' } } as any;
      expect(await controller.getMe(req)).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      const req = { user: { sub: 'nonexistent' } } as any;
      await expect(controller.getMe(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('should update the logged-in user', async () => {
      const updateDto: UpdateUserDto = { username: 'Updated Me' };
      const updatedUser = {
        _id: '123',
        username: 'Updated Me',
        email: 'john@example.com',
        role: 'user',
      };

      usersService.updateUser!.mockResolvedValue(updatedUser);

      const req = { user: { sub: '123' } } as any;
      expect(await controller.updateMe(req, updateDto)).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found during update', async () => {
      usersService.updateUser!.mockResolvedValue(null);

      const req = { user: { sub: 'nonexistent' } } as any;
      await expect(controller.updateMe(req, {} as UpdateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

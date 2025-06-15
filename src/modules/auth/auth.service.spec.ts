import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/schemas/user.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      updateUser: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const configService = {
      get: jest.fn().mockReturnValue('some-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        username: 'Test User',
      } as User;

      usersService.findByEmail!.mockResolvedValue(mockUser);
      const result = await authService.validateUser('test@example.com', 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      const result = await authService.validateUser('notfound@example.com', 'any');
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('correctpass', 10),
      } as User;

      usersService.findByEmail!.mockResolvedValue(mockUser);
      const result = await authService.validateUser('test@example.com', 'wrongpass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = {
        email: 'test@example.com',
        username: 'John Doe',
      } as User;

      jwtService.sign!.mockReturnValue('mocked-token');

      const result = await authService.login(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: expect.any(String),
        email: 'test@example.com',
        username: 'John Doe',
        role: 'user',
      });
      expect(result).toEqual({ access_token: 'mocked-token' });
    });
  });

  describe('generateResetToken', () => {
    it('should generate a reset token for a valid user', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      } as User;

      usersService.findByEmail!.mockResolvedValue(mockUser);
      jwtService.sign!.mockReturnValue('reset-token');

      const result = await authService.generateResetToken('test@example.com');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        { expiresIn: '1h', secret: expect.any(String) },
      );
      expect(usersService.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          resetPasswordToken: 'reset-token',
          resetPasswordExpires: expect.any(Date),
        }),
      );
      expect(result).toBe('reset-token');
    });

    it('should return null if user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      const result = await authService.generateResetToken('test@example.com');
      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        password: 'old-hash',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() + 10000),
      } as User;

      jwtService.verify!.mockReturnValue({ email: 'test@example.com' });
      usersService.findByEmail!.mockResolvedValue(mockUser);

      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash' as never);

      await authService.resetPassword('valid-token', 'newPassword123');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: expect.any(String),
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(hashSpy).toHaveBeenCalledWith('newPassword123', 10);
      expect(usersService.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          password: 'new-hash',
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        }),
      );
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(Date.now() - 10000),
      } as User;

      jwtService.verify!.mockReturnValue({ email: 'test@example.com' });
      usersService.findByEmail!.mockResolvedValue(mockUser);

      await expect(authService.resetPassword('valid-token', 'newPassword123')).rejects.toThrow(
        'Invalid or expired password reset token.',
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      jwtService.verify!.mockReturnValue({ email: 'test@example.com' });
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(authService.resetPassword('valid-token', 'newPassword123')).rejects.toThrow(
        'User not found.',
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jwtService.verify = jest.fn(() => {
        throw new Error('invalid token');
      });

      await expect(authService.resetPassword('invalid-token', 'newPassword123')).rejects.toThrow(
        'Invalid or expired password reset token.',
      );
    });
  });
});

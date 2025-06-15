import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../../database/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            validateUser: jest.fn(),
            generateResetToken: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendResetPasswordEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return 'mock-value';
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthService and return a token', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = { id: '1', email: loginDto.email };
      const token = { access_token: 'mocked-token' };

      (authService.validateUser as jest.Mock).mockResolvedValue(user);
      (authService.login as jest.Mock).mockResolvedValue(token);

      const result = await authController.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(token);
    });

    it('should throw NotFoundException for invalid credentials', async () => {
      const loginDto = { email: 'wrong@example.com', password: 'wrong' };
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('register', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: '1234',
        confirmPassword: '1234',
        username: 'Test',
        role: 'user' as UserRole,
      };
      const user = { id: '1', ...createUserDto };

      (usersService.createUser as jest.Mock).mockResolvedValue(user);

      const result = await authController.register(createUserDto);

      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send reset email if token generated', async () => {
      const email = 'test@example.com';
      const resetToken = 'reset-token';

      (authService.generateResetToken as jest.Mock).mockResolvedValue(resetToken);

      const result = await authController.requestPasswordReset(email);

      expect(authService.generateResetToken).toHaveBeenCalledWith(email);
      expect(mailerService.sendResetPasswordEmail).toHaveBeenCalledWith(email, resetToken);
      expect(result).toEqual({ message: `Password reset link sent to ${email}` });
    });

    it('should throw error if token generation fails', async () => {
      (authService.generateResetToken as jest.Mock).mockResolvedValue(null);

      await expect(authController.requestPasswordReset('fail@example.com')).rejects.toThrow(
        'User not found or unable to generate reset token.',
      );
    });
  });

  describe('resetPasswordConfirm', () => {
    it('should confirm password reset', async () => {
      const dto = { token: 'token123', newPassword: 'newPass123' };

      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      const result = await authController.resetPasswordConfirm(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword);
      expect(result).toEqual({ message: 'Password has been successfully reset.' });
    });
  });
});

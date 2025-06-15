import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../../database/schemas/user.schema';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';

/**
 * Service responsible for handling authentication logic, including user validation,
 * JWT token generation, and password reset functionality.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates the user credentials during the login process.
   * Checks if the user exists and if the provided password matches the stored hash.
   * @param email - The user's email address.
   * @param password - The user's plaintext password.
   * @returns The user object if validation is successful, otherwise null.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  /**
   * Handles user login by generating a JWT access token.
   * The token contains the user's email, username and role as payload.
   * @param user - The authenticated user object.
   * @returns An object containing the generated access token.
   */
  async login(user: User) {
    const payload: JwtPayload = {
      sub: user._id?.toString() || '',
      email: user.email,
      username: user.username,
      role: user.role || 'user',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Generates a password reset token for a given email and stores it in the user's document.
   * The token is a JWT that expires after a short period (e.g., 1 hour).
   * @param email - The email of the user requesting a password reset.
   * @returns The generated reset token string, or null if the user is not found.
   */
  async generateResetToken(email: string): Promise<string | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user._id) {
      return null;
    }

    const resetPayload = { email: user.email };
    const resetToken = this.jwtService.sign(resetPayload, {
      expiresIn: '1h',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await this.usersService.updateUser(user._id, user);
    return resetToken;
  }

  /**
   * Resets the user's password using a valid reset token.
   * Validates the token, checks its expiry, and updates the password if valid.
   * @param token - The password reset token.
   * @param newPassword - The new password to set.
   * @throws UnauthorizedException if the token is invalid or expired.
   * @throws NotFoundException if the user associated with the token is not found.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as JwtPayload & { email: string };

      const user = await this.usersService.findByEmail(decoded.email);
      if (!user || !user._id) {
        throw new NotFoundException('User not found.');
      }

      if (
        user.resetPasswordToken !== token ||
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new UnauthorizedException('Password reset token is invalid or has expired.');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await this.usersService.updateUser(user._id, user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired password reset token.');
    }
  }

  /**
   * Validates a user authenticated via an external SSO provider.
   * If the user does not exist, it creates a new user with the provided SSO user data.
   * @param ssoUser - The SSO user data to validate or create.
   * @returns The existing or newly created user entity.
   */
  async validateSsoUser(ssoUser: CreateUserDto): Promise<User> {
    let user = await this.usersService.findByEmail(ssoUser.email);
    if (user) return user;
    return await this.usersService.createUser(ssoUser);
  }
}

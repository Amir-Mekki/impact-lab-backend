import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../../database/schemas/user.schema';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

/**
 * Handles user login by generating a JWT access token.
 * The token contains the user's email and username as payload.
 * @param user - The authenticated user object.
 * @returns An object containing the generated access token.
 */
  async login(user: User) {
    const payload: JwtPayload = { email: user.email, firstname: user.firstname, lastname: user.lastname };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
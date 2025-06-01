import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

// Handles user login and returns a JWT token upon successful authentication
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }
}

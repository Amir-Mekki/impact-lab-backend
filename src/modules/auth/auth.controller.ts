import {
  Controller,
  Post,
  Get,
  Body,
  NotFoundException,
  UseGuards,
  Req,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResetPasswordConfirmDto } from './dto/reset-password-confirm.dto';
import { MailerService } from '../../common/mailer/mailer.service';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { FacebookAuthGuard } from '../../common/guards/facebook.guard';
import { AppleAuthGuard } from '../../common/guards/apple.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Handles user login by validating credentials and returning a JWT token upon successful authentication.
   * @param loginDto - Data Transfer Object containing user's email and password.
   * @returns A JWT token if authentication is successful.
   * @throws Error if the provided credentials are invalid.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (password == '') throw new UnauthorizedException('Password cannot be empty');

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  /**
   * Handles user registration by creating a new user with the provided details.
   * @param createUserDto - Data Transfer Object containing information required to create a new user.
   * @returns The created user entity.
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  /**
   * Handles password reset request by generating a reset token and sending a reset link to the user's email.
   * @param email - The email address of the user requesting a password reset.
   * @returns A success message indicating that the reset link has been sent.
   * @throws Error if the user with the provided email is not found.
   */
  @Post('request-password-reset') // Renamed for clarity
  async requestPasswordReset(@Body('email') email: string) {
    const resetToken = await this.authService.generateResetToken(email);
    if (!resetToken) {
      throw new Error('User not found or unable to generate reset token.');
    }

    await this.mailerService.sendResetPasswordEmail(email, resetToken);

    return { message: `Password reset link sent to ${email}` };
  }

  /**
   * Handles password reset confirmation by validating the token and updating the user's password.
   * @param resetPasswordConfirmDto - Data Transfer Object containing the reset token and the new password.
   * @returns A success message upon successful password update.
   * @throws Error if the token is invalid, expired, or the password update fails.
   */
  @Post('reset-password-confirm')
  async resetPasswordConfirm(@Body() resetPasswordConfirmDto: ResetPasswordConfirmDto) {
    const { token, newPassword } = resetPasswordConfirmDto;
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been successfully reset.' };
  }

  /**
   * Initiates Google OAuth authentication.
   * Redirects the user to Google's OAuth consent page.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  /**
   * Handles the callback from Google after successful authentication.
   * Validates the user and returns a JWT token.
   * @param req - The request object containing the authenticated user.
   * @returns An object containing the JWT access token.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const jwt = await this.authService.login(user);
    res.redirect(`${this.configService.get('FRONTEND_URL')}?token=${jwt.access_token}`);
  }

  /**
   * Initiates Facebook OAuth authentication.
   * Redirects the user to Facebook's OAuth consent page.
   */
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin() {}

  /**
   * Handles the callback from Facebook after successful authentication.
   * Validates the user and returns a JWT token.
   * @param req - The request object containing the authenticated user.
   * @returns An object containing the JWT access token.
   */
  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const jwt = await this.authService.login(user);
    res.redirect(`${this.configService.get('FRONTEND_URL')}?token=${jwt.access_token}`);
  }

  /**
   * Initiates Apple OAuth authentication.
   * Redirects the user to Apple's OAuth consent page.
   */
  @Get('apple')
  @UseGuards(AppleAuthGuard)
  async appleLogin() {}

  /**
   * Handles the callback from Apple after successful authentication.
   * Validates the user and returns a JWT token.
   * @param req - The request object containing the authenticated user.
   * @returns An object containing the JWT access token.
   */
  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleCallback(@Req() req, @Res() res) {
    const user = req.user;
    const jwt = await this.authService.login(user);
    res.redirect(`${this.configService.get('FRONTEND_URL')}?token=${jwt.access_token}`);
  }
}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { CustomMailerModule as MailerModule } from '../../common/mailer/mailer.module';
import { AuthController } from './auth.controller';
import googleOauthConfig from './config/google-oauth.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import facebookOAuthConfig from './config/facebook-oauth.config';
import { FacebookStrategy } from './strategies/facebook.strategy';
import appleOauthConfig from './config/apple-oauth.config';
import { AppleStrategy } from './strategies/apple.strategy';

@Module({
  imports: [
    UsersModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(facebookOAuthConfig),
    ConfigModule.forFeature(appleOauthConfig),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy, AppleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
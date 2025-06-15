import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import googleOauthConfig from '../config/google-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY) 
    private googleConfig: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
) {
    super({
      clientID: googleConfig.clientID!,
      clientSecret: googleConfig.clientSecret!,
      callbackURL: googleConfig.callbackURL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const user = this.authService.validateSsoUser({
      email: profile.emails[0].value,
      username: profile.displayName,
      role: 'user',
      provider: "google",
      password: "",
      confirmPassword: ""
    })

    done(null, user);
  }
}

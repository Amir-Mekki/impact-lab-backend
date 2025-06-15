import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigType } from '@nestjs/config';
import facebookConfig from '../config/facebook-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    @Inject(facebookConfig.KEY)
    private config: ConfigType<typeof facebookConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: config.clientID!,
      clientSecret: config.clientSecret!,
      callbackURL: config.callbackURL!,
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = this.authService.validateSsoUser({
      email: emails && emails.length > 0 ? emails[0].value : '',
      username: `${name?.givenName} ${name?.familyName}`,
      provider: 'facebook',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    done(null, user);
  }
}

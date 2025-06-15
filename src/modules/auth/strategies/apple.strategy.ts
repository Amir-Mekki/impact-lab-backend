import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigType } from '@nestjs/config';
import appleConfig from '../config/apple-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    @Inject(appleConfig.KEY)
    private config: ConfigType<typeof appleConfig>,
    private authService: AuthService,    
  ) {
    super({
      clientID: config.clientID!,
      teamID: config.teamID!,
      keyID: config.keyID!,
      callbackURL: config.callbackURL!,
      privateKeyString: config.privateKeyString!,
      passReqToCallback: false,
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, idToken: any, profile: any): Promise<any> {
     const user = this.authService.validateSsoUser({
      email: profile.email,
      username: `${profile.user.firstName} ${profile.user.lastName}`,
      provider: 'apple',
      role: 'user',
      password: '',
      confirmPassword: ''
    });

    return user;
  }
}
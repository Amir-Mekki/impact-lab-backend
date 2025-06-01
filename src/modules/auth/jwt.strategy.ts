import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { first } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

// This method validates the JWT payload and returns the relevant user information.
  async validate(payload: JwtPayload) {
    return { email: payload.email, firstname: payload.firstname, lastname: payload.lastname };
  }
}

import { UserRole } from '../../database/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
}

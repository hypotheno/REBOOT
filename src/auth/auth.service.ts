import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { required } from '../common/db.util';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  register(body: any) {
    return this.users.createUser(body);
  }

  async login(email: string, password: string) {
    required({ email, password }, ['email', 'password']);
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      throw new UnauthorizedException('Invalid email or password');
    return this.issueTokens(user.user_id, user.email);
  }

  async refresh(refreshToken: string) {
    required({ refreshToken }, ['refreshToken']);
    try {
      const payload = this.jwt.verify(refreshToken, { secret: this.refreshSecret() });
      return this.issueTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private refreshSecret() {
    return (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string;
  }

  private issueTokens(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '15m' }),
      refreshToken: this.jwt.sign(payload, { secret: this.refreshSecret(), expiresIn: '7d' }),
    };
  }
}
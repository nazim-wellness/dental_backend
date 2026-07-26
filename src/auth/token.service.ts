import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { ConfigService } from '../config/config.service';

export type TokenPayload = {
  readonly userId: number;
  readonly role: UserRole;
  readonly isNewUser?: boolean;
};

export type TokenResponse = {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly isNewUser: boolean;
};

@Injectable()
export class TokenService {
  private readonly accessTokenExpiresIn = '12h';
  private readonly refreshTokenExpiresIn = '7d';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: TokenPayload): Promise<TokenResponse> {
    const { userId, role, isNewUser = false } = payload;
    const accessToken = await this.jwtService.signAsync(
      { sub: userId.toString(), role },
      { expiresIn: this.accessTokenExpiresIn },
    );
    const { jwtRefreshSecret } = this.configService.getAppConfig();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId.toString(), role },
      { secret: jwtRefreshSecret, expiresIn: this.refreshTokenExpiresIn },
    );
    return { accessToken, refreshToken, isNewUser };
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const { jwtRefreshSecret } = this.configService.getAppConfig();
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token, { secret: jwtRefreshSecret });
      return {
        userId: parseInt(payload.sub, 10),
        role: payload.role as UserRole,
      };
    } catch {
      return null;
    }
  }
}

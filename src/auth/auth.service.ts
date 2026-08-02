import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import { ConfigService } from '../config/config.service';
import { randomInt, createHash } from 'node:crypto';
import { OtpCodeRepository } from '../repositories/otp-code.repository';
import { EmailCodeRepository } from '../repositories/email-code.repository';
import { UserRepository } from '../repositories/user.repository';
import { TokenService, TokenResponse } from './token.service';
import { TelegramService } from './telegram.service';
import { OAuthService } from './oauth.service';
import { EmailService } from './email.service';
import { OAuthCodeDto } from './dto/oauth-code.dto';
import { RequestEmailCodeDto, VerifyEmailCodeDto } from './dto/email-code.dto';

const PASSWORD_HASH_ROUNDS = 10;

const OTP_TTL_SECONDS = 300;
const OTP_CODE_LENGTH = 6;
const EMAIL_CODE_MAX_PER_HOUR = 5;
const DEFAULT_DEV_PEPPER = 'development-pepper-not-for-production';
const TEST_OTP_CODE = '000000';
const SMS_BYPASS_PHONE = '+79999999999';

function generateOtpCode(): string {
  return randomInt(
    10 ** (OTP_CODE_LENGTH - 1),
    10 ** OTP_CODE_LENGTH,
  ).toString();
}

function hashOtpCode(code: string, pepper: string): string {
  return createHash('sha256').update(`${code}${pepper}`).digest('hex');
}
function isSmsBypassPhone(phone: string): boolean {
  return phone === SMS_BYPASS_PHONE;
}

export type RequestOtpResult = { code?: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpRepo: OtpCodeRepository,
    private readonly emailCodeRepo: EmailCodeRepository,
    private readonly userRepo: UserRepository,
    private readonly sms: SmsService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly tokenService: TokenService,
    private readonly telegramService: TelegramService,
    private readonly oauthService: OAuthService,
  ) {}

  private resolvePepper(): string {
    const nodeEnv = this.config.getAppConfig().nodeEnv;
    return nodeEnv === 'test'
      ? 'test'
      : nodeEnv === 'production'
        ? (process.env.OTP_PEPPER ?? '')
        : (process.env.OTP_PEPPER ?? DEFAULT_DEV_PEPPER);
  }

  /** Запросить код входа на email (passwordless). */
  async requestEmailCode(
    input: RequestEmailCodeDto,
  ): Promise<RequestOtpResult> {
    const email = input.email.trim().toLowerCase();

    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.emailCodeRepo.countRecent({
      email,
      purpose: 'LOGIN',
      since,
    });
    if (recent >= EMAIL_CODE_MAX_PER_HOUR) {
      throw new HttpException(
        'Слишком много запросов кода. Попробуйте позже.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code, this.resolvePepper());
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await this.emailCodeRepo.create({
      email,
      codeHash,
      purpose: 'LOGIN',
      expiresAt,
    });
    await this.email.sendLoginCode(email, code);

    const isProd = this.config.getAppConfig().nodeEnv === 'production';
    return isProd ? {} : { code };
  }

  /** Проверить код из письма и войти/зарегистрироваться. */
  async verifyEmailCode(input: VerifyEmailCodeDto): Promise<TokenResponse> {
    const email = input.email.trim().toLowerCase();
    const { code, role } = input;

    const codeHash = hashOtpCode(code, this.resolvePepper());
    const now = new Date();
    const record = await this.emailCodeRepo.findValidLatest({
      email,
      purpose: 'LOGIN',
      now,
    });
    if (!record || record.codeHash !== codeHash) {
      throw new UnauthorizedException('Неверный или просроченный код');
    }

    await this.emailCodeRepo.markUsed(record.id, now);

    const user = await this.userRepo.upsertByEmailVerified({
      email,
      role: role as UserRole,
    });
    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: user.isNewUser,
    });
  }

  async loginWithYandex(input: OAuthCodeDto): Promise<TokenResponse> {
    const profile = await this.oauthService.fetchYandexUser(
      input.code,
      input.redirectUri,
    );
    const user = await this.userRepo.upsertByOAuth({
      provider: 'yandex',
      providerId: profile.providerId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: input.role as UserRole,
    });
    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: user.isNewUser,
    });
  }

  async loginWithVk(input: OAuthCodeDto): Promise<TokenResponse> {
    const profile = await this.oauthService.fetchVkUser(
      input.code,
      input.redirectUri,
    );
    const user = await this.userRepo.upsertByOAuth({
      provider: 'vk',
      providerId: profile.providerId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: input.role as UserRole,
    });
    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: user.isNewUser,
    });
  }

  async requestOtp(input: RequestOtpDto): Promise<RequestOtpResult> {
    const { phone } = input;
    const isBypassPhone = isSmsBypassPhone(phone);
    const code = isBypassPhone ? TEST_OTP_CODE : generateOtpCode();
    const nodeEnv = this.config.getAppConfig().nodeEnv;
    const pepper =
      nodeEnv === 'test'
        ? 'test'
        : nodeEnv === 'production'
          ? (process.env.OTP_PEPPER ?? '')
          : (process.env.OTP_PEPPER ?? DEFAULT_DEV_PEPPER);
    const codeHash = hashOtpCode(code, pepper);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await this.otpRepo.create({
      phone,
      codeHash,
      purpose: 'REGISTER',
      expiresAt,
    });

    if (!isBypassPhone) {
      await this.sms.sendOtp(phone, code);
    }
    const isProd: boolean = this.config.getAppConfig().nodeEnv === 'production';
    return isProd ? {} : { code };
  }

  async verifyOtp(input: VerifyOtpDto): Promise<TokenResponse> {
    const { phone, code, role } = input;
    const nodeEnv = this.config.getAppConfig().nodeEnv;

    if (isSmsBypassPhone(phone) && code === TEST_OTP_CODE) {
      const user = await this.userRepo.upsertByPhoneAndVerify({
        phone,
        role: role as UserRole,
      });
      return this.tokenService.generateTokens({
        userId: user.id,
        role: user.role,
        isNewUser: user.isNewUser,
      });
    }

    const pepper =
      nodeEnv === 'test'
        ? 'test'
        : nodeEnv === 'production'
          ? (process.env.OTP_PEPPER ?? '')
          : (process.env.OTP_PEPPER ?? DEFAULT_DEV_PEPPER);
    const codeHash = hashOtpCode(code, pepper);

    const now = new Date();
    const otp = await this.otpRepo.findValidLatest({
      phone,
      purpose: 'REGISTER',
      now,
    });
    if (!otp || otp.codeHash !== codeHash)
      throw new UnauthorizedException('Invalid OTP');

    await this.otpRepo.markUsed(otp.id, now);

    const user = await this.userRepo.upsertByPhoneAndVerify({
      phone,
      role: role as UserRole,
    });

    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: user.isNewUser,
    });
  }

  async registerWithEmail(input: RegisterEmailDto): Promise<TokenResponse> {
    const { email, password, phone, role } = input;
    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

    const user = await this.userRepo.createByEmail({
      email,
      passwordHash,
      phone,
      role: role as UserRole,
    });

    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: true,
    });
  }

  async loginWithEmail(input: LoginEmailDto): Promise<TokenResponse> {
    const { email, password } = input;

    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: false,
    });
  }

  async refreshTokens(input: RefreshTokenDto): Promise<TokenResponse> {
    const { refreshToken } = input;
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.tokenService.generateTokens({
      userId: payload.userId,
      role: payload.role,
      isNewUser: false,
    });
  }

  async authWithTelegram(input: TelegramAuthDto): Promise<TokenResponse> {
    const { initData, role } = input;
    const telegramData = this.telegramService.verifyAndParseInitData(initData);
    const user = await this.userRepo.upsertByTelegram({
      telegramId: telegramData.id,
      telegramUsername: telegramData.username,
      firstName: telegramData.firstName,
      lastName: telegramData.lastName,
      role: role as UserRole,
    });
    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: user.isNewUser,
    });
  }

  async loginWithTelegramWidget(
    input: TelegramLoginDto,
  ): Promise<TokenResponse> {
    const { id, first_name, last_name, username, auth_date, hash, role } =
      input;
    const isValid = this.telegramService.verifyTelegramLoginWidget({
      id,
      first_name,
      last_name,
      username,
      photo_url: input.photo_url,
      auth_date,
      hash,
    });

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid Telegram login data: hash mismatch',
      );
    }

    const userRole = (role as UserRole) || 'DOCTOR';
    const user = await this.userRepo.upsertByTelegram({
      telegramId: id.toString(),
      telegramUsername: username,
      firstName: first_name,
      lastName: last_name,
      role: userRole,
    });

    return this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      isNewUser: user.isNewUser,
    });
  }
}

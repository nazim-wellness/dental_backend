import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export type AppConfig = {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly appUrl: string;
  readonly databaseUrl: string;
  readonly jwtSecret: string;
  readonly jwtRefreshSecret: string;
  readonly admin: {
    readonly email: string;
    readonly password: string;
    readonly cookieSecret: string;
    readonly sessionSecret: string;
    readonly rootPath: string;
  };
  readonly payment: {
    readonly url: string;
    readonly redirectUrlUser: string;
    readonly redirectUrl: string;
    readonly login: string;
    readonly password: string;
  };
  readonly telegramBotToken: string;
  readonly aws: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly region: string;
    readonly s3Bucket: string;
    readonly s3PublicUrl: string;
    readonly s3Endpoint: string;
  };
  readonly firebase: {
    readonly projectId: string;
    readonly privateKey: string;
    readonly clientEmail: string;
  };
  readonly smsRu: {
    readonly apiId: string;
  };
};

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  getAppConfig(): AppConfig {
    const logger = new Logger(ConfigService.name);
    const nodeEnv = this.nestConfigService.get<
      'development' | 'test' | 'production'
    >('NODE_ENV', 'development');
    const defaultJwtSecret =
      nodeEnv === 'production'
        ? ''
        : 'development-jwt-secret-not-for-production-use';
    const defaultRefreshSecret =
      nodeEnv === 'production'
        ? ''
        : 'development-refresh-secret-not-for-production-use';
    const defaultTelegramBotToken =
      nodeEnv === 'production'
        ? ''
        : '0000000000:DEV_BOT_TOKEN_NOT_FOR_PRODUCTION';
    const defaultAdminEmail: string =
      nodeEnv === 'production' ? '' : 'admin@local.dev';
    const defaultAdminPassword: string =
      nodeEnv === 'production' ? '' : 'admin';
    const defaultAdminCookieSecret: string =
      nodeEnv === 'production' ? '' : 'development-admin-cookie-secret';
    const defaultAdminSessionSecret: string =
      nodeEnv === 'production' ? '' : 'development-admin-session-secret';
    const defaultAdminRootPath: string = '/admin';
    const defaultPaymentUrl: string =
      nodeEnv === 'production' ? '' : 'https://api.yookassa.ru/v3/payments';

    const s3Endpoint = this.nestConfigService.get<string>('AWS_S3_ENDPOINT');
    logger.log(`AWS_S3_ENDPOINT из env: ${s3Endpoint ?? 'не задан'}`, 'Config');
    logger.log(
      `AWS_S3_ENDPOINT из process.env: ${process.env.AWS_S3_ENDPOINT ?? 'не задан'}`,
      'Config',
    );

    const defaultAppUrl: string =
      nodeEnv === 'production' ? '' : 'http://localhost:3000';
    return {
      nodeEnv,
      port: this.nestConfigService.get<number>('PORT', 3000),
      appUrl: this.nestConfigService.get<string>('APP_URL') ?? defaultAppUrl,
      databaseUrl: this.nestConfigService.get<string>('DATABASE_URL', ''),
      jwtSecret:
        this.nestConfigService.get<string>('JWT_SECRET') ?? defaultJwtSecret,
      jwtRefreshSecret:
        this.nestConfigService.get<string>('JWT_REFRESH_SECRET') ??
        defaultRefreshSecret,
      admin: {
        email:
          this.nestConfigService.get<string>('ADMIN_EMAIL') ??
          defaultAdminEmail,
        password:
          this.nestConfigService.get<string>('ADMIN_PASSWORD') ??
          defaultAdminPassword,
        cookieSecret:
          this.nestConfigService.get<string>('ADMIN_COOKIE_SECRET') ??
          defaultAdminCookieSecret,
        sessionSecret:
          this.nestConfigService.get<string>('ADMIN_SESSION_SECRET') ??
          defaultAdminSessionSecret,
        rootPath:
          this.nestConfigService.get<string>('ADMIN_ROOT_PATH') ??
          defaultAdminRootPath,
      },
      payment: {
        url:
          this.nestConfigService.get<string>('PAYMENT_URL') ??
          defaultPaymentUrl,
        redirectUrlUser:
          this.nestConfigService.get<string>('PAYMENT_REDIRECT_URL_USER') ?? '',
        redirectUrl:
          this.nestConfigService.get<string>('PAYMENT_REDIRECT_URL') ?? '',
        login: this.nestConfigService.get<string>('PAYMENT_LOGIN') ?? '',
        password: this.nestConfigService.get<string>('PAYMENT_PASSWORD') ?? '',
      },
      telegramBotToken:
        this.nestConfigService.get<string>('TELEGRAM_BOT_TOKEN') ??
        defaultTelegramBotToken,
      aws: {
        accessKeyId: this.nestConfigService.get<string>(
          'AWS_ACCESS_KEY_ID',
          '',
        ),
        secretAccessKey: this.nestConfigService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
        region: this.nestConfigService.get<string>('AWS_REGION', 'us-east-1'),
        s3Bucket: this.nestConfigService.get<string>('AWS_S3_BUCKET', ''),
        s3PublicUrl: this.nestConfigService.get<string>(
          'AWS_S3_PUBLIC_URL',
          '',
        ),
        s3Endpoint: this.nestConfigService.get<string>('AWS_S3_ENDPOINT') || '',
      },
      firebase: {
        projectId: this.nestConfigService.get<string>(
          'FIREBASE_PROJECT_ID',
          '',
        ),
        privateKey: this.nestConfigService
          .get<string>('FIREBASE_PRIVATE_KEY', '')
          .replace(/\\n/g, '\n'),
        clientEmail: this.nestConfigService.get<string>(
          'FIREBASE_CLIENT_EMAIL',
          '',
        ),
      },
      smsRu: {
        apiId: this.nestConfigService.get<string>('SMS_RU_API_ID', ''),
      },
    };
  }
}

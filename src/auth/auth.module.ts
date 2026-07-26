import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailAuthController } from './email-auth.controller';
import { TelegramAuthController } from './telegram-auth.controller';
import { SmsService } from './sms.service';
import { TelegramService } from './telegram.service';
import { UserRepository } from '../repositories/user.repository';
import { OtpCodeRepository } from '../repositories/otp-code.repository';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { jwtSecret } = configService.getAppConfig();
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '12h' },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    SmsService,
    TelegramService,
    UserRepository,
    OtpCodeRepository,
    JwtStrategy,
    TokenService,
  ],
  controllers: [AuthController, EmailAuthController, TelegramAuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}

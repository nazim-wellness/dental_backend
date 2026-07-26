import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpBody } from './dto/request-otp.dto';
import { VerifyOtpBody } from './dto/verify-otp.dto';
import { RefreshTokenBody } from './dto/refresh-token.dto';
import { TokenResponse } from './token.service';

@ApiTags('Авторизация по телефону')
@Controller('auth/phone')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  @ApiOperation({ summary: 'Запросить OTP-код для указанного номера телефона' })
  @ApiResponse({
    status: 201,
    description: 'OTP отправлен. В непроизводственной среде возвращается код.',
  })
  async requestOtp(@Body() body: RequestOtpBody): Promise<{ code?: string }> {
    return this.authService.requestOtp(body);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Проверить OTP-код и создать/обновить пользователя',
  })
  @ApiResponse({
    status: 200,
    description:
      'Успешная проверка и вход. Возвращает access и refresh токены. ' +
      'isNewUser=true если это новая регистрация, false если повторный вход.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        isNewUser: {
          type: 'boolean',
          description: 'true = новая регистрация, false = повторный вход',
        },
      },
    },
  })
  async verifyOtp(@Body() body: VerifyOtpBody): Promise<TokenResponse> {
    return this.authService.verifyOtp(body);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Обновить access и refresh токены',
  })
  @ApiResponse({
    status: 200,
    description:
      'Успешное обновление токенов. Возвращает новые access и refresh токены. ' +
      'isNewUser=false при обновлении токенов.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        isNewUser: {
          type: 'boolean',
          description: 'Всегда false при обновлении токенов',
          example: false,
        },
      },
    },
  })
  async refreshTokens(@Body() body: RefreshTokenBody): Promise<TokenResponse> {
    return this.authService.refreshTokens(body);
  }
}

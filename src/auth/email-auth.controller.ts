import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterEmailBody } from './dto/register-email.dto';
import { LoginEmailBody } from './dto/login-email.dto';
import {
  RequestEmailCodeBody,
  VerifyEmailCodeBody,
} from './dto/email-code.dto';
import { TokenResponse } from './token.service';

@ApiTags('Авторизация по email')
@Controller('auth/email')
export class EmailAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация по email, паролю и телефону' })
  @ApiResponse({
    status: 201,
    description: 'Успешная регистрация. Возвращает access и refresh токены.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        isNewUser: { type: 'boolean', example: true },
      },
    },
  })
  async register(@Body() body: RegisterEmailBody): Promise<TokenResponse> {
    return this.authService.registerWithEmail(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход. Возвращает access и refresh токены.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        isNewUser: { type: 'boolean', example: false },
      },
    },
  })
  async login(@Body() body: LoginEmailBody): Promise<TokenResponse> {
    return this.authService.loginWithEmail(body);
  }

  @Post('request-code')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Запросить код входа на email (без пароля)',
    description:
      'Отправляет 6-значный код на указанный email. Код действует 5 минут.',
  })
  @ApiResponse({ status: 200, description: 'Код отправлен' })
  @ApiResponse({ status: 429, description: 'Слишком много запросов' })
  async requestCode(
    @Body() body: RequestEmailCodeBody,
  ): Promise<{ code?: string }> {
    return this.authService.requestEmailCode(body);
  }

  @Post('verify-code')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Подтвердить код из письма и войти',
    description:
      'Проверяет код и создаёт/находит пользователя по email. Возвращает токены.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход. Возвращает access и refresh токены.',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        isNewUser: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверный или просроченный код' })
  async verifyCode(@Body() body: VerifyEmailCodeBody): Promise<TokenResponse> {
    return this.authService.verifyEmailCode(body);
  }
}

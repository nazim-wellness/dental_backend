import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterEmailBody } from './dto/register-email.dto';
import { LoginEmailBody } from './dto/login-email.dto';
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
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthBody } from './dto/telegram-auth.dto';
import { TelegramLoginBody } from './dto/telegram-login.dto';
import { TokenResponse } from './token.service';

@ApiTags('Авторизация через Telegram')
@Controller('auth/telegram')
export class TelegramAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Авторизоваться или зарегистрироваться через Telegram WebApp',
    description:
      'Принимает initData от Telegram WebApp, проверяет подлинность данных и создает/обновляет пользователя',
  })
  @ApiResponse({
    status: 200,
    description:
      'Успешная авторизация. Возвращает access и refresh токены. ' +
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
  @ApiResponse({
    status: 401,
    description:
      'Неверные данные от Telegram (hash mismatch или истек срок действия)',
  })
  async authWithTelegram(
    @Body() body: TelegramAuthBody,
  ): Promise<TokenResponse> {
    return this.authService.authWithTelegram(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Авторизоваться через Telegram Login Widget',
    description:
      'Принимает данные от Telegram Login Widget, проверяет подлинность через hash и создает/обновляет пользователя',
  })
  @ApiResponse({
    status: 200,
    description:
      'Успешная авторизация. Возвращает access и refresh токены. ' +
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
  @ApiResponse({
    status: 401,
    description:
      'Неверные данные от Telegram (hash mismatch или истек срок действия)',
  })
  async loginWithTelegramWidget(
    @Body() body: TelegramLoginBody,
  ): Promise<TokenResponse> {
    return this.authService.loginWithTelegramWidget(body);
  }
}

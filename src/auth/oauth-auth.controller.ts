import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OAuthCodeBody } from './dto/oauth-code.dto';
import { TokenResponse } from './token.service';

const tokenResponseSchema = {
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    isNewUser: {
      type: 'boolean',
      description: 'true = новая регистрация, false = повторный вход',
    },
  },
};

@ApiTags('Авторизация через Яндекс ID / VK ID')
@Controller('auth')
export class OAuthAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('yandex')
  @ApiOperation({
    summary: 'Авторизоваться или зарегистрироваться через Яндекс ID',
    description:
      'Принимает code от Яндекса, обменивает его на профиль и создаёт/обновляет пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация. Возвращает access и refresh токены.',
    schema: tokenResponseSchema,
  })
  @ApiResponse({ status: 401, description: 'Не удалось подтвердить вход' })
  async yandex(@Body() body: OAuthCodeBody): Promise<TokenResponse> {
    return this.authService.loginWithYandex(body);
  }

  @Post('vk')
  @ApiOperation({
    summary: 'Авторизоваться или зарегистрироваться через VK ID',
    description:
      'Принимает code от ВКонтакте, обменивает его на профиль и создаёт/обновляет пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация. Возвращает access и refresh токены.',
    schema: tokenResponseSchema,
  })
  @ApiResponse({ status: 401, description: 'Не удалось подтвердить вход' })
  async vk(@Body() body: OAuthCodeBody): Promise<TokenResponse> {
    return this.authService.loginWithVk(body);
  }
}

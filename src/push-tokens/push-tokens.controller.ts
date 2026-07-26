import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PushTokensService } from './push-tokens.service';
import { SavePushTokenDto } from './dto/save-push-token.dto';
import { PushTokenDto } from './dto/push-token.dto';
import { SendTestPushDto } from './dto/send-test-push.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('Push токены')
@Controller('push-tokens')
export class PushTokensController {
  constructor(private readonly pushTokensService: PushTokensService) {}

  @Post()
  @ApiOperation({
    summary: 'Сохранить или обновить push токен',
    description:
      'Сохранить push токен для устройства пользователя. ' +
      'Если токен с таким deviceId уже существует для пользователя, он будет обновлен.',
  })
  @ApiResponse({
    status: 201,
    description: 'Push токен успешно сохранен или обновлен',
    type: PushTokenDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiBearerAuth('Auth')
  @UseGuards(JwtAuthGuard)
  async saveToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SavePushTokenDto,
  ): Promise<PushTokenDto> {
    return this.pushTokensService.saveToken(user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все push токены пользователя',
    description:
      'Получить список всех активных push токенов текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Список push токенов пользователя',
    type: [PushTokenDto],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiBearerAuth('Auth')
  @UseGuards(JwtAuthGuard)
  async getUserTokens(
    @CurrentUser() user: JwtPayload,
  ): Promise<PushTokenDto[]> {
    return this.pushTokensService.getUserTokens(user.userId);
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить push токен для устройства',
    description: 'Удалить push токен для конкретного устройства пользователя',
  })
  @ApiResponse({
    status: 204,
    description: 'Push токен успешно удален',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiBearerAuth('Auth')
  @UseGuards(JwtAuthGuard)
  async deleteToken(
    @CurrentUser() user: JwtPayload,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    await this.pushTokensService.deleteToken(user.userId, deviceId);
  }

  @Post('test')
  @ApiOperation({
    summary: 'Отправить тестовое push-уведомление',
    description:
      'Отправить тестовое push-уведомление на все устройства текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Тестовое уведомление отправлено',
    schema: {
      properties: {
        sent: { type: 'number', example: 2 },
        failed: { type: 'number', example: 0 },
        messageIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['message-id-1', 'message-id-2'],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 400,
    description: 'Firebase не настроен или у пользователя нет устройств',
  })
  async sendTestPush(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendTestPushDto,
  ): Promise<{ sent: number; failed: number; messageIds: string[] }> {
    return this.pushTokensService.sendTestPush(17, dto);
  }
}

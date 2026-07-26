import { Injectable, BadRequestException } from '@nestjs/common';
import { PushTokenRepository } from '../repositories/push-token.repository';
import { FirebaseService } from './firebase.service';
import { SavePushTokenDto } from './dto/save-push-token.dto';
import { PushTokenDto } from './dto/push-token.dto';
import { SendTestPushDto } from './dto/send-test-push.dto';

/**
 * Сервис для работы с push токенами Firebase
 */
@Injectable()
export class PushTokensService {
  constructor(
    private readonly pushTokenRepo: PushTokenRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Сохранить или обновить push токен для устройства пользователя
   * Если токен с таким deviceId и userId уже существует, он будет обновлен
   */
  async saveToken(
    userId: number,
    dto: SavePushTokenDto,
  ): Promise<PushTokenDto> {
    const record = await this.pushTokenRepo.upsert({
      userId,
      deviceId: dto.deviceId,
      token: dto.token,
    });

    return this.mapToDto(record);
  }

  /**
   * Получить все активные push токены пользователя
   */
  async getUserTokens(userId: number): Promise<PushTokenDto[]> {
    const records = await this.pushTokenRepo.findByUserId(userId);
    return records.map((record) => this.mapToDto(record));
  }

  /**
   * Удалить push токен для конкретного устройства пользователя
   */
  async deleteToken(userId: number, deviceId: string): Promise<void> {
    await this.pushTokenRepo.delete(userId, deviceId);
  }

  /**
   * Отправить тестовое push-уведомление на все устройства пользователя
   */
  async sendTestPush(
    userId: number,
    dto: SendTestPushDto,
  ): Promise<{ sent: number; failed: number; messageIds: string[] }> {
    if (!this.firebaseService.isInitialized()) {
      throw new BadRequestException(
        'Firebase не настроен. Проверьте конфигурацию FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL',
      );
    }

    const tokens = await this.pushTokenRepo.findByUserId(userId);
    if (tokens.length === 0) {
      throw new BadRequestException(
        'У пользователя нет зарегистрированных устройств',
      );
    }

    const fcmTokens = tokens.map((t) => t.token);
    const response = await this.firebaseService.sendMulticast(
      fcmTokens,
      dto.title,
      dto.body,
      dto.data,
    );

    return {
      sent: response.successCount,
      failed: response.failureCount,
      messageIds: response.responses
        .filter((r) => r.success)
        .map((r) => r.messageId || ''),
    };
  }

  /**
   * Отправить тестовое push-уведомление на конкретный токен
   */
  async sendTestPushToToken(
    token: string,
    dto: SendTestPushDto,
  ): Promise<string> {
    if (!this.firebaseService.isInitialized()) {
      throw new BadRequestException(
        'Firebase не настроен. Проверьте конфигурацию FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL',
      );
    }

    const messageId = await this.firebaseService.sendNotification(
      token,
      dto.title,
      dto.body,
      dto.data,
    );

    return messageId;
  }

  private mapToDto(record: {
    readonly id: number;
    readonly userId: number;
    readonly deviceId: string;
    readonly token: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }): PushTokenDto {
    return {
      id: record.id,
      userId: record.userId,
      deviceId: record.deviceId,
      token: record.token,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

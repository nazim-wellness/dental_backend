import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../config/config.service';

/**
 * Сервис для работы с Firebase Admin SDK
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const { firebase } = this.configService.getAppConfig();

    // Инициализируем Firebase только если есть конфигурация
    if (firebase.projectId && firebase.privateKey && firebase.clientEmail) {
      try {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebase.projectId,
            privateKey: firebase.privateKey,
            clientEmail: firebase.clientEmail,
          }),
        });
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
      }
    }
  }

  /**
   * Отправить push-уведомление на одно устройство
   */
  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string> {
    if (!this.app) {
      throw new Error('Firebase не инициализирован. Проверьте конфигурацию.');
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Отправить push-уведомление на несколько устройств
   */
  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.app) {
      throw new Error('Firebase не инициализирован. Проверьте конфигурацию.');
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      return response;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  /**
   * Проверить, инициализирован ли Firebase
   */
  isInitialized(): boolean {
    return this.app !== null;
  }
}

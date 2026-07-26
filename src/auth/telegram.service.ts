import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, createHash } from 'node:crypto';
import { ConfigService } from '../config/config.service';

export type TelegramUserData = {
  readonly id: number;
  readonly first_name: string;
  readonly last_name?: string;
  readonly username?: string;
  readonly photo_url?: string;
  readonly auth_date: number;
  readonly hash: string;
};

export type ParsedTelegramData = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly username?: string;
  readonly authDate: number;
};

@Injectable()
export class TelegramService {
  private readonly botToken: string;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.getAppConfig().telegramBotToken;
  }

  /**
   * Парсит initData строку от Telegram WebApp
   * @param initData - строка формата "key=value&key2=value2&hash=..." или "user=%7B%22id%22%3A...%7D&auth_date=...&hash=..."
   */
  parseInitData(initData: string): TelegramUserData {
    const params = new URLSearchParams(initData);
    const authDate = params.get('auth_date');
    const hash = params.get('hash');

    if (!authDate || !hash) {
      throw new UnauthorizedException(
        'Invalid Telegram initData: missing required fields (auth_date, hash)',
      );
    }

    // Пробуем получить данные из объекта user (новый формат) или из отдельных полей (старый формат)
    const userParam = params.get('user');
    let id: number;
    let firstName: string;
    let lastName: string | undefined;
    let username: string | undefined;
    let photoUrl: string | undefined;

    if (userParam) {
      // Новый формат: user содержит JSON объект
      try {
        const user = JSON.parse(decodeURIComponent(userParam)) as {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
          photo_url?: string;
        };
        id = user.id;
        firstName = user.first_name;
        lastName = user.last_name;
        username = user.username;
        photoUrl = user.photo_url;
      } catch (err) {
        console.log(err);
        throw new UnauthorizedException(
          'Invalid Telegram initData: cannot parse user object',
        );
      }
    } else {
      // Старый формат: отдельные поля
      const idParam = params.get('id');
      const firstNameParam = params.get('first_name');

      if (!idParam || !firstNameParam) {
        throw new UnauthorizedException(
          'Invalid Telegram initData: missing required fields (id, first_name)',
        );
      }

      id = Number.parseInt(idParam, 10);
      firstName = firstNameParam;
      lastName = params.get('last_name') ?? undefined;
      username = params.get('username') ?? undefined;
      photoUrl = params.get('photo_url') ?? undefined;
    }

    return {
      id,
      first_name: firstName,
      last_name: lastName,
      username,
      photo_url: photoUrl,
      auth_date: Number.parseInt(authDate, 10),
      hash,
    };
  }

  /**
   * Проверяет подлинность данных от Telegram WebApp
   * @param initData - исходная строка initData от Telegram
   * @param data - распарсенные данные от Telegram
   * @returns true если данные подлинные
   */
  verifyTelegramData(initData: string, data: TelegramUserData): boolean {
    // Проверяем, что данные не старше 24 часов
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 часа в секундах
    if (currentTime - data.auth_date > maxAge) {
      return false;
    }

    // Создаем секретный ключ для HMAC
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    // Извлекаем все параметры кроме hash из исходной строки
    const urlParams = new URLSearchParams(initData);
    urlParams.delete('hash');

    // Сортируем параметры по ключу и создаем строку "key=value"
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Вычисляем hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем с полученным hash
    return calculatedHash === data.hash;
  }

  /**
   * Проверяет и парсит initData от Telegram WebApp
   * @param initData - строка initData от Telegram
   * @returns распарсенные и проверенные данные пользователя
   */
  verifyAndParseInitData(initData: string): ParsedTelegramData {
    const data = this.parseInitData(initData);

    if (!this.verifyTelegramData(initData, data)) {
      throw new UnauthorizedException('Invalid Telegram data: hash mismatch');
    }

    return {
      id: data.id.toString(),
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username,
      authDate: data.auth_date,
    };
  }

  /**
   * Проверяет подлинность данных от Telegram Login Widget
   * Алгоритм согласно https://core.telegram.org/widgets/login
   * @param data - данные от Telegram Login Widget
   * @returns true если данные подлинные
   */
  verifyTelegramLoginWidget(data: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }): boolean {
    // Проверяем, что данные не старше 24 часов
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 часа в секундах
    if (currentTime - data.auth_date > maxAge) {
      return false;
    }

    // Создаем секретный ключ: SHA256(bot_token)
    const secretKey = createHash('sha256').update(this.botToken).digest();

    // Создаем data-check-string: все поля кроме hash, отсортированные по ключу
    const checkData: Record<string, string> = {};
    if (data.id) checkData.id = data.id.toString();
    if (data.first_name) checkData.first_name = data.first_name;
    if (data.last_name) checkData.last_name = data.last_name;
    if (data.username) checkData.username = data.username;
    if (data.photo_url) checkData.photo_url = data.photo_url;
    checkData.auth_date = data.auth_date.toString();

    // Сортируем и создаем строку в формате "key=value\nkey2=value2"
    const dataCheckString = Object.keys(checkData)
      .sort()
      .map((key) => `${key}=${checkData[key]}`)
      .join('\n');

    // Вычисляем hash: HMAC-SHA256(data-check-string, secret_key)
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем с полученным hash
    return calculatedHash === data.hash;
  }
}

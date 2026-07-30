import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

/**
 * Нормализованные данные пользователя, полученные от внешнего провайдера
 * (Яндекс ID / VK ID). providerId — стабильный идентификатор аккаунта у
 * провайдера, по нему связываем/создаём пользователя в нашей базе.
 */
export type OAuthUserInfo = {
  readonly providerId: string;
  readonly email: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
};

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(private readonly config: ConfigService) {}

  private redirectUri(provider: 'yandex' | 'vk', override?: string): string {
    if (override && override.length > 0) return override;
    const base = this.config
      .getAppConfig()
      .oauth.redirectBase.replace(/\/+$/, '');
    return `${base}/api/auth/${provider}/callback`;
  }

  /**
   * Обмен кода авторизации Яндекса на данные пользователя.
   * Поток: code -> access_token (oauth.yandex.ru/token) -> профиль
   * (login.yandex.ru/info).
   */
  async fetchYandexUser(
    code: string,
    redirectUriOverride?: string,
  ): Promise<OAuthUserInfo> {
    const { clientId, clientSecret } = this.config.getAppConfig().oauth.yandex;
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Вход через Яндекс не настроен');
    }

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: this.redirectUri('yandex', redirectUriOverride),
    });

    const tokenRes = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      this.logger.warn(`Яндекс token error ${tokenRes.status}: ${text}`);
      throw new UnauthorizedException(
        'Не удалось подтвердить вход через Яндекс',
      );
    }
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('Яндекс не вернул токен доступа');
    }

    const infoRes = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${accessToken}` },
    });
    if (!infoRes.ok) {
      const text = await infoRes.text();
      this.logger.warn(`Яндекс info error ${infoRes.status}: ${text}`);
      throw new UnauthorizedException('Не удалось получить профиль Яндекса');
    }
    const info = (await infoRes.json()) as {
      id?: string;
      default_email?: string;
      first_name?: string;
      last_name?: string;
    };
    if (!info.id) {
      throw new UnauthorizedException(
        'Яндекс не вернул идентификатор аккаунта',
      );
    }

    return {
      providerId: info.id,
      email: info.default_email ?? null,
      firstName: info.first_name ?? null,
      lastName: info.last_name ?? null,
    };
  }

  /**
   * Обмен кода авторизации ВКонтакте на данные пользователя (классический
   * OAuth web-приложения). Поток: code -> access_token+email
   * (oauth.vk.com/access_token) -> ФИО (api.vk.com/method/users.get).
   */
  async fetchVkUser(
    code: string,
    redirectUriOverride?: string,
  ): Promise<OAuthUserInfo> {
    const { clientId, clientSecret } = this.config.getAppConfig().oauth.vk;
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Вход через ВКонтакте не настроен');
    }

    const tokenUrl = new URL('https://oauth.vk.com/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set(
      'redirect_uri',
      this.redirectUri('vk', redirectUriOverride),
    );
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      this.logger.warn(`VK token error ${tokenRes.status}: ${text}`);
      throw new UnauthorizedException(
        'Не удалось подтвердить вход через ВКонтакте',
      );
    }
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      user_id?: number;
      email?: string;
    };
    if (!tokenJson.access_token || !tokenJson.user_id) {
      throw new UnauthorizedException('ВКонтакте не вернул токен доступа');
    }

    const providerId = String(tokenJson.user_id);
    const email = tokenJson.email ?? null;

    let firstName: string | null = null;
    let lastName: string | null = null;
    try {
      const usersUrl = new URL('https://api.vk.com/method/users.get');
      usersUrl.searchParams.set('user_ids', providerId);
      usersUrl.searchParams.set('fields', 'first_name,last_name');
      usersUrl.searchParams.set('access_token', tokenJson.access_token);
      usersUrl.searchParams.set('v', '5.199');
      const usersRes = await fetch(usersUrl.toString());
      if (usersRes.ok) {
        const usersJson = (await usersRes.json()) as {
          response?: Array<{ first_name?: string; last_name?: string }>;
        };
        const first = usersJson.response?.[0];
        firstName = first?.first_name ?? null;
        lastName = first?.last_name ?? null;
      }
    } catch (err) {
      // ФИО — не критично для входа; логируем и продолжаем.
      this.logger.warn(`VK users.get failed: ${String(err)}`);
    }

    return { providerId, email, firstName, lastName };
  }
}

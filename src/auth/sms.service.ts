import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

type SmsRuResponse = {
  status: 'OK' | 'ERROR';
  status_code: number;
  status_text?: string;
  sms?: Record<
    string,
    {
      status: 'OK' | 'ERROR';
      status_code: number;
      status_text?: string;
      sms_id?: string;
    }
  >;
  balance?: number;
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = 'https://sms.ru/sms/send';

  constructor(private readonly config: ConfigService) {}

  /**
   * Отправить OTP код на указанный номер телефона
   */
  async sendOtp(phone: string, code: string): Promise<void> {
    const { nodeEnv, smsRu } = this.config.getAppConfig();
    if (nodeEnv === 'development') {
      this.logger.warn(
        `NODE_ENV=development: реальная SMS не отправляется (sms.ru). ${phone}, код: ${code}`,
      );
      return;
    }
    const { apiId } = smsRu;
    if (!apiId) {
      this.logger.error('SMS_RU_API_ID не настроен');
      throw new Error('SMS service не настроен');
    }
    const message = `Ваш код подтверждения: ${code}`;
    try {
      const response = await this.sendSms({
        apiId,
        to: phone,
        msg: message,
      });
      if (response.status === 'OK' && response.sms) {
        const phoneResponse = response.sms[phone];
        if (phoneResponse?.status === 'OK') {
          this.logger.log(
            `SMS отправлено на ${phone}, ID: ${phoneResponse.sms_id}`,
          );
        } else {
          this.logger.error(
            `Ошибка отправки SMS на ${phone}: ${phoneResponse?.status_text || 'Unknown error'}`,
          );
          throw new Error(
            `Не удалось отправить SMS: ${phoneResponse?.status_text || 'Unknown error'}`,
          );
        }
      } else {
        this.logger.error(
          `Ошибка SMS.RU API: ${response.status_text || 'Unknown error'}`,
        );
        throw new Error(
          `Ошибка SMS.RU API: ${response.status_text || 'Unknown error'}`,
        );
      }
    } catch (error) {
      this.logger.error(`Ошибка при отправке SMS на ${phone}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Не удалось отправить SMS на ${phone}: ${errorMessage}`);
    }
  }

  /**
   * Отправить SMS через SMS.RU API
   */
  private async sendSms(params: {
    apiId: string;
    to: string;
    msg: string;
  }): Promise<SmsRuResponse> {
    const formData = new URLSearchParams();
    formData.append('api_id', params.apiId);
    formData.append('to', params.to);
    formData.append('msg', params.msg);
    formData.append('json', '1');
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    if (!response.ok) {
      throw new Error(
        `SMS.RU API вернул статус ${response.status}: ${response.statusText}`,
      );
    }
    const data = (await response.json()) as SmsRuResponse;
    return data;
  }
}

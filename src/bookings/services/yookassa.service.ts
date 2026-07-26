import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '../../config/config.service';

type YookassaAmount = {
  readonly value: string;
  readonly currency: string;
};

type YookassaConfirmation = {
  readonly type: string;
  readonly confirmation_url?: string;
  readonly return_url?: string;
};

type YookassaPaymentResponse = {
  readonly id: string;
  readonly status: string;
  readonly paid: boolean;
  readonly amount: YookassaAmount;
  readonly confirmation?: YookassaConfirmation;
  readonly description?: string;
  readonly created_at?: string;
};

type YookassaReceiptItem = {
  readonly description: string;
  readonly quantity: number;
  readonly amount: { readonly value: string; readonly currency: string };
  readonly vat_code: number;
  readonly payment_mode: string;
  readonly payment_subject: string;
  readonly measure: string;
};

type YookassaReceiptCustomer = {
  readonly email?: string;
  readonly phone?: string;
};

type YookassaReceipt = {
  readonly customer: YookassaReceiptCustomer;
  readonly items: readonly YookassaReceiptItem[];
  readonly tax_system_code?: number;
};

type CreateYookassaPaymentParams = {
  readonly amount: string;
  readonly currency: string;
  readonly description: string;
  readonly returnUrl: string;
  readonly metadata: Record<string, string | number>;
  readonly paymentToken?: string;
  readonly paymentMethodType?: string;
  readonly receipt?: YookassaReceipt;
};

type CreateYookassaPaymentResult = {
  readonly providerPaymentId: string;
  readonly status: string;
  readonly amount: YookassaAmount;
  readonly confirmationUrl?: string;
  readonly paid: boolean;
};

/**
 * Сервис интеграции с ЮKassa.
 */
@Injectable()
export class YookassaService {
  private readonly logger = new Logger(YookassaService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Создать платеж в ЮKassa.
   */
  async createPayment(
    params: CreateYookassaPaymentParams,
  ): Promise<CreateYookassaPaymentResult> {
    const paymentConfig = this.configService.getAppConfig().payment;
    if (!paymentConfig.url || !paymentConfig.login || !paymentConfig.password) {
      this.logger.error('ЮKassa не настроена: отсутствуют credentials');
      throw new HttpException(
        'Платежный сервис не настроен',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const idempotenceKey: string = randomUUID();
    const payload = this.buildPaymentPayload(params);
    this.logger.log(
      `Создание платежа в ЮKassa: сумма=${params.amount} ${params.currency}, idempotence=${idempotenceKey}`,
    );
    const response = await fetch(paymentConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: this.buildAuthHeader(
          paymentConfig.login,
          paymentConfig.password,
        ),
      },
      body: JSON.stringify(payload),
    });
    const responseBody: unknown = await response.json();
    if (!response.ok) {
      this.logger.error(
        `Ошибка ЮKassa при создании платежа: status=${response.status}`,
      );
      throw new HttpException(
        'Ошибка при создании платежа',
        HttpStatus.BAD_GATEWAY,
      );
    }
    const payment = responseBody as YookassaPaymentResponse;
    if (!payment?.id) {
      this.logger.error('ЮKassa вернула ответ без id платежа');
      throw new HttpException(
        'Некорректный ответ платежного сервиса',
        HttpStatus.BAD_GATEWAY,
      );
    }
    this.logger.log(
      `Платеж ЮKassa создан: id=${payment.id}, status=${payment.status}`,
    );
    return {
      providerPaymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      confirmationUrl: payment.confirmation?.confirmation_url,
      paid: payment.paid,
    };
  }

  /**
   * Получить URL возврата пользователя.
   */
  getReturnUrl(): string {
    const paymentConfig = this.configService.getAppConfig().payment;
    return paymentConfig.redirectUrlUser || paymentConfig.redirectUrl;
  }

  /**
   * Собрать payload для создания платежа в ЮKassa.
   * Если передан paymentToken — используем payment_token (виджет),
   * иначе — payment_method_data + confirmation redirect.
   */
  private buildPaymentPayload(
    params: CreateYookassaPaymentParams,
  ): Record<string, unknown> {
    const base: Record<string, unknown> = {
      amount: {
        value: params.amount,
        currency: params.currency,
      },
      capture: true,
      metadata: params.metadata,
      description: params.description,
    };
    if (params.receipt) {
      base.receipt = this.buildReceiptPayload(params.receipt);
    }
    if (params.paymentToken) {
      base.payment_token = params.paymentToken;
      base.confirmation = {
        type: 'redirect',
        return_url: params.returnUrl,
      };
      return base;
    }
    base.payment_method_data = {
      type: params.paymentMethodType ?? 'bank_card',
    };
    base.confirmation = {
      type: 'redirect',
      return_url: params.returnUrl,
    };
    return base;
  }

  private buildReceiptPayload(
    receipt: YookassaReceipt,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      customer: receipt.customer,
      items: receipt.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount: item.amount,
        vat_code: item.vat_code,
        payment_mode: item.payment_mode,
        payment_subject: item.payment_subject,
        measure: item.measure,
      })),
    };
    if (receipt.tax_system_code !== undefined) {
      payload.tax_system_code = receipt.tax_system_code;
    }
    return payload;
  }

  private buildAuthHeader(login: string, password: string): string {
    const credentials = Buffer.from(`${login}:${password}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Создать объект чека для оплаты семинара (54-ФЗ).
   * Возвращает null, если нет контактных данных покупателя (email или телефон).
   */
  buildSeminarReceipt(params: {
    readonly customerPhone?: string | null;
    readonly customerEmail?: string | null;
    readonly description: string;
    readonly amount: string;
    readonly currency: string;
    readonly taxSystemCode?: number;
  }): YookassaReceipt | null {
    const customer: YookassaReceiptCustomer = {
      ...(params.customerEmail && { email: params.customerEmail }),
      ...(params.customerPhone && { phone: params.customerPhone }),
    };
    if (!customer.email && !customer.phone) {
      return null;
    }
    const items: YookassaReceiptItem[] = [
      {
        description: params.description,
        quantity: 1,
        amount: {
          value: params.amount,
          currency: params.currency,
        },
        vat_code: 1,
        payment_mode: 'full_prepayment',
        payment_subject: 'service',
        measure: 'piece',
      },
    ];
    const receipt: YookassaReceipt = {
      customer,
      items,
      ...(params.taxSystemCode !== undefined && {
        tax_system_code: params.taxSystemCode,
      }),
    };
    return receipt;
  }
}

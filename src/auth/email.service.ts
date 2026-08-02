import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): Transporter | null {
    const { host, port, secure, user, password } =
      this.config.getAppConfig().smtp;
    if (!host || !user || !password) {
      return null;
    }
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass: password },
      });
    }
    return this.transporter;
  }

  /**
   * Отправить письмо с кодом входа. В dev/test окружении, если SMTP не
   * настроен, письмо не отправляется (код возвращается вызывающему коду для
   * ручной проверки — как в SMS-потоке).
   */
  async sendLoginCode(email: string, code: string): Promise<void> {
    const transporter = this.getTransporter();
    const nodeEnv = this.config.getAppConfig().nodeEnv;

    if (!transporter) {
      if (nodeEnv === 'production') {
        this.logger.error('SMTP не настроен — письмо с кодом не отправлено');
      } else {
        this.logger.warn(
          `SMTP не настроен (${nodeEnv}): письмо не отправляется. ${email}, код: ${code}`,
        );
      }
      return;
    }

    const from = this.config.getAppConfig().smtp.from;
    const subject = 'Код для входа в EventDental';
    const text = `Ваш код для входа в EventDental: ${code}\n\nКод действует 5 минут. Если вы не запрашивали вход, просто проигнорируйте это письмо.`;
    const html =
      `<p>Ваш код для входа в <b>EventDental</b>:</p>` +
      `<p style="font-size:24px;font-weight:bold;letter-spacing:3px">${code}</p>` +
      `<p>Код действует 5 минут. Если вы не запрашивали вход, просто проигнорируйте это письмо.</p>`;

    await transporter.sendMail({ from, to: email, subject, text, html });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Репозиторий для работы с оплатами семинаров.
 */
@Injectable()
export class SeminarPaymentRepository {
  private readonly logger = new Logger(SeminarPaymentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPendingPayment(params: {
    readonly seminarId: number;
    readonly userId: number;
    readonly providerPaymentId: string;
    readonly amount: number;
    readonly currency: string;
    readonly confirmationUrl?: string;
    readonly description?: string;
    readonly metadata?: Record<string, string | number>;
  }): Promise<{ id: number }> {
    const paymentModel = this.getPaymentModel();
    return await paymentModel.create({
      data: {
        seminarId: params.seminarId,
        userId: params.userId,
        provider: 'YOOKASSA',
        providerPaymentId: params.providerPaymentId,
        status: 'PENDING',
        amount: params.amount,
        currency: params.currency,
        confirmationUrl: params.confirmationUrl,
        description: params.description,
        metadata: params.metadata,
      },
      select: {
        id: true,
      },
    });
  }

  async findByProviderPaymentId(providerPaymentId: string): Promise<{
    id: number;
    seminarId: number;
    userId: number;
    status: string;
  } | null> {
    const paymentModel = this.getPaymentModel();
    return await paymentModel.findUnique({
      where: {
        providerPaymentId,
      },
      select: {
        id: true,
        seminarId: true,
        userId: true,
        status: true,
      },
    });
  }

  async updateStatusByProviderPaymentId(params: {
    readonly providerPaymentId: string;
    readonly status: string;
    readonly confirmationUrl?: string;
    readonly paidAt?: Date;
    readonly cancelledAt?: Date;
  }): Promise<void> {
    const paymentModel = this.getPaymentModel();
    await paymentModel.update({
      where: {
        providerPaymentId: params.providerPaymentId,
      },
      data: {
        status: params.status,
        confirmationUrl: params.confirmationUrl,
        paidAt: params.paidAt,
        cancelledAt: params.cancelledAt,
      },
    });
  }

  /**
   * Получить ID оплаченного платежа по семинару и пользователю.
   */
  async findPaidPaymentId(
    seminarId: number,
    userId: number,
  ): Promise<number | null> {
    const paymentModel = this.getPaymentModel();
    const payment = await paymentModel.findFirst({
      where: {
        seminarId,
        userId,
        status: 'SUCCEEDED',
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    return payment?.id ?? null;
  }

  private getPaymentModel(): {
    create: typeof this.prisma.seminarPayment.create;
    findUnique: typeof this.prisma.seminarPayment.findUnique;
    findFirst: typeof this.prisma.seminarPayment.findFirst;
    update: typeof this.prisma.seminarPayment.update;
  } {
    const paymentModel = this.prisma.seminarPayment;
    if (!paymentModel) {
      this.logger.error(
        'Prisma модель SeminarPayment недоступна. Проверьте prisma generate и миграции.',
      );
      throw new Error('Модель SeminarPayment недоступна');
    }
    return paymentModel;
  }
}

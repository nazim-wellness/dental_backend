import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  BookingsRepository,
  BookingRecord,
} from './repositories/bookings.repository';
import { CartRepository } from '../cart/repositories/cart.repository';
import { SeminarRepository } from '../repositories/seminar.repository';
import { SeminarPaymentRepository } from '../repositories/seminar-payment.repository';
import { UserRepository } from '../repositories/user.repository';
import { BookingDto } from './dto/booking.dto';
import { CreateBookingPaymentDto } from './dto/create-booking-payment.dto';
import {
  PaginationParams,
  calculatePaginationMeta,
} from '../common/types/pagination.types';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { YookassaService } from './services/yookassa.service';
import { YookassaNotificationDto } from './dto/yookassa-notification.dto';

type PaymentStatus =
  | 'PENDING'
  | 'WAITING_FOR_CAPTURE'
  | 'SUCCEEDED'
  | 'CANCELED';

/**
 * Сервис для работы с бронированиями семинаров
 */
@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsRepo: BookingsRepository,
    private readonly cartRepo: CartRepository,
    private readonly seminarRepo: SeminarRepository,
    private readonly paymentRepo: SeminarPaymentRepository,
    private readonly userRepo: UserRepository,
    private readonly yookassaService: YookassaService,
  ) {}

  /**
   * Создать платеж для бронирования семинара.
   */
  async createBooking(
    seminarId: number,
    userId: number,
    paymentToken?: string,
    paymentMethodType?: string,
  ): Promise<CreateBookingPaymentDto> {
    this.logger.log(
      `Запрос на оплату бронирования: seminarId=${seminarId}, userId=${userId}`,
    );
    const seminar = await this.seminarRepo.findById(seminarId);
    if (!seminar) {
      throw new NotFoundException('Семинар не найден');
    }
    const isBooked = await this.bookingsRepo.isBooked(seminarId, userId);
    if (isBooked) {
      throw new ConflictException('Семинар уже забронирован');
    }
    const amountValue: string = Number(seminar.price).toFixed(2);
    const userContact = await this.userRepo.findContactById(userId);
    const receipt = this.yookassaService.buildSeminarReceipt({
      customerPhone: userContact?.phone ?? null,
      description: `Оплата семинара "${seminar.title}"`,
      amount: amountValue,
      currency: 'RUB',
    });
    const payment = await this.yookassaService.createPayment({
      amount: amountValue,
      currency: 'RUB',
      description: `Оплата семинара "${seminar.title}"`,
      returnUrl: this.yookassaService.getReturnUrl(),
      metadata: {
        seminarId,
        userId,
      },
      paymentToken,
      paymentMethodType,
      receipt: receipt ?? undefined,
    });
    const paymentRecord = await this.paymentRepo.createPendingPayment({
      seminarId,
      userId,
      providerPaymentId: payment.providerPaymentId,
      amount: Number(amountValue),
      currency: payment.amount.currency,
      confirmationUrl: payment.confirmationUrl,
      description: `Оплата семинара "${seminar.title}"`,
      metadata: {
        seminarId,
        userId,
      },
    });
    this.logger.log(
      `Платеж создан и сохранен: paymentId=${paymentRecord.id}, providerPaymentId=${payment.providerPaymentId}`,
    );
    return {
      paymentId: paymentRecord.id,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      confirmationUrl: payment.confirmationUrl,
    };
  }

  /**
   * Обработать уведомление от ЮKassa.
   */
  async handleYookassaNotification(
    notification: YookassaNotificationDto,
  ): Promise<void> {
    const providerPaymentId: string = notification.object.id;
    this.logger.log(
      `Уведомление ЮKassa: id=${providerPaymentId}, status=${notification.object.status}`,
    );
    const paymentRecord =
      await this.paymentRepo.findByProviderPaymentId(providerPaymentId);
    if (!paymentRecord) {
      this.logger.warn(
        `Платеж не найден для уведомления ЮKassa: id=${providerPaymentId}`,
      );
      return;
    }
    const paymentStatus = this.mapYookassaStatus(notification.object.status);
    const paidAt = paymentStatus === 'SUCCEEDED' ? new Date() : undefined;
    const cancelledAt = paymentStatus === 'CANCELED' ? new Date() : undefined;
    await this.paymentRepo.updateStatusByProviderPaymentId({
      providerPaymentId,
      status: paymentStatus,
      paidAt,
      cancelledAt,
    });
    this.logger.log(
      `Статус платежа обновлен: id=${providerPaymentId}, status=${paymentStatus}`,
    );
    if (paymentStatus !== 'SUCCEEDED') {
      return;
    }
    const isBooked = await this.bookingsRepo.isBooked(
      paymentRecord.seminarId,
      paymentRecord.userId,
    );
    if (isBooked) {
      this.logger.warn(
        `Бронирование уже существует: seminarId=${paymentRecord.seminarId}, userId=${paymentRecord.userId}`,
      );
      return;
    }
    await this.bookingsRepo.create(
      paymentRecord.seminarId,
      paymentRecord.userId,
      'confirmed',
      paymentRecord.id,
    );
    const isInCart = await this.cartRepo.isInCart(
      paymentRecord.seminarId,
      paymentRecord.userId,
    );
    if (isInCart) {
      await this.cartRepo.removeFromCart(
        paymentRecord.seminarId,
        paymentRecord.userId,
      );
    }
    this.logger.log(
      `Бронирование создано после оплаты: seminarId=${paymentRecord.seminarId}, userId=${paymentRecord.userId}`,
    );
  }

  async getBookings(userId: number): Promise<BookingDto[]> {
    const bookings = await this.bookingsRepo.findByUser(userId);
    return bookings.map((booking) => this.mapToDto(booking));
  }

  async getBookingsPaginated(
    userId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResponseDto<BookingDto>> {
    const { data, total } = await this.bookingsRepo.findByUserPaginated(
      userId,
      pagination,
    );

    const meta = calculatePaginationMeta(
      pagination.page,
      pagination.limit,
      total,
    );

    return {
      data: data.map((booking) => this.mapToDto(booking)),
      meta,
    };
  }

  async cancelBooking(seminarId: number, userId: number): Promise<void> {
    const isBooked = await this.bookingsRepo.isBooked(seminarId, userId);
    if (!isBooked) {
      throw new NotFoundException('Бронирование не найдено');
    }
    await this.bookingsRepo.delete(seminarId, userId);
  }

  private mapToDto(booking: BookingRecord): BookingDto {
    return {
      id: booking.id,
      seminarId: booking.seminarId,
      status: booking.status,
      seminar: {
        id: booking.seminar.id,
        title: booking.seminar.title,
        description: booking.seminar.description,
        city: booking.seminar.city,
        price: Number(booking.seminar.price),
        eventDate: booking.seminar.eventDate.toISOString().split('T')[0],
        eventTime: booking.seminar.eventTime,
        photoUrls:
          booking.seminar.photos && booking.seminar.photos.length > 0
            ? booking.seminar.photos.map((p) => p.url)
            : undefined,
        lecturer: {
          id: booking.seminar.lecturer.id,
          firstName: booking.seminar.lecturer.firstName,
          lastName: booking.seminar.lecturer.lastName,
          middleName: booking.seminar.lecturer.middleName ?? undefined,
        },
        format: {
          id: booking.seminar.format.id,
          name: booking.seminar.format.name,
        },
      },
      bookedAt: booking.createdAt,
    };
  }

  private mapYookassaStatus(status: string): PaymentStatus {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'succeeded') {
      return 'SUCCEEDED';
    }
    if (normalizedStatus === 'waiting_for_capture') {
      return 'WAITING_FOR_CAPTURE';
    }
    if (normalizedStatus === 'canceled') {
      return 'CANCELED';
    }
    return 'PENDING';
  }
}

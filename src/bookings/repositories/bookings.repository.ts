import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationParams,
  PaginatedResult,
} from '../../common/types/pagination.types';

export type BookingRecord = {
  readonly id: number;
  readonly seminarId: number;
  readonly userId: number;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly seminar: {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly city: string;
    readonly price: Prisma.Decimal;
    readonly eventDate: Date;
    readonly eventTime: string;
    readonly photos: Array<{
      readonly id: number;
      readonly url: string;
      readonly order: number;
    }>;
    readonly lecturer: {
      readonly id: number;
      readonly firstName: string;
      readonly lastName: string;
      readonly middleName: string | null;
    };
    readonly format: {
      readonly id: number;
      readonly name: string;
    };
  };
};

/**
 * Репозиторий для работы с бронированиями семинаров
 */
@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать бронирование.
   */
  async create(
    seminarId: number,
    userId: number,
    status = 'pending',
    paymentId?: number,
  ): Promise<void> {
    await this.prisma.seminarBooking.create({
      data: {
        seminarId,
        userId,
        status,
        ...(paymentId !== undefined ? { paymentId } : {}),
      },
    });
  }

  async findByUser(userId: number): Promise<BookingRecord[]> {
    return await this.prisma.seminarBooking.findMany({
      where: {
        userId,
        seminar: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        seminar: {
          include: {
            lecturer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
            format: {
              select: {
                id: true,
                name: true,
              },
            },
            photos: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserPaginated(
    userId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BookingRecord>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      seminar: {
        isActive: true,
        deletedAt: null,
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.seminarBooking.findMany({
        where,
        include: {
          seminar: {
            include: {
              lecturer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                },
              },
              format: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.seminarBooking.count({ where }),
    ]);

    return { data, total };
  }

  async findBySeminarAndUser(
    seminarId: number,
    userId: number,
  ): Promise<{ id: number; status: string } | null> {
    return await this.prisma.seminarBooking.findUnique({
      where: {
        seminarId_userId: {
          seminarId,
          userId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async updateStatus(
    seminarId: number,
    userId: number,
    status: string,
  ): Promise<void> {
    await this.prisma.seminarBooking.update({
      where: {
        seminarId_userId: {
          seminarId,
          userId,
        },
      },
      data: {
        status,
      },
    });
  }

  async delete(seminarId: number, userId: number): Promise<void> {
    await this.prisma.seminarBooking.delete({
      where: {
        seminarId_userId: {
          seminarId,
          userId,
        },
      },
    });
  }

  async isBooked(seminarId: number, userId: number): Promise<boolean> {
    const booking = await this.findBySeminarAndUser(seminarId, userId);
    return booking !== null;
  }

  /**
   * Получить количество бронирований для семинара
   */
  async countBySeminar(seminarId: number): Promise<number> {
    return await this.prisma.seminarBooking.count({
      where: {
        seminarId,
      },
    });
  }
}

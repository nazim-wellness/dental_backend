import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationParams,
  PaginatedResult,
} from '../../common/types/pagination.types';

export type CartItemRecord = {
  readonly id: number;
  readonly seminarId: number;
  readonly userId: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly seminar: {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly city: string;
    readonly price: any;
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
 * Репозиторий для работы с корзиной семинаров
 */
@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(seminarId: number, userId: number): Promise<void> {
    await this.prisma.seminarCart.create({
      data: {
        seminarId,
        userId,
      },
    });
  }

  async findByUser(userId: number): Promise<CartItemRecord[]> {
    return await this.prisma.seminarCart.findMany({
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
  ): Promise<PaginatedResult<CartItemRecord>> {
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
      this.prisma.seminarCart.findMany({
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
      this.prisma.seminarCart.count({ where }),
    ]);

    return { data, total };
  }

  async findBySeminarAndUser(
    seminarId: number,
    userId: number,
  ): Promise<{ id: number } | null> {
    return await this.prisma.seminarCart.findUnique({
      where: {
        seminarId_userId: {
          seminarId,
          userId,
        },
      },
      select: {
        id: true,
      },
    });
  }

  async removeFromCart(seminarId: number, userId: number): Promise<void> {
    await this.prisma.seminarCart.delete({
      where: {
        seminarId_userId: {
          seminarId,
          userId,
        },
      },
    });
  }

  async isInCart(seminarId: number, userId: number): Promise<boolean> {
    const item = await this.findBySeminarAndUser(seminarId, userId);
    return item !== null;
  }
}

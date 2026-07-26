import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository, CartItemRecord } from './repositories/cart.repository';
import { SeminarRepository } from '../repositories/seminar.repository';
import { CartItemDto } from './dto/cart-item.dto';
import {
  PaginationParams,
  calculatePaginationMeta,
} from '../common/types/pagination.types';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

/**
 * Сервис для работы с корзиной семинаров
 */
@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly seminarRepo: SeminarRepository,
  ) {}

  async addToCart(seminarId: number, userId: number): Promise<void> {
    const seminar = await this.seminarRepo.findById(seminarId);
    if (!seminar) {
      throw new NotFoundException('Семинар не найден');
    }
    const isInCart = await this.cartRepo.isInCart(seminarId, userId);
    if (isInCart) {
      throw new ConflictException('Семинар уже добавлен в корзину');
    }
    await this.cartRepo.addToCart(seminarId, userId);
  }

  async getCart(userId: number): Promise<CartItemDto[]> {
    const items = await this.cartRepo.findByUser(userId);
    return items.map((item) => this.mapToDto(item));
  }

  async getCartPaginated(
    userId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResponseDto<CartItemDto>> {
    const { data, total } = await this.cartRepo.findByUserPaginated(
      userId,
      pagination,
    );

    const meta = calculatePaginationMeta(
      pagination.page,
      pagination.limit,
      total,
    );

    return {
      data: data.map((item) => this.mapToDto(item)),
      meta,
    };
  }

  async removeFromCart(seminarId: number, userId: number): Promise<void> {
    const isInCart = await this.cartRepo.isInCart(seminarId, userId);
    if (!isInCart) {
      throw new NotFoundException('Семинар не найден в корзине');
    }
    await this.cartRepo.removeFromCart(seminarId, userId);
  }

  private mapToDto(item: CartItemRecord): CartItemDto {
    return {
      id: item.id,
      seminarId: item.seminarId,
      seminar: {
        id: item.seminar.id,
        title: item.seminar.title,
        description: item.seminar.description,
        city: item.seminar.city,
        price: Number(item.seminar.price),
        eventDate: item.seminar.eventDate.toISOString().split('T')[0],
        eventTime: item.seminar.eventTime,
        photoUrls:
          item.seminar.photos && item.seminar.photos.length > 0
            ? item.seminar.photos.map((p) => p.url)
            : undefined,
        lecturer: {
          id: item.seminar.lecturer.id,
          firstName: item.seminar.lecturer.firstName,
          lastName: item.seminar.lecturer.lastName,
          middleName: item.seminar.lecturer.middleName ?? undefined,
        },
        format: {
          id: item.seminar.format.id,
          name: item.seminar.format.name,
        },
      },
      addedAt: item.createdAt,
    };
  }
}

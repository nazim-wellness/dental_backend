import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  FavoritesRepository,
  FavoriteItemRecord,
} from './repositories/favorites.repository';
import { SeminarRepository } from '../repositories/seminar.repository';
import { FavoriteItemDto } from './dto/favorite-item.dto';
import {
  PaginationParams,
  calculatePaginationMeta,
} from '../common/types/pagination.types';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

/**
 * Сервис для работы с избранными семинарами
 */
@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepo: FavoritesRepository,
    private readonly seminarRepo: SeminarRepository,
  ) {}

  async addToFavorites(seminarId: number, userId: number): Promise<void> {
    const seminar = await this.seminarRepo.findById(seminarId);
    if (!seminar) {
      throw new NotFoundException('Семинар не найден');
    }
    const isInFavorites = await this.favoritesRepo.isInFavorites(
      seminarId,
      userId,
    );
    if (isInFavorites) {
      throw new ConflictException('Семинар уже добавлен в избранное');
    }
    await this.favoritesRepo.addToFavorites(seminarId, userId);
  }

  async getFavorites(userId: number): Promise<FavoriteItemDto[]> {
    const items = await this.favoritesRepo.findByUser(userId);
    return items.map((item) => this.mapToDto(item));
  }

  async getFavoritesPaginated(
    userId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResponseDto<FavoriteItemDto>> {
    const { data, total } = await this.favoritesRepo.findByUserPaginated(
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

  async removeFromFavorites(seminarId: number, userId: number): Promise<void> {
    const isInFavorites = await this.favoritesRepo.isInFavorites(
      seminarId,
      userId,
    );
    if (!isInFavorites) {
      throw new NotFoundException('Семинар не найден в избранном');
    }
    await this.favoritesRepo.removeFromFavorites(seminarId, userId);
  }

  private mapToDto(item: FavoriteItemRecord): FavoriteItemDto {
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

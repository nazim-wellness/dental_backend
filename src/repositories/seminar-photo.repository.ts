import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SeminarPhotoRecord = {
  readonly id: number;
  readonly seminarId: number;
  readonly url: string;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * Репозиторий для работы с фото семинаров
 */
@Injectable()
export class SeminarPhotoRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать фото для семинара
   */
  async create(
    seminarId: number,
    url: string,
    order: number = 0,
  ): Promise<SeminarPhotoRecord> {
    return await this.prisma.seminarPhoto.create({
      data: {
        seminarId,
        url,
        order,
      },
    });
  }

  /**
   * Создать несколько фото для семинара
   */
  async createMany(
    seminarId: number,
    urls: string[],
  ): Promise<SeminarPhotoRecord[]> {
    if (urls.length === 0) {
      return [];
    }

    const photos = await Promise.all(
      urls.map((url, index) => this.create(seminarId, url, index)),
    );

    return photos;
  }

  /**
   * Получить все фото семинара, отсортированные по порядку
   */
  async findBySeminarId(seminarId: number): Promise<SeminarPhotoRecord[]> {
    return await this.prisma.seminarPhoto.findMany({
      where: {
        seminarId,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  /**
   * Удалить все фото семинара
   */
  async deleteBySeminarId(seminarId: number): Promise<void> {
    await this.prisma.seminarPhoto.deleteMany({
      where: {
        seminarId,
      },
    });
  }

  /**
   * Удалить конкретное фото
   */
  async deleteById(id: number): Promise<void> {
    await this.prisma.seminarPhoto.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Обновить порядок фото
   */
  async updateOrder(id: number, order: number): Promise<SeminarPhotoRecord> {
    return await this.prisma.seminarPhoto.update({
      where: {
        id,
      },
      data: {
        order,
      },
    });
  }
}

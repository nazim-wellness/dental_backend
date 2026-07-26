import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Репозиторий для работы с просмотрами семинаров
 */
@Injectable()
export class SeminarViewRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Записать просмотр семинара пользователем
   * Использует upsert для безопасной записи просмотра (не создает дубликаты)
   */
  async recordView(seminarId: number, userId: number): Promise<void> {
    try {
      await this.prisma.seminarView.upsert({
        where: {
          seminarId_userId: {
            seminarId,
            userId,
          },
        },
        update: {}, // Если запись существует, ничего не обновляем
        create: {
          seminarId,
          userId,
        },
      });
    } catch (error: any) {
      // Игнорируем ошибку, если пользователь не существует (foreign key constraint violation)
      if (error?.code === 'P2003') {
        return;
      }
      throw error;
    }
  }

  /**
   * Проверить, просматривал ли пользователь семинар
   */
  async hasViewed(seminarId: number, userId: number): Promise<boolean> {
    const view = await this.prisma.seminarView.findUnique({
      where: {
        seminarId_userId: {
          seminarId,
          userId,
        },
      },
    });
    return view !== null;
  }

  /**
   * Получить количество уникальных просмотров семинара
   * Уникальность гарантируется на уровне базы данных через @@unique([seminarId, userId])
   */
  async getUniqueViewsCount(seminarId: number): Promise<number> {
    try {
      return await this.prisma.seminarView.count({
        where: {
          seminarId,
        },
      });
    } catch (error: any) {
      // Если таблица не существует (P2021), возвращаем 0
      if (error?.code === 'P2021') {
        return 0;
      }
      throw error;
    }
  }
}

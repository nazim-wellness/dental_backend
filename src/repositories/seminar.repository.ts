import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SeminarViewRepository } from './seminar-view.repository';
import { SpecialtyRepository } from './specialty.repository';
import { SeminarPhotoRepository } from './seminar-photo.repository';
import {
  PaginatedResult,
  PaginationParams,
} from '../common/types/pagination.types';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;

export type CreateSeminarParams = {
  readonly title: string;
  readonly description: string;
  readonly topic?: string;
  readonly city: string;
  readonly price: number | Prisma.Decimal;
  readonly eventDate: Date;
  readonly eventTime: string;
  readonly photoUrls?: string[];
  readonly contactPhone?: string;
  readonly secondaryPhone?: string;
  readonly contactEmail?: string;
  readonly contactTelegram?: string;
  readonly organizerId: number;
  readonly lecturerId: number;
  readonly formatId: number;
  readonly specialtyId?: number;
  readonly eventDays?: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;
};

export type UpdateSeminarParams = {
  readonly title?: string;
  readonly description?: string;
  readonly topic?: string;
  readonly city?: string;
  readonly price?: number | Prisma.Decimal;
  readonly eventDate?: Date;
  readonly eventTime?: string;
  readonly photoUrls?: string[];
  readonly contactPhone?: string;
  readonly secondaryPhone?: string;
  readonly contactEmail?: string;
  readonly contactTelegram?: string;
  readonly lecturerId?: number;
  readonly formatId?: number;
  readonly specialtyId?: number;
  readonly eventDays?: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;
};

export type SeminarRecord = {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly topic: string | null;
  readonly city: string;
  readonly price: Prisma.Decimal;
  readonly eventDate: Date;
  readonly eventTime: string;
  readonly contactPhone: string | null;
  readonly secondaryPhone: string | null;
  readonly contactEmail: string | null;
  readonly contactTelegram: string | null;
  readonly organizerId: number;
  readonly lecturerId: number;
  readonly formatId: number;
  readonly specialtyId: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly organizer: {
    readonly id: number;
    readonly firstName: string | null;
    readonly lastName: string | null;
    readonly phone: string | null;
  };
  readonly lecturer: {
    readonly id: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly middleName: string | null;
    readonly position: string;
    readonly yearsExperience: number;
    readonly achievements: string[];
    readonly photoUrl: string | null;
    readonly bio: string | null;
  };
  readonly format: {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
  };
  readonly specialty: {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
  } | null;
  readonly photos?: Array<{
    readonly id: number;
    readonly url: string;
    readonly order: number;
  }>;
  readonly eventDays?: Array<{
    readonly id: number;
    readonly date: Date;
    readonly startTime: string;
    readonly endTime: string;
  }>;
};

@Injectable()
export class SeminarRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly viewRepo: SeminarViewRepository,
    private readonly specialtyRepo: SpecialtyRepository,
    private readonly photoRepo: SeminarPhotoRepository,
  ) {}

  async create(params: CreateSeminarParams): Promise<SeminarRecord> {
    return await this.prisma.$transaction(async (tx) => {
      const seminar = await tx.seminar.create({
        data: {
          title: params.title,
          description: params.description,
          topic: params.topic,
          city: params.city,
          price: params.price,
          eventDate: params.eventDate,
          eventTime: params.eventTime,
          contactPhone: params.contactPhone,
          secondaryPhone: params.secondaryPhone,
          contactEmail: params.contactEmail,
          contactTelegram: params.contactTelegram,
          organizerId: params.organizerId,
          lecturerId: params.lecturerId,
          formatId: params.formatId,
          specialtyId: params.specialtyId,
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          lecturer: true,
          format: true,
          specialty: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          photos: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (params.eventDays && params.eventDays.length > 0) {
        await tx.seminarEventDay.createMany({
          data: params.eventDays.map((day) => ({
            seminarId: seminar.id,
            date: day.date,
            startTime: day.startTime,
            endTime: day.endTime,
          })),
        });
      }

      if (params.photoUrls && params.photoUrls.length > 0) {
        await tx.seminarPhoto.createMany({
          data: params.photoUrls.map((url, index) => ({
            seminarId: seminar.id,
            url,
            order: index,
          })),
        });
      }

      const seminarWithPhotos = await tx.seminar.findUnique({
        where: { id: seminar.id },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          lecturer: true,
          format: true,
          specialty: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          photos: {
            orderBy: {
              order: 'asc',
            },
          },
          eventDays: {
            orderBy: { date: 'asc' },
          },
        },
      });

      return seminarWithPhotos as SeminarRecord;
    });
  }

  async findAll(): Promise<SeminarRecord[]> {
    return await this.prisma.seminar.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lecturer: true,
        format: true,
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        photos: {
          orderBy: {
            order: 'asc',
          },
        },
        eventDays: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findByOrganizer(organizerId: number): Promise<
    Array<
      SeminarRecord & {
        uniqueViewsCount: number;
        bookingsCount: number;
      }
    >
  > {
    const seminars = await this.prisma.seminar.findMany({
      where: {
        organizerId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lecturer: true,
        format: true,
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        photos: {
          orderBy: {
            order: 'asc',
          },
        },
        eventDays: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    const seminarsWithStats = await Promise.all(
      seminars.map(async (seminar) => {
        const [uniqueViewsCount, bookingsCount] = await Promise.all([
          this.viewRepo.getUniqueViewsCount(seminar.id),
          this.prisma.seminarBooking.count({
            where: {
              seminarId: seminar.id,
            },
          }),
        ]);

        return {
          ...seminar,
          uniqueViewsCount,
          bookingsCount,
        };
      }),
    );

    return seminarsWithStats;
  }

  async findByOrganizerPaginated(
    organizerId: number,
    pagination: PaginationParams,
  ): Promise<
    PaginatedResult<
      SeminarRecord & {
        uniqueViewsCount: number;
        bookingsCount: number;
      }
    >
  > {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      organizerId,
      isActive: true,
      deletedAt: null,
    };

    const [seminars, total] = await Promise.all([
      this.prisma.seminar.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          lecturer: true,
          format: true,
          photos: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.seminar.count({ where }),
    ]);

    const dataWithStats = await Promise.all(
      seminars.map(async (seminar) => {
        const [uniqueViewsCount, bookingsCount] = await Promise.all([
          this.viewRepo.getUniqueViewsCount(seminar.id),
          this.prisma.seminarBooking.count({
            where: {
              seminarId: seminar.id,
            },
          }),
        ]);

        return {
          ...seminar,
          uniqueViewsCount,
          bookingsCount,
        };
      }),
    );

    return { data: dataWithStats, total };
  }

  async findUpcomingPaginated(
    pagination: PaginationParams,
    filters?: {
      search?: string;
      userId?: number;
      booked?: boolean;
      city?: string;
      dateFrom?: string;
      dateTo?: string;
      priceMin?: number;
      priceMax?: number;
      lecturerId?: number;
      organizerId?: number;
      specialties?: string;
    },
  ): Promise<PaginatedResult<SeminarRecord>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Prisma.SeminarWhereInput = {
      isActive: true,
      deletedAt: null,
      eventDate: {
        gte: today,
      },
    };

    // Поиск по названию, лектору и организатору
    if (filters?.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm.length > 0) {
        where.OR = [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            lecturer: {
              OR: [
                {
                  firstName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  middleName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
          {
            organizer: {
              OR: [
                {
                  firstName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ];
      }
    }

    // Фильтр по забронированным семинарам
    if (filters?.userId !== undefined && filters.booked !== undefined) {
      if (filters.booked === true) {
        // Только забронированные семинары - есть хотя бы одно бронирование с userId
        where.bookings = {
          some: {
            userId: filters.userId,
          },
        };
      } else if (filters.booked === false) {
        // Только НЕзабронированные семинары - нет бронирований с userId
        where.bookings = {
          none: {
            userId: filters.userId,
          },
        };
      }
    }
    // Если booked === undefined, показываем все семинары (не фильтруем)

    // Фильтр по городу
    if (filters?.city) {
      const cityTerm = filters.city.trim();
      if (cityTerm.length > 0) {
        where.city = {
          contains: cityTerm,
          mode: 'insensitive',
        };
      }
    }

    // Фильтр по датам
    if (filters?.dateFrom || filters?.dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        dateFrom.setHours(0, 0, 0, 0);
        dateFilter.gte = dateFrom;
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        dateFilter.lte = dateTo;
      }
      where.eventDate = dateFilter;
    }

    // Фильтр по цене
    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (filters.priceMin !== undefined) {
        priceFilter.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        priceFilter.lte = filters.priceMax;
      }
      where.price = priceFilter;
    }

    // Фильтр по лектору
    if (filters?.lecturerId !== undefined) {
      where.lecturerId = filters.lecturerId;
    }

    // Фильтр по организатору и специальностям
    const organizerFilter: Prisma.UserWhereInput = {};
    if (filters?.organizerId !== undefined) {
      organizerFilter.id = filters.organizerId;
    }

    // Фильтр по специальностям
    if (filters?.specialties) {
      const specialtyNames = filters.specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (specialtyNames.length > 0) {
        // Получаем ID специальностей по именам
        const allSpecialties = await this.specialtyRepo.findAllActive();
        const specialtyIds = allSpecialties
          .filter((s) => specialtyNames.includes(s.name))
          .map((s) => s.id);
        if (specialtyIds.length > 0) {
          where.specialtyId = {
            in: specialtyIds,
          };
        } else {
          // Если ни одна специальность не найдена, возвращаем пустой результат
          where.id = -1;
        }
      }
    }

    // Применяем фильтр по организатору только если есть условия
    if (Object.keys(organizerFilter).length > 0) {
      where.organizer = organizerFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.seminar.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          lecturer: true,
          format: true,
          specialty: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          photos: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.seminar.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<SeminarRecord | null> {
    return await this.prisma.seminar.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lecturer: true,
        format: true,
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        photos: {
          orderBy: {
            order: 'asc',
          },
        },
        eventDays: {
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  async update(
    id: number,
    params: UpdateSeminarParams,
  ): Promise<SeminarRecord> {
    return await this.prisma.$transaction(async (tx) => {
      await tx.seminar.update({
        where: { id },
        data: {
          title: params.title,
          description: params.description,
          topic: params.topic,
          city: params.city,
          price: params.price,
          eventDate: params.eventDate,
          eventTime: params.eventTime,
          contactPhone: params.contactPhone,
          secondaryPhone: params.secondaryPhone,
          contactEmail: params.contactEmail,
          contactTelegram: params.contactTelegram,
          lecturerId: params.lecturerId,
          formatId: params.formatId,
          specialtyId: params.specialtyId,
        },
      });

      if (params.eventDays !== undefined) {
        await tx.seminarEventDay.deleteMany({
          where: { seminarId: id },
        });

        if (params.eventDays.length > 0) {
          await tx.seminarEventDay.createMany({
            data: params.eventDays.map((day) => ({
              seminarId: id,
              date: day.date,
              startTime: day.startTime,
              endTime: day.endTime,
            })),
          });
        }
      }

      if (params.photoUrls !== undefined) {
        await tx.seminarPhoto.deleteMany({
          where: { seminarId: id },
        });

        if (params.photoUrls.length > 0) {
          await tx.seminarPhoto.createMany({
            data: params.photoUrls.map((url, index) => ({
              seminarId: id,
              url,
              order: index,
            })),
          });
        }
      }

      return (await tx.seminar.findUnique({
        where: { id },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          lecturer: true,
          format: true,
          specialty: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          photos: {
            orderBy: {
              order: 'asc',
            },
          },
          eventDays: {
            orderBy: { date: 'asc' },
          },
        },
      })) as SeminarRecord;
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.seminar.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async getOrganizerSeminarsStats(organizerId: number): Promise<
    Array<{
      seminarId: number;
      title: string;
      uniqueViewsCount: number;
      bookingsCount: number;
      createdAt: Date;
      eventDate: Date;
    }>
  > {
    const seminars = await this.prisma.seminar.findMany({
      where: {
        organizerId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        eventDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const stats = await Promise.all(
      seminars.map(async (seminar) => {
        const [uniqueViewsCount, bookingsCount] = await Promise.all([
          this.viewRepo.getUniqueViewsCount(seminar.id),
          this.prisma.seminarBooking.count({
            where: {
              seminarId: seminar.id,
            },
          }),
        ]);

        return {
          seminarId: seminar.id,
          title: seminar.title,
          uniqueViewsCount,
          bookingsCount,
          createdAt: seminar.createdAt,
          eventDate: seminar.eventDate,
        };
      }),
    );

    return stats;
  }

  async getUpcomingSeminarsStats(userId: number): Promise<{
    availableCount: number;
    bookedCount: number;
    totalCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseWhere = {
      isActive: true,
      deletedAt: null,
      eventDate: {
        gte: today,
      },
    };

    const [availableCount, bookedCount] = await Promise.all([
      this.prisma.seminar.count({
        where: {
          ...baseWhere,
          NOT: {
            bookings: {
              some: {
                userId,
              },
            },
          },
        },
      }),
      this.prisma.seminar.count({
        where: {
          ...baseWhere,
          bookings: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    return {
      availableCount,
      bookedCount,
      totalCount: availableCount + bookedCount,
    };
  }

  /**
   * Найти докторов для рекламной рассылки:
   * - Имеют специальность, совпадающую со специальностью семинара
   * - Бронировали семинары в том же городе
   */
  async findTargetDoctorsForPromo(
    specialtyId: number,
  ): Promise<Array<{ id: number }>> {
    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      // Находим всех докторов, которые:
      // 1. Имеют указанную специальность
      // 2. Бронировали хотя бы один семинар в указанном городе
      return tx.user.findMany({
        where: {
          role: UserRole.DOCTOR,
          deletedAt: null,
          OR: [{ specialtyId }, { specialtyLinks: { some: { specialtyId } } }],
        },
        select: {
          id: true,
        },
        distinct: ['id'],
      });
    });
  }
}

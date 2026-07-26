import { Injectable, BadRequestException } from '@nestjs/common';
import {
  SeminarRepository,
  SeminarRecord,
} from '../repositories/seminar.repository';
import { LecturerRepository } from '../repositories/lecturer.repository';
import { SeminarFormatRepository } from '../repositories/seminar-format.repository';
import { SeminarViewRepository } from '../repositories/seminar-view.repository';
import { SpecialtyRepository } from '../repositories/specialty.repository';
import { UserRepository } from '../repositories/user.repository';
import { PushTokenRepository } from '../repositories/push-token.repository';
import { FirebaseService } from '../push-tokens/firebase.service';
import { UserRole } from '@prisma/client';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { SeminarDto } from './dto/seminar.dto';
import { MySeminarDto } from './dto/my-seminar.dto';
import { SeminarsStatsDto } from './dto/seminars-stats.dto';
import { OrganizerSeminarsStatsDto } from './dto/seminar-stats.dto';
import { OrganizerDto } from './dto/organizer.dto';
import {
  PaginationParams,
  calculatePaginationMeta,
} from '../common/types/pagination.types';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class SeminarsService {
  constructor(
    private readonly seminarRepo: SeminarRepository,
    private readonly lecturerRepo: LecturerRepository,
    private readonly formatRepo: SeminarFormatRepository,
    private readonly specialtyRepo: SpecialtyRepository,
    private readonly viewRepo: SeminarViewRepository,
    private readonly userRepo: UserRepository,
    private readonly pushTokenRepo: PushTokenRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(
    dto: CreateSeminarDto,
    organizerId: number,
  ): Promise<SeminarDto> {
    const lecturer = await this.lecturerRepo.findById(dto.lecturerId);
    if (!lecturer) {
      throw new BadRequestException('Лектор с указанным ID не найден');
    }

    const format = await this.formatRepo.findById(dto.formatId);
    if (!format) {
      throw new BadRequestException('Формат семинара с указанным ID не найден');
    }

    // Если указана специальность, проверяем её существование
    if (dto.specialtyId) {
      const specialty = await this.specialtyRepo.findById(dto.specialtyId);
      if (!specialty) {
        throw new BadRequestException(
          'Специальность с указанным ID не найдена',
        );
      }
    }

    // Обработка телефонов: если contactPhone содержит запятую, разделяем на два номера
    let contactPhone = dto.contactPhone;
    let secondaryPhone = dto.secondaryPhone;
    if (contactPhone && contactPhone.includes(',')) {
      const phones = contactPhone
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      contactPhone = phones[0] || undefined;
      secondaryPhone = phones[1] || secondaryPhone;
    }

    // Обработка дней проведения: если указан eventDays, берем eventDate и eventTime из первого дня
    let eventDate: Date;
    let eventTime: string;
    let eventDays:
      | Array<{ date: Date; startTime: string; endTime: string }>
      | undefined;

    if (dto.eventDays && dto.eventDays.length > 0) {
      eventDays = dto.eventDays.map((day) => ({
        date: new Date(day.date),
        startTime: day.startTime,
        endTime: day.endTime,
      }));
      eventDate = eventDays[0].date;
      eventTime = eventDays[0].startTime;
    } else if (dto.eventDate && dto.eventTime) {
      eventDate = new Date(dto.eventDate);
      eventTime = dto.eventTime;
    } else {
      throw new BadRequestException(
        'Необходимо указать либо eventDays, либо eventDate и eventTime',
      );
    }

    const seminar = await this.seminarRepo.create({
      title: dto.title,
      description: dto.description,
      topic: dto.topic,
      city: dto.city,
      price: dto.price,
      eventDate,
      eventTime,
      photoUrls: dto.photoUrls,
      contactPhone,
      secondaryPhone,
      contactEmail: dto.contactEmail,
      contactTelegram: dto.contactTelegram,
      organizerId,
      lecturerId: dto.lecturerId,
      formatId: dto.formatId,
      specialtyId: dto.specialtyId,
      eventDays,
    });

    return this.mapToDto(seminar);
  }

  async findAll(): Promise<SeminarDto[]> {
    const seminars = await this.seminarRepo.findAll();
    return seminars.map((s) => this.mapToDto(s));
  }

  async findByOrganizer(organizerId: number): Promise<MySeminarDto[]> {
    const seminars = await this.seminarRepo.findByOrganizer(organizerId);
    return seminars.map((s) => this.mapToMySeminarDto(s));
  }

  async findByOrganizerPaginated(
    organizerId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResponseDto<MySeminarDto>> {
    const { data, total } = await this.seminarRepo.findByOrganizerPaginated(
      organizerId,
      pagination,
    );

    const meta = calculatePaginationMeta(
      pagination.page,
      pagination.limit,
      total,
    );

    return {
      data: data.map((s) => this.mapToMySeminarDto(s)),
      meta,
    };
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
  ): Promise<PaginatedResponseDto<SeminarDto>> {
    const { data, total } = await this.seminarRepo.findUpcomingPaginated(
      pagination,
      filters,
    );

    const meta = calculatePaginationMeta(
      pagination.page,
      pagination.limit,
      total,
    );

    return {
      data: data.map((s) => this.mapToDto(s)),
      meta,
    };
  }

  async findOne(
    id: number,
    userId?: number,
    userRole?: UserRole,
  ): Promise<SeminarDto | null> {
    const seminar = await this.seminarRepo.findById(id);
    if (!seminar) return null;

    // Записываем просмотр, если запрос от доктора
    if (userRole === UserRole.DOCTOR && userId !== undefined) {
      await this.viewRepo.recordView(id, userId);
    }

    return this.mapToDto(seminar);
  }

  async update(id: number, dto: UpdateSeminarDto): Promise<SeminarDto> {
    if (dto.lecturerId) {
      const lecturer = await this.lecturerRepo.findById(dto.lecturerId);
      if (!lecturer) {
        throw new BadRequestException('Лектор с указанным ID не найден');
      }
    }

    if (dto.formatId) {
      const format = await this.formatRepo.findById(dto.formatId);
      if (!format) {
        throw new BadRequestException(
          'Формат семинара с указанным ID не найден',
        );
      }
    }

    if (dto.specialtyId) {
      const specialty = await this.specialtyRepo.findById(dto.specialtyId);
      if (!specialty) {
        throw new BadRequestException(
          'Специальность с указанным ID не найдена',
        );
      }
    }

    // Обработка телефонов: если contactPhone содержит запятую, разделяем на два номера
    let contactPhone = dto.contactPhone;
    let secondaryPhone = dto.secondaryPhone;
    if (contactPhone && contactPhone.includes(',')) {
      const phones = contactPhone
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      contactPhone = phones[0] || undefined;
      secondaryPhone = phones[1] || secondaryPhone;
    }

    // Обработка дней проведения: если указан eventDays, берем eventDate и eventTime из первого дня
    let eventDate: Date | undefined;
    let eventTime: string | undefined;
    let eventDays:
      | Array<{ date: Date; startTime: string; endTime: string }>
      | undefined;

    if (dto.eventDays !== undefined) {
      if (dto.eventDays.length > 0) {
        eventDays = dto.eventDays.map((day) => ({
          date: new Date(day.date),
          startTime: day.startTime,
          endTime: day.endTime,
        }));
        eventDate = eventDays[0].date;
        eventTime = eventDays[0].startTime;
      } else {
        // Если передан пустой массив, удаляем все дни
        eventDays = [];
      }
    } else if (dto.eventDate !== undefined || dto.eventTime !== undefined) {
      // Если eventDays не указан, но указаны eventDate или eventTime, используем их
      if (dto.eventDate) {
        eventDate = new Date(dto.eventDate);
      }
      eventTime = dto.eventTime;
    }

    const seminar = await this.seminarRepo.update(id, {
      title: dto.title,
      description: dto.description,
      topic: dto.topic,
      city: dto.city,
      price: dto.price,
      eventDate,
      eventTime,
      photoUrls: dto.photoUrls,
      contactPhone,
      secondaryPhone,
      contactEmail: dto.contactEmail,
      contactTelegram: dto.contactTelegram,
      lecturerId: dto.lecturerId,
      formatId: dto.formatId,
      specialtyId: dto.specialtyId,
      eventDays,
    });

    return this.mapToDto(seminar);
  }

  async remove(id: number): Promise<void> {
    await this.seminarRepo.softDelete(id);
  }

  /**
   * Отправить рекламное push-уведомление о предстоящем семинаре
   * Уведомления отправляются только докторам, которые:
   * - Имеют специальность, совпадающую со специальностью семинара
   * - Бронировали семинары в том же городе
   */
  async sendPromoPush(
    seminarId: number,
    organizerId: number,
  ): Promise<{ sent: number; failed: number; totalTargets: number }> {
    // Проверяем, что семинар существует и принадлежит организатору
    const seminar = await this.seminarRepo.findById(seminarId);
    if (!seminar) {
      throw new BadRequestException('Семинар не найден');
    }

    if (seminar.organizerId !== organizerId) {
      throw new BadRequestException(
        'Вы можете отправлять рекламу только для своих семинаров',
      );
    }

    // Проверяем, что семинар предстоящий
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (seminar.eventDate < today) {
      throw new BadRequestException(
        'Можно отправлять рекламу только для предстоящих семинаров',
      );
    }

    // Проверяем, что у семинара есть специальность
    if (!seminar.specialtyId) {
      throw new BadRequestException(
        'У семинара должна быть указана специальность для отправки рекламы',
      );
    }

    // Проверяем, что Firebase инициализирован
    if (!this.firebaseService.isInitialized()) {
      throw new BadRequestException(
        'Firebase не настроен. Проверьте конфигурацию.',
      );
    }

    // Находим всех докторов, которые:
    // 1. Имеют специальность, совпадающую со специальностью семинара
    // 2. Бронировали семинары в том же городе
    const targetUsers = await this.findTargetDoctors(seminar.specialtyId);

    if (targetUsers.length === 0) {
      return {
        sent: 0,
        failed: 0,
        totalTargets: 0,
      };
    }

    // Получаем все push токены для целевых пользователей
    const userIds = targetUsers.map((u) => u.id);
    const allTokens = await Promise.all(
      userIds.map((userId) => this.pushTokenRepo.findByUserId(userId)),
    );

    const fcmTokens = allTokens.flat().map((token) => token.token);

    if (fcmTokens.length === 0) {
      return {
        sent: 0,
        failed: 0,
        totalTargets: targetUsers.length,
      };
    }

    // Формируем текст уведомления
    const title = `Новый семинар: ${seminar.title}`;
    const body = `${seminar.city} • ${seminar.eventDate.toLocaleDateString('ru-RU')} • ${Number(seminar.price).toLocaleString('ru-RU')} ₽`;

    // Отправляем уведомления
    const response = await this.firebaseService.sendMulticast(
      fcmTokens,
      title,
      body,
      {
        seminarId: seminarId.toString(),
        type: 'promo',
        city: seminar.city,
      },
    );

    return {
      sent: response.successCount,
      failed: response.failureCount,
      totalTargets: targetUsers.length,
    };
  }

  /**
   * Найти докторов, которые подходят для рекламы:
   * - Имеют специальность, совпадающую со специальностью семинара
   * - Бронировали семинары в том же городе
   */
  private async findTargetDoctors(
    specialtyId: number,
  ): Promise<Array<{ id: number }>> {
    return await this.seminarRepo.findTargetDoctorsForPromo(specialtyId);
  }

  async getStats(userId: number): Promise<SeminarsStatsDto> {
    const stats = await this.seminarRepo.getUpcomingSeminarsStats(userId);
    return {
      availableCount: stats.availableCount,
      bookedCount: stats.bookedCount,
      totalCount: stats.totalCount,
    };
  }

  async getOrganizerStats(
    organizerId: number,
  ): Promise<OrganizerSeminarsStatsDto> {
    const seminarsStats =
      await this.seminarRepo.getOrganizerSeminarsStats(organizerId);

    const totalUniqueViews = seminarsStats.reduce(
      (sum, stat) => sum + stat.uniqueViewsCount,
      0,
    );
    const totalBookings = seminarsStats.reduce(
      (sum, stat) => sum + stat.bookingsCount,
      0,
    );

    return {
      totalUniqueViews,
      totalBookings,
      seminars: seminarsStats.map((stat) => ({
        seminarId: stat.seminarId,
        title: stat.title,
        uniqueViewsCount: stat.uniqueViewsCount,
        bookingsCount: stat.bookingsCount,
        createdAt: stat.createdAt,
        eventDate: stat.eventDate.toISOString().split('T')[0],
      })),
    };
  }

  private mapToDto(seminar: SeminarRecord): SeminarDto {
    return {
      id: seminar.id,
      title: seminar.title,
      description: seminar.description,
      topic: seminar.topic ?? undefined,
      city: seminar.city,
      price: Number(seminar.price),
      eventDate: seminar.eventDate,
      eventTime: seminar.eventTime,
      photoUrls:
        seminar.photos && seminar.photos.length > 0
          ? seminar.photos.map((p) => p.url)
          : undefined,
      contactPhone: seminar.contactPhone ?? undefined,
      secondaryPhone: seminar.secondaryPhone ?? undefined,
      contactEmail: seminar.contactEmail ?? undefined,
      contactTelegram: seminar.contactTelegram ?? undefined,
      eventDays: seminar.eventDays?.map((day) => ({
        date: day.date,
        startTime: day.startTime,
        endTime: day.endTime,
      })),
      organizer: {
        id: seminar.organizer.id,
        firstName: seminar.organizer.firstName ?? undefined,
        lastName: seminar.organizer.lastName ?? undefined,
        phone: seminar.organizer.phone ?? undefined,
      },
      lecturer: {
        id: seminar.lecturer.id,
        firstName: seminar.lecturer.firstName,
        lastName: seminar.lecturer.lastName,
        middleName: seminar.lecturer.middleName ?? undefined,
        position: seminar.lecturer.position,
        yearsExperience: seminar.lecturer.yearsExperience,
        achievements: seminar.lecturer.achievements,
        photoUrl: seminar.lecturer.photoUrl ?? undefined,
        bio: seminar.lecturer.bio ?? undefined,
      },
      format: {
        id: seminar.format.id,
        name: seminar.format.name,
        description: seminar.format.description ?? undefined,
      },
      specialty: seminar.specialty
        ? {
            id: seminar.specialty.id,
            name: seminar.specialty.name,
            description: seminar.specialty.description ?? undefined,
          }
        : null,
      createdAt: seminar.createdAt,
      updatedAt: seminar.updatedAt,
    };
  }

  private mapToMySeminarDto(
    seminar: SeminarRecord & {
      uniqueViewsCount?: number;
      bookingsCount?: number;
    },
  ): MySeminarDto {
    return {
      id: seminar.id,
      title: seminar.title,
      city: seminar.city,
      price: Number(seminar.price),
      eventDate: seminar.eventDate.toISOString().split('T')[0],
      eventTime: seminar.eventTime,
      photoUrls:
        seminar.photos && seminar.photos.length > 0
          ? seminar.photos.map((p) => p.url)
          : undefined,
      lecturer: {
        id: seminar.lecturer.id,
        firstName: seminar.lecturer.firstName,
        lastName: seminar.lecturer.lastName,
        middleName: seminar.lecturer.middleName ?? undefined,
      },
      format: {
        id: seminar.format.id,
        name: seminar.format.name,
      },
      uniqueViewsCount: seminar.uniqueViewsCount ?? 0,
      bookingsCount: seminar.bookingsCount ?? 0,
    };
  }

  async findAllOrganizers(): Promise<OrganizerDto[]> {
    const organizers = await this.userRepo.findAllOrganizers();
    return organizers.map((organizer) => ({
      id: organizer.id,
      firstName: organizer.firstName ?? undefined,
      lastName: organizer.lastName ?? undefined,
      middleName: organizer.middleName ?? undefined,
      phone: organizer.phone ?? undefined,
    }));
  }
}

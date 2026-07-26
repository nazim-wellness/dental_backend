import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для статистики конкретного семинара
 */
export class SeminarStatsDto {
  @ApiProperty({
    description: 'ID семинара',
    example: 1,
  })
  seminarId!: number;

  @ApiProperty({
    description: 'Название семинара',
    example: 'Современные методы имплантации',
  })
  title!: string;

  @ApiProperty({
    description: 'Количество уникальных просмотров',
    example: 150,
  })
  uniqueViewsCount!: number;

  @ApiProperty({
    description: 'Количество бронирований',
    example: 25,
  })
  bookingsCount!: number;

  @ApiProperty({
    description: 'Дата создания семинара',
    example: '2024-11-03T19:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Дата проведения семинара',
    example: '2024-12-15',
  })
  eventDate!: string;
}

/**
 * DTO для статистики всех семинаров организатора
 */
export class OrganizerSeminarsStatsDto {
  @ApiProperty({
    description: 'Общее количество уникальных просмотров всех семинаров',
    example: 1250,
  })
  totalUniqueViews!: number;

  @ApiProperty({
    description: 'Общее количество бронирований всех семинаров',
    example: 180,
  })
  totalBookings!: number;

  @ApiProperty({
    description: 'Статистика по каждому семинару',
    type: [SeminarStatsDto],
  })
  seminars!: SeminarStatsDto[];
}

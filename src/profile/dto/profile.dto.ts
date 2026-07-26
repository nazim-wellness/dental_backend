import { ApiProperty } from '@nestjs/swagger';
import { SpecialtyDto, SpecialtyResponse } from './specialty.dto';

export type ProfileDto = {
  readonly id: number;
  readonly phone?: string;
  readonly role: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly middleName?: string;
  readonly companyName?: string;
  readonly referralCode?: string;
  /** Все специальности врача (id по возрастанию). */
  readonly specialties?: SpecialtyDto[];
  readonly specialtyIds?: number[];
  /** Первая по возрастанию id (основная / legacy). */
  readonly specialtyId?: number;
  readonly specialty?: {
    readonly id: number;
    readonly name: string;
    readonly description?: string;
  } | null;
  readonly isLecturer: boolean;
  readonly lecturer?: {
    readonly id: number;
    readonly position: string;
    readonly yearsExperience: number;
    readonly achievements: string[];
    readonly photoUrl?: string;
    readonly bio?: string;
  } | null;
};

export class ProfileResponse implements ProfileDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id!: number;

  @ApiProperty({
    description: 'Телефон пользователя',
    example: '+79991234567',
    required: false,
  })
  phone?: string;

  @ApiProperty({ description: 'Роль пользователя', example: 'DOCTOR' })
  role!: string;

  @ApiProperty({ description: 'Имя', example: 'Иван', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Фамилия', example: 'Иванов', required: false })
  lastName?: string;

  @ApiProperty({
    description: 'Отчество',
    example: 'Иванович',
    required: false,
  })
  middleName?: string;

  @ApiProperty({
    description: 'Название компании (для организаторов)',
    example: 'ООО "Стоматология Плюс"',
    required: false,
  })
  companyName?: string;

  @ApiProperty({
    description: 'Реферальный код',
    example: 'REF123456',
    required: false,
  })
  referralCode?: string;

  @ApiProperty({
    description:
      'Все специальности врача (id и имя; порядок — по возрастанию id)',
    type: [SpecialtyResponse],
    required: false,
  })
  specialties?: SpecialtyDto[];

  @ApiProperty({
    description: 'Список id специальностей врача (по возрастанию id)',
    type: [Number],
    required: false,
    example: [1, 3, 7],
  })
  specialtyIds?: number[];

  @ApiProperty({
    description: 'Первая специальность по возрастанию id (для старых клиентов)',
    required: false,
    example: 1,
  })
  specialtyId?: number;

  @ApiProperty({
    description:
      'Одна «основная» специальность (совместимость; первая из specialties)',
    required: false,
    example: {
      id: 1,
      name: 'Терапевтическая стоматология',
      description: 'Лечение кариеса',
    },
  })
  specialty?: { id: number; name: string; description?: string } | null;

  @ApiProperty({
    description: 'Является ли пользователь лектором',
    example: true,
  })
  isLecturer!: boolean;

  @ApiProperty({
    description: 'Данные лектора (если пользователь является лектором)',
    required: false,
    example: {
      id: 1,
      position: 'Главный врач стоматологической клиники',
      yearsExperience: 15,
      achievements: ['Кандидат медицинских наук'],
      photoUrl: 'https://bucket.s3.region.amazonaws.com/lecturers/photo.jpg',
      bio: 'Опытный стоматолог с 15-летним стажем...',
    },
  })
  lecturer?: {
    id: number;
    position: string;
    yearsExperience: number;
    achievements: string[];
    photoUrl?: string;
    bio?: string;
  } | null;
}

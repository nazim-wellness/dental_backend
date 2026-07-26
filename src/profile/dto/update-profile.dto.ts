import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsInt,
  Min,
  IsArray,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type UpdateProfileDto = {
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName?: string;
  readonly companyName?: string;
  readonly referralCode?: string;
  /** Полная замена специальностей врача (активные id из GET /profile/specialties). */
  readonly specialtyIds?: readonly number[];
  /** Одна специальность (legacy); если передан specialtyIds — желательно дублировать первым элементом. */
  readonly specialtyId?: number;
  readonly phone?: string;
  readonly lecturerPosition?: string;
  readonly lecturerYearsExperience?: number;
  readonly lecturerAchievements?: string[];
  readonly lecturerPhotoUrl?: string;
  readonly lecturerBio?: string;
};

export class UpdateProfileBody implements UpdateProfileDto {
  @ApiProperty({
    description: 'Имя',
    example: 'Иван',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'Фамилия',
    example: 'Иванов',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'Отчество (необязательно)',
    example: 'Иванович',
    required: false,
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({
    description: 'Название компании (для организаторов, необязательно)',
    example: 'ООО "Стоматология Плюс"',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiProperty({
    description: 'Реферальный код (необязательно)',
    example: 'REF123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiProperty({
    description:
      'Список id специальностей врача (непустой массив при мульти-режиме)',
    type: [Number],
    required: false,
    example: [1, 3, 7],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  specialtyIds?: number[];

  @ApiProperty({
    description:
      'Одна специальность (legacy): для врача достаточно specialtyIds или этого поля',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  specialtyId?: number;

  @ApiProperty({
    description: 'Номер телефона в формате E.164 (RU)',
    example: '+79991234567',
  })
  @IsPhoneNumber('RU')
  phone?: string;

  @ApiProperty({
    description: 'Должность лектора (для организаторов)',
    example: 'Главный врач стоматологической клиники',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  lecturerPosition?: string;

  @ApiProperty({
    description: 'Количество лет опыта лектора (для организаторов)',
    example: 15,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  lecturerYearsExperience?: number;

  @ApiProperty({
    description: 'Список регалий и достижений лектора (для организаторов)',
    example: ['Кандидат медицинских наук', 'Автор 20+ научных публикаций'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lecturerAchievements?: string[];

  @ApiProperty({
    description: 'URL фото лектора (для организаторов)',
    example: 'https://bucket.s3.region.amazonaws.com/lecturers/photo.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  lecturerPhotoUrl?: string;

  @ApiProperty({
    description: 'Биография лектора (для организаторов)',
    example: 'Опытный стоматолог с 15-летним стажем...',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  lecturerBio?: string;
}

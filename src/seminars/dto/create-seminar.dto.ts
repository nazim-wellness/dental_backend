import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  MaxLength,
  IsUrl,
  IsEmail,
  IsDateString,
  Matches,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';

export class CreateSeminarDto {
  @ApiProperty({
    description: 'Название семинара',
    example: 'Современные методы имплантации',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Описание семинара',
    example: 'Подробное описание программы семинара...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    description: 'Город проведения',
    example: 'Москва',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({
    description: 'Цена участия (в рублях)',
    example: 15000.0,
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    description:
      'Дата проведения (ISO 8601). Если указан eventDays, то берется из первого дня',
    example: '2024-12-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @ApiProperty({
    description:
      'Время проведения (HH:MM). Если указан eventDays, то берется из первого дня',
    example: '10:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть в формате HH:MM',
  })
  eventTime?: string;

  @ApiProperty({
    description: 'Массив URL фото семинара (максимум 10)',
    example: [
      'https://bucket.s3.region.amazonaws.com/seminars/photo1.jpg',
      'https://bucket.s3.region.amazonaws.com/seminars/photo2.jpg',
    ],
    required: false,
    type: [String],
    maxItems: 10,
  })
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10, {
    message: 'Можно загрузить максимум 10 фото',
  })
  photoUrls?: string[];

  @ApiProperty({
    description: 'Контактный телефон',
    example: '+79991234567',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({
    description: 'Дополнительный контактный телефон (необязательный)',
    example: '+79991234568',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  secondaryPhone?: string;

  @ApiProperty({
    description: 'Контактный email',
    example: 'contact@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Контактный Telegram',
    example: '@username',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactTelegram?: string;

  @ApiProperty({
    description: 'ID лектора',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  lecturerId!: number;

  @ApiProperty({
    description: 'ID формата семинара',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  formatId!: number;

  @ApiProperty({
    description: 'Тема семинара',
    example: 'Имплантация',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  topic?: string;

  @ApiProperty({
    description: 'ID специальности',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  specialtyId?: number;

  @ApiProperty({
    description:
      'Дни проведения семинара (если указаны, то eventDate и eventTime берутся из первого дня)',
    example: [
      { date: '2025-12-02', startTime: '10:00', endTime: '18:00' },
      { date: '2025-12-03', startTime: '09:00', endTime: '17:00' },
    ],
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date' },
        startTime: {
          type: 'string',
          pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
        },
        endTime: {
          type: 'string',
          pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$',
        },
      },
    },
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventDayDto)
  eventDays?: EventDayDto[];
}

class EventDayDto {
  @ApiProperty({
    description: 'Дата проведения (ISO 8601)',
    example: '2025-12-02',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    description: 'Время начала (HH:MM)',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время начала должно быть в формате HH:MM',
  })
  startTime!: string;

  @ApiProperty({
    description: 'Время окончания (HH:MM)',
    example: '18:00',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время окончания должно быть в формате HH:MM',
  })
  endTime!: string;
}

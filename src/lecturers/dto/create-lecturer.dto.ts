import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreateLecturerDto {
  @ApiProperty({
    description: 'Имя лектора',
    example: 'Иван',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({
    description: 'Фамилия лектора',
    example: 'Иванов',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({
    description: 'Отчество лектора',
    example: 'Иванович',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({
    description: 'Должность',
    example: 'Главный врач стоматологической клиники',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  position!: string;

  @ApiProperty({
    description: 'Количество лет опыта',
    example: 15,
  })
  @IsInt()
  @Min(0)
  yearsExperience!: number;

  @ApiProperty({
    description: 'Список регалий и достижений',
    example: ['Кандидат медицинских наук', 'Автор 20+ научных публикаций'],
    type: [String],
  })
  @IsArray()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return value as string[];
    return value.map((item: string | number) =>
      typeof item === 'number' ? String(item) : item,
    );
  })
  @IsString({ each: true })
  achievements!: string[];

  @ApiProperty({
    description: 'URL фото лектора',
    example: 'https://bucket.s3.region.amazonaws.com/lecturers/photo.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({
    description: 'Биография лектора',
    example: 'Опытный стоматолог с 15-летним стажем...',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  bio?: string;
}

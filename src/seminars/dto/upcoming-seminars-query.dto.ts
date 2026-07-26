import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';

/**
 * DTO для параметров запроса неистекших семинаров с пагинацией, поиском и фильтрами
 */
export class UpcomingSeminarsQueryDto {
  @ApiPropertyOptional({
    description: 'Номер страницы (начиная с 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Поиск по названию семинара, имени лектора и имени организатора',
    example: 'стоматология',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Фильтр по забронированным семинарам текущего пользователя. ' +
      'true - только забронированные, false - только незабронированные, не указан - все семинары',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  booked?: boolean;

  @ApiPropertyOptional({
    description: 'Фильтр по городу',
    example: 'Москва',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Дата начала диапазона (формат: YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Дата конца диапазона (формат: YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Минимальная цена',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Максимальная цена',
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({
    description: 'ID лектора',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lecturerId?: number;

  @ApiPropertyOptional({
    description: 'ID организатора',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  organizerId?: number;

  @ApiPropertyOptional({
    description:
      'Список специальностей через запятую. ' +
      'Значения: general, implantology, orthodontics, periodontics, endodontics, pediatric, aesthetic, surgery, prosthetics',
    example: 'general,implantology',
  })
  @IsOptional()
  @IsString()
  specialties?: string;
}

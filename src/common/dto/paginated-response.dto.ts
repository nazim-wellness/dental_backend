import { ApiProperty } from '@nestjs/swagger';

/**
 * Метаданные пагинации
 */
export class PaginationMetaDto {
  @ApiProperty({ description: 'Текущая страница', example: 1 })
  currentPage!: number;

  @ApiProperty({ description: 'Количество элементов на странице', example: 10 })
  itemsPerPage!: number;

  @ApiProperty({ description: 'Общее количество элементов', example: 50 })
  totalItems!: number;

  @ApiProperty({ description: 'Общее количество страниц', example: 5 })
  totalPages!: number;

  @ApiProperty({ description: 'Есть ли следующая страница', example: true })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Есть ли предыдущая страница', example: false })
  hasPreviousPage!: boolean;
}

/**
 * Обобщенный класс для пагинированных ответов
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Массив данных текущей страницы', isArray: true })
  data!: T[];

  @ApiProperty({ description: 'Метаданные пагинации', type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

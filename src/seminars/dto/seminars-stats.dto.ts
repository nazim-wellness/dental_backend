import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для статистики семинаров пользователя
 */
export class SeminarsStatsDto {
  @ApiProperty({
    description: 'Количество неистекших семинаров, доступных для бронирования',
    example: 25,
  })
  availableCount!: number;

  @ApiProperty({
    description: 'Количество забронированных семинаров',
    example: 5,
  })
  bookedCount!: number;

  @ApiProperty({
    description: 'Общее количество неистекших семинаров',
    example: 30,
  })
  totalCount!: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddToFavoritesDto {
  @ApiProperty({
    description: 'ID семинара для добавления в избранное',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  seminarId!: number;
}

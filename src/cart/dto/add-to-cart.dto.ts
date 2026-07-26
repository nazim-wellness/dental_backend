import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID семинара для добавления в корзину',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  seminarId!: number;
}

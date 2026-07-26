import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID семинара для бронирования',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  seminarId!: number;

  @ApiPropertyOptional({
    description: 'Платёжный токен, полученный из виджета ЮKassa',
    example: 'pt-2af0c5e0-5c43-4856-b498-1f72e2e6e89c',
  })
  @IsOptional()
  @IsString()
  paymentToken?: string;

  @ApiPropertyOptional({
    description: 'Тип платёжного метода (bank_card, yoo_money, sbp и др.)',
    example: 'bank_card',
  })
  @IsOptional()
  @IsString()
  paymentMethodType?: string;
}

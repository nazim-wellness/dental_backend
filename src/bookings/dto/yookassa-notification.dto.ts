import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class YookassaAmountDto {
  @ApiProperty({ description: 'Сумма', example: '15000.00' })
  @IsString()
  value!: string;

  @ApiProperty({ description: 'Валюта', example: 'RUB' })
  @IsString()
  currency!: string;
}

class YookassaPaymentObjectDto {
  @ApiProperty({
    description: 'ID платежа в ЮKassa',
    example: '22c5d173-000f-5000-9000-1bdf241d4651',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Статус платежа',
    example: 'succeeded',
  })
  @IsString()
  status!: string;

  @ApiProperty({ type: YookassaAmountDto })
  @ValidateNested()
  @Type(() => YookassaAmountDto)
  amount!: YookassaAmountDto;

  @ApiProperty({
    description: 'Признак оплаты',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @ApiProperty({
    description: 'Метаданные, переданные при создании платежа',
    required: false,
    additionalProperties: true,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class YookassaNotificationDto {
  @ApiProperty({
    description: 'Событие ЮKassa',
    example: 'payment.succeeded',
  })
  @IsString()
  event!: string;

  @ApiProperty({
    description: 'Тип объекта',
    example: 'notification',
  })
  @IsString()
  type!: string;

  @ApiProperty({ type: YookassaPaymentObjectDto })
  @ValidateNested()
  @Type(() => YookassaPaymentObjectDto)
  object!: YookassaPaymentObjectDto;
}

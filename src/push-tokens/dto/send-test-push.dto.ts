import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class SendTestPushDto {
  @ApiProperty({
    description: 'Заголовок уведомления',
    example: 'Тестовое уведомление',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    description: 'Текст уведомления',
    example: 'Это тестовое push-уведомление',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  body!: string;

  @ApiProperty({
    description: 'Дополнительные данные (необязательно)',
    example: { seminarId: '123', type: 'booking' },
    required: false,
  })
  @IsOptional()
  data?: Record<string, string>;
}

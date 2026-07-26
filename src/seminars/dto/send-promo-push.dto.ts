import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class SendPromoPushDto {
  @ApiProperty({
    description: 'ID семинара для отправки рекламного push-уведомления',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  seminarId!: number;
}

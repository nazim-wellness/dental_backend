import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SavePushTokenDto {
  @ApiProperty({
    description: 'Уникальный идентификатор устройства',
    example: 'device-uuid-12345',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId!: string;

  @ApiProperty({
    description: 'Firebase Cloud Messaging токен',
    example: 'fcm-token-abc123xyz456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  token!: string;
}

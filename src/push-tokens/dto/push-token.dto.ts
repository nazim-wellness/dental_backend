import { ApiProperty } from '@nestjs/swagger';

export class PushTokenDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'device-uuid-12345' })
  deviceId!: string;

  @ApiProperty({ example: 'fcm-token-abc123xyz456' })
  token!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

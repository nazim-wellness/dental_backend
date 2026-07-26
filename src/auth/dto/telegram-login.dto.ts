import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type TelegramLoginDto = {
  readonly id: number;
  readonly first_name: string;
  readonly last_name?: string;
  readonly username?: string;
  readonly photo_url?: string;
  readonly auth_date: number;
  readonly hash: string;
  readonly role?: 'ORGANIZER' | 'DOCTOR';
};

export class TelegramLoginBody implements TelegramLoginDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: 123456789,
  })
  @IsNumber()
  id!: number;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
  })
  @IsString()
  @MinLength(1)
  first_name!: string;

  @ApiProperty({
    description: 'Фамилия пользователя (опционально)',
    example: 'Иванов',
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    description: 'Username пользователя (опционально)',
    example: 'ivanov',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'URL фото пользователя (опционально)',
    required: false,
  })
  @IsString()
  @IsOptional()
  photo_url?: string;

  @ApiProperty({
    description: 'Unix timestamp авторизации',
    example: 1234567890,
  })
  @IsNumber()
  auth_date!: number;

  @ApiProperty({
    description: 'Hash для проверки подлинности данных',
    example: 'abc123def456...',
  })
  @IsString()
  @MinLength(1)
  hash!: string;

  @ApiProperty({
    description: 'Роль пользователя (опционально, по умолчанию DOCTOR)',
    enum: ['ORGANIZER', 'DOCTOR'],
    required: false,
  })
  @IsEnum(['ORGANIZER', 'DOCTOR'] as const)
  @IsOptional()
  role?: 'ORGANIZER' | 'DOCTOR';
}

import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type TelegramAuthDto = {
  readonly initData: string;
  readonly role: 'ORGANIZER' | 'DOCTOR';
};

export class TelegramAuthBody implements TelegramAuthDto {
  @ApiProperty({
    description:
      'Строка initData от Telegram WebApp, содержащая данные пользователя и hash для проверки',
    example:
      'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22username%22%3A%22johndoe%22%7D&auth_date=1234567890&hash=abc123...',
  })
  @IsString()
  initData!: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['ORGANIZER', 'DOCTOR'],
  })
  @IsEnum(['ORGANIZER', 'DOCTOR'] as const)
  role!: 'ORGANIZER' | 'DOCTOR';
}

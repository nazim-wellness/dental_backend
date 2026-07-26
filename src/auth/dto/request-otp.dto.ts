import { IsEnum, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type RequestOtpDto = {
  readonly phone: string;
  readonly role: 'ORGANIZER' | 'DOCTOR';
};

export class RequestOtpBody implements RequestOtpDto {
  @ApiProperty({
    description: 'Номер телефона в формате E.164 (RU)',
    example: '+79991234567',
  })
  @IsPhoneNumber('RU')
  phone!: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['ORGANIZER', 'DOCTOR'],
  })
  @IsEnum(['ORGANIZER', 'DOCTOR'] as const)
  role!: 'ORGANIZER' | 'DOCTOR';
}

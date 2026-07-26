import { IsEnum, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type VerifyOtpDto = {
  readonly phone: string;
  readonly code: string;
  readonly role: 'ORGANIZER' | 'DOCTOR';
};

export class VerifyOtpBody implements VerifyOtpDto {
  @ApiProperty({
    description: 'Номер телефона в формате E.164 (RU)',
    example: '+79991234567',
  })
  @IsPhoneNumber('RU')
  phone!: string;

  @ApiProperty({ description: 'OTP-код из СМС', minLength: 4, maxLength: 6 })
  @IsString()
  @Length(4, 6)
  code!: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: ['ORGANIZER', 'DOCTOR'],
  })
  @IsEnum(['ORGANIZER', 'DOCTOR'] as const)
  role!: 'ORGANIZER' | 'DOCTOR';
}

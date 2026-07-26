import {
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type RegisterEmailDto = {
  readonly email: string;
  readonly password: string;
  readonly phone: string;
  readonly role: 'ORGANIZER' | 'DOCTOR';
};

export class RegisterEmailBody implements RegisterEmailDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Пароль',
    minLength: 8,
    example: 'StrongPass123',
  })
  @IsString()
  @MinLength(8)
  password!: string;

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

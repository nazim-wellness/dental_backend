import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type RequestEmailCodeDto = {
  readonly email: string;
};

export class RequestEmailCodeBody implements RequestEmailCodeDto {
  @ApiProperty({
    description: 'Email, на который отправить код входа',
    example: 'user@mail.ru',
  })
  @IsEmail()
  email!: string;
}

export type VerifyEmailCodeDto = {
  readonly email: string;
  readonly code: string;
  readonly role: 'ORGANIZER' | 'DOCTOR';
};

export class VerifyEmailCodeBody implements VerifyEmailCodeDto {
  @ApiProperty({ description: 'Email', example: 'user@mail.ru' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Код из письма', example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({
    description: 'Роль пользователя при регистрации',
    enum: ['ORGANIZER', 'DOCTOR'],
  })
  @IsEnum(['ORGANIZER', 'DOCTOR'] as const)
  role!: 'ORGANIZER' | 'DOCTOR';
}

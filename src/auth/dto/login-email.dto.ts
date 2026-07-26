import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type LoginEmailDto = {
  readonly email: string;
  readonly password: string;
};

export class LoginEmailBody implements LoginEmailDto {
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
}

import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type OAuthCodeDto = {
  readonly code: string;
  readonly role: 'ORGANIZER' | 'DOCTOR';
  readonly redirectUri?: string;
};

export class OAuthCodeBody implements OAuthCodeDto {
  @ApiProperty({
    description:
      'Код авторизации, полученный от провайдера (Яндекс ID / VK ID)',
  })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({
    description: 'Роль пользователя при регистрации',
    enum: ['ORGANIZER', 'DOCTOR'],
  })
  @IsEnum(['ORGANIZER', 'DOCTOR'] as const)
  role!: 'ORGANIZER' | 'DOCTOR';

  @ApiPropertyOptional({
    description:
      'redirect_uri, использованный при авторизации (если отличается от адреса по умолчанию)',
  })
  @IsOptional()
  @IsString()
  redirectUri?: string;
}

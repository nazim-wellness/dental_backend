import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type RefreshTokenDto = {
  readonly refreshToken: string;
};

export class RefreshTokenBody implements RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh токен для получения новых access и refresh токенов',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken!: string;
}

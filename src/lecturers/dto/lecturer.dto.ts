import { ApiProperty } from '@nestjs/swagger';

export class LecturerDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Иван' })
  firstName!: string;

  @ApiProperty({ example: 'Иванов' })
  lastName!: string;

  @ApiProperty({ example: 'Иванович', required: false })
  middleName?: string;

  @ApiProperty({ example: 'Главный врач стоматологической клиники' })
  position!: string;

  @ApiProperty({ example: 15 })
  yearsExperience!: number;

  @ApiProperty({
    example: ['Кандидат медицинских наук', 'Автор 20+ научных публикаций'],
    type: [String],
  })
  achievements!: string[];

  @ApiProperty({
    example: 'https://bucket.s3.region.amazonaws.com/lecturers/photo.jpg',
    required: false,
  })
  photoUrl?: string;

  @ApiProperty({
    example: 'Опытный стоматолог с 15-летним стажем...',
    required: false,
  })
  bio?: string;
}

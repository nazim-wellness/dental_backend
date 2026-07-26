import { ApiProperty } from '@nestjs/swagger';

class MySeminarLecturerDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Иван' })
  firstName!: string;

  @ApiProperty({ example: 'Иванов' })
  lastName!: string;

  @ApiProperty({ example: 'Иванович', required: false })
  middleName?: string;
}

class MySeminarFormatDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Мастер-класс' })
  name!: string;
}

export class MySeminarDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Современные методы имплантации' })
  title!: string;

  @ApiProperty({ example: 'Москва' })
  city!: string;

  @ApiProperty({ example: 15000 })
  price!: number;

  @ApiProperty({ example: '2024-12-15' })
  eventDate!: string;

  @ApiProperty({ example: '10:00' })
  eventTime!: string;

  @ApiProperty({
    example: [
      'https://s3.twcstorage.ru/bucket/seminars/photo1.jpg',
      'https://s3.twcstorage.ru/bucket/seminars/photo2.jpg',
    ],
    required: false,
    type: [String],
  })
  photoUrls?: string[];

  @ApiProperty({ type: () => MySeminarLecturerDto })
  lecturer!: MySeminarLecturerDto;

  @ApiProperty({ type: () => MySeminarFormatDto })
  format!: MySeminarFormatDto;

  @ApiProperty({
    description: 'Количество уникальных просмотров',
    example: 150,
  })
  uniqueViewsCount!: number;

  @ApiProperty({
    description: 'Количество бронирований',
    example: 25,
  })
  bookingsCount!: number;
}

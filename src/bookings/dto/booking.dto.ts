import { ApiProperty } from '@nestjs/swagger';

class BookingSeminarLecturerDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Иван' })
  firstName!: string;

  @ApiProperty({ example: 'Иванов' })
  lastName!: string;

  @ApiProperty({ example: 'Петрович', required: false })
  middleName?: string;
}

class BookingSeminarFormatDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Мастер-класс' })
  name!: string;
}

class BookingSeminarDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Современные методы имплантации' })
  title!: string;

  @ApiProperty({ example: 'Подробное описание программы семинара...' })
  description!: string;

  @ApiProperty({ example: 'Москва' })
  city!: string;

  @ApiProperty({ example: 15000.0 })
  price!: number;

  @ApiProperty({ example: '2024-12-15' })
  eventDate!: string;

  @ApiProperty({ example: '10:00' })
  eventTime!: string;

  @ApiProperty({
    example: [
      'https://bucket.s3.region.amazonaws.com/seminars/photo1.jpg',
      'https://bucket.s3.region.amazonaws.com/seminars/photo2.jpg',
    ],
    required: false,
    type: [String],
  })
  photoUrls?: string[];

  @ApiProperty({ type: () => BookingSeminarLecturerDto })
  lecturer!: BookingSeminarLecturerDto;

  @ApiProperty({ type: () => BookingSeminarFormatDto })
  format!: BookingSeminarFormatDto;
}

export class BookingDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  seminarId!: number;

  @ApiProperty({
    example: 'pending',
    description: 'Статус бронирования (pending, confirmed, cancelled)',
  })
  status!: string;

  @ApiProperty({ type: () => BookingSeminarDto })
  seminar!: BookingSeminarDto;

  @ApiProperty({ example: '2024-11-03T19:00:00.000Z' })
  bookedAt!: Date;
}

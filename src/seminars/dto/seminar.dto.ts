import { ApiProperty } from '@nestjs/swagger';
import { LecturerDto } from '../../lecturers/dto/lecturer.dto';
import { SeminarFormatDto } from '../../seminar-formats/dto/seminar-format.dto';
import { SpecialtyResponse } from '../../profile/dto/specialty.dto';

class OrganizerDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Иван', required: false })
  firstName?: string;

  @ApiProperty({ example: 'Иванов', required: false })
  lastName?: string;

  @ApiProperty({ example: '+79991234567', required: false })
  phone?: string;
}

export class SeminarDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Современные методы имплантации' })
  title!: string;

  @ApiProperty({ example: 'Подробное описание программы семинара...' })
  description!: string;

  @ApiProperty({
    example: 'Имплантация',
    required: false,
    description: 'Тема семинара',
  })
  topic?: string;

  @ApiProperty({ example: 'Москва' })
  city!: string;

  @ApiProperty({ example: 15000.0 })
  price!: number;

  @ApiProperty({ example: '2024-12-15T00:00:00.000Z' })
  eventDate!: Date;

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

  @ApiProperty({ example: '+79991234567', required: false })
  contactPhone?: string;

  @ApiProperty({ example: '+79991234568', required: false })
  secondaryPhone?: string;

  @ApiProperty({ example: 'contact@example.com', required: false })
  contactEmail?: string;

  @ApiProperty({ example: '@username', required: false })
  contactTelegram?: string;

  @ApiProperty({
    description: 'Дни проведения семинара',
    example: [
      {
        date: '2025-12-02T00:00:00.000Z',
        startTime: '10:00',
        endTime: '18:00',
      },
      {
        date: '2025-12-03T00:00:00.000Z',
        startTime: '09:00',
        endTime: '17:00',
      },
    ],
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date-time' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
      },
    },
  })
  eventDays?: Array<{ date: Date; startTime: string; endTime: string }>;

  @ApiProperty({ type: () => OrganizerDto })
  organizer!: OrganizerDto;

  @ApiProperty({ type: () => LecturerDto })
  lecturer!: LecturerDto;

  @ApiProperty({ type: () => SeminarFormatDto })
  format!: SeminarFormatDto;

  @ApiProperty({
    type: () => SpecialtyResponse,
    required: false,
    description: 'Специальность семинара',
  })
  specialty?: SpecialtyResponse | null;

  @ApiProperty({ example: '2024-11-03T19:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-11-03T19:00:00.000Z' })
  updatedAt!: Date;
}

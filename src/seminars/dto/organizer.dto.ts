import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для информации об организаторе
 */
export class OrganizerDto {
  @ApiProperty({
    description: 'ID организатора',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Имя организатора',
    example: 'Иван',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия организатора',
    example: 'Иванов',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Отчество организатора',
    example: 'Иванович',
    required: false,
  })
  middleName?: string;

  @ApiProperty({
    description: 'Телефон организатора',
    example: '+79991234567',
    required: false,
  })
  phone?: string;
}

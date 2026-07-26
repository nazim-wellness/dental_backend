import { ApiProperty } from '@nestjs/swagger';

export class SeminarFormatDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Мастер-класс' })
  name!: string;

  @ApiProperty({
    example: 'Практический мастер-класс с отработкой навыков',
    required: false,
  })
  description?: string;
}

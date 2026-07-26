import { ApiProperty } from '@nestjs/swagger';

export type SpecialtyDto = {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
};

export class SpecialtyResponse implements SpecialtyDto {
  @ApiProperty({
    description: 'ID специальности',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Название специальности',
    example: 'Терапевтическая стоматология',
  })
  name!: string;

  @ApiProperty({
    description: 'Описание специальности',
    example: 'Лечение кариеса, пульпита, периодонтита',
    required: false,
  })
  description?: string;
}

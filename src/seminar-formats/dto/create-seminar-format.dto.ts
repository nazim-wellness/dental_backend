import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSeminarFormatDto {
  @ApiProperty({
    description: 'Название формата семинара',
    example: 'Мастер-класс',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Описание формата',
    example: 'Практический мастер-класс с отработкой навыков',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

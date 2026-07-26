import { PartialType } from '@nestjs/swagger';
import { CreateSeminarFormatDto } from './create-seminar-format.dto';

export class UpdateSeminarFormatDto extends PartialType(
  CreateSeminarFormatDto,
) {}

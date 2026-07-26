import { PartialType } from '@nestjs/swagger';
import { CreateSeminarDto } from './create-seminar.dto';

export class UpdateSeminarDto extends PartialType(CreateSeminarDto) {}

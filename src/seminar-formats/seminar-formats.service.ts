import { Injectable } from '@nestjs/common';
import { SeminarFormatRepository } from '../repositories/seminar-format.repository';
import { CreateSeminarFormatDto } from './dto/create-seminar-format.dto';
import { UpdateSeminarFormatDto } from './dto/update-seminar-format.dto';
import { SeminarFormatDto } from './dto/seminar-format.dto';

@Injectable()
export class SeminarFormatsService {
  constructor(private readonly seminarFormatRepo: SeminarFormatRepository) {}

  async create(dto: CreateSeminarFormatDto): Promise<SeminarFormatDto> {
    const format = await this.seminarFormatRepo.create({
      name: dto.name,
      description: dto.description,
    });
    return this.mapToDto(format);
  }

  async findAll(): Promise<SeminarFormatDto[]> {
    const formats = await this.seminarFormatRepo.findAll();
    return formats.map((f) => this.mapToDto(f));
  }

  async findOne(id: number): Promise<SeminarFormatDto | null> {
    const format = await this.seminarFormatRepo.findById(id);
    if (!format) return null;
    return this.mapToDto(format);
  }

  async update(
    id: number,
    dto: UpdateSeminarFormatDto,
  ): Promise<SeminarFormatDto> {
    const format = await this.seminarFormatRepo.update(id, {
      name: dto.name,
      description: dto.description,
    });
    return this.mapToDto(format);
  }

  async remove(id: number): Promise<void> {
    await this.seminarFormatRepo.softDelete(id);
  }

  private mapToDto(format: {
    id: number;
    name: string;
    description: string | null;
  }): SeminarFormatDto {
    return {
      id: format.id,
      name: format.name,
      description: format.description ?? undefined,
    };
  }
}

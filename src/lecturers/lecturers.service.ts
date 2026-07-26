import { Injectable } from '@nestjs/common';
import { LecturerRepository } from '../repositories/lecturer.repository';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { LecturerDto } from './dto/lecturer.dto';

@Injectable()
export class LecturersService {
  constructor(private readonly lecturerRepo: LecturerRepository) {}

  async create(dto: CreateLecturerDto): Promise<LecturerDto> {
    const lecturer = await this.lecturerRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      position: dto.position,
      yearsExperience: dto.yearsExperience,
      achievements: dto.achievements,
      photoUrl: dto.photoUrl,
      bio: dto.bio,
    });
    return this.mapToDto(lecturer);
  }

  async findAll(): Promise<LecturerDto[]> {
    const lecturers = await this.lecturerRepo.findAll();
    return lecturers.map((l) => this.mapToDto(l));
  }

  async findOne(id: number): Promise<LecturerDto | null> {
    const lecturer = await this.lecturerRepo.findById(id);
    if (!lecturer) return null;
    return this.mapToDto(lecturer);
  }

  async update(id: number, dto: UpdateLecturerDto): Promise<LecturerDto> {
    const lecturer = await this.lecturerRepo.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      position: dto.position,
      yearsExperience: dto.yearsExperience,
      achievements: dto.achievements,
      photoUrl: dto.photoUrl,
      bio: dto.bio,
    });
    return this.mapToDto(lecturer);
  }

  async remove(id: number): Promise<void> {
    await this.lecturerRepo.softDelete(id);
  }

  private mapToDto(lecturer: {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string | null;
    position: string;
    yearsExperience: number;
    achievements: string[];
    photoUrl: string | null;
    bio: string | null;
  }): LecturerDto {
    return {
      id: lecturer.id,
      firstName: lecturer.firstName,
      lastName: lecturer.lastName,
      middleName: lecturer.middleName ?? undefined,
      position: lecturer.position,
      yearsExperience: lecturer.yearsExperience,
      achievements: lecturer.achievements,
      photoUrl: lecturer.photoUrl ?? undefined,
      bio: lecturer.bio ?? undefined,
    };
  }
}

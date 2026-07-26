import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreateLecturerParams = {
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName?: string;
  readonly position: string;
  readonly yearsExperience: number;
  readonly achievements: string[];
  readonly photoUrl?: string;
  readonly bio?: string;
  readonly userId?: number;
};

export type UpdateLecturerParams = {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly middleName?: string;
  readonly position?: string;
  readonly yearsExperience?: number;
  readonly achievements?: string[];
  readonly photoUrl?: string;
  readonly bio?: string;
};

export type LecturerRecord = {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName: string | null;
  readonly position: string;
  readonly yearsExperience: number;
  readonly achievements: string[];
  readonly photoUrl: string | null;
  readonly bio: string | null;
  readonly userId: number | null;
};

@Injectable()
export class LecturerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateLecturerParams): Promise<LecturerRecord> {
    return await this.prisma.lecturer.create({
      data: {
        firstName: params.firstName,
        lastName: params.lastName,
        middleName: params.middleName,
        position: params.position,
        yearsExperience: params.yearsExperience,
        achievements: params.achievements,
        photoUrl: params.photoUrl,
        bio: params.bio,
        userId: params.userId,
      },
    });
  }

  async findAll(): Promise<LecturerRecord[]> {
    return await this.prisma.lecturer.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findById(id: number): Promise<LecturerRecord | null> {
    return await this.prisma.lecturer.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: number): Promise<LecturerRecord | null> {
    return await this.prisma.lecturer.findUnique({
      where: { userId },
    });
  }

  async update(
    id: number,
    params: UpdateLecturerParams,
  ): Promise<LecturerRecord> {
    return await this.prisma.lecturer.update({
      where: { id },
      data: {
        firstName: params.firstName,
        lastName: params.lastName,
        middleName: params.middleName,
        position: params.position,
        yearsExperience: params.yearsExperience,
        achievements: params.achievements,
        photoUrl: params.photoUrl,
        bio: params.bio,
      },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.lecturer.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}

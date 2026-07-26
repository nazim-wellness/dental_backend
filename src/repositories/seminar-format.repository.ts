import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreateSeminarFormatParams = {
  readonly name: string;
  readonly description?: string;
};

export type UpdateSeminarFormatParams = {
  readonly name?: string;
  readonly description?: string;
};

export type SeminarFormatRecord = {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
};

@Injectable()
export class SeminarFormatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: CreateSeminarFormatParams,
  ): Promise<SeminarFormatRecord> {
    return await this.prisma.seminarFormat.create({
      data: {
        name: params.name,
        description: params.description,
      },
    });
  }

  async findAll(): Promise<SeminarFormatRecord[]> {
    return await this.prisma.seminarFormat.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<SeminarFormatRecord | null> {
    return await this.prisma.seminarFormat.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    params: UpdateSeminarFormatParams,
  ): Promise<SeminarFormatRecord> {
    return await this.prisma.seminarFormat.update({
      where: { id },
      data: {
        name: params.name,
        description: params.description,
      },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.seminarFormat.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

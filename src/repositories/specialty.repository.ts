import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SpecialtyDto } from '../profile/dto/specialty.dto';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;

type SpecialtyRecord = {
  id: number;
  name: string;
  description: string | null;
};

@Injectable()
export class SpecialtyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<SpecialtyDto[]> {
    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const specialties = await tx.specialty.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: { name: 'asc' },
      });

      return (specialties as SpecialtyRecord[]).map((specialty) => ({
        ...specialty,
        description: specialty.description ?? undefined,
      }));
    });
  }

  async findById(id: number): Promise<SpecialtyDto | null> {
    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const specialty = await tx.specialty.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      if (!specialty) {
        return null;
      }

      return {
        ...(specialty as SpecialtyRecord),

        description: (specialty as SpecialtyRecord).description ?? undefined,
      };
    });
  }

  /**
   * Проверка, что все id присутствуют среди активных специальностей (как в GET /profile/specialties).
   */
  async countActiveByIds(ids: readonly number[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }
    return await this.prisma.specialty.count({
      where: {
        id: { in: [...ids] },
        isActive: true,
      },
    });
  }
}

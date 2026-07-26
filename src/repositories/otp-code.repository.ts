import { Injectable } from '@nestjs/common';
import { OtpPurpose, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CreateOtpParams = {
  readonly phone: string;
  readonly codeHash: string;
  readonly purpose: OtpPurpose;
  readonly expiresAt: Date;
};

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;

@Injectable()
export class OtpCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateOtpParams): Promise<void> {
    await this.prisma.$transaction(async (tx: TransactionClient) => {
      await tx.otpCode.create({ data: params });
    });
  }

  async findValidLatest(params: {
    phone: string;
    purpose: OtpPurpose;
    now: Date;
  }): Promise<{ id: number; codeHash: string } | null> {
    const { phone, purpose, now } = params;

    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      return tx.otpCode.findFirst({
        where: { phone, purpose, usedAt: null, expiresAt: { gt: now } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, codeHash: true },
      });
    });
  }

  async markUsed(id: number, usedAt: Date): Promise<void> {
    await this.prisma.$transaction(async (tx: TransactionClient) => {
      await tx.otpCode.update({ where: { id }, data: { usedAt } });
    });
  }
}

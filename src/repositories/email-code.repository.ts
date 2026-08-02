import { Injectable } from '@nestjs/common';
import { OtpPurpose, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CreateEmailCodeParams = {
  readonly email: string;
  readonly codeHash: string;
  readonly purpose: OtpPurpose;
  readonly expiresAt: Date;
};

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;

@Injectable()
export class EmailCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateEmailCodeParams): Promise<void> {
    await this.prisma.$transaction(async (tx: TransactionClient) => {
      await tx.emailCode.create({ data: params });
    });
  }

  async countRecent(params: {
    email: string;
    purpose: OtpPurpose;
    since: Date;
  }): Promise<number> {
    const { email, purpose, since } = params;
    return await this.prisma.emailCode.count({
      where: { email, purpose, createdAt: { gt: since } },
    });
  }

  async findValidLatest(params: {
    email: string;
    purpose: OtpPurpose;
    now: Date;
  }): Promise<{ id: number; codeHash: string } | null> {
    const { email, purpose, now } = params;
    return await this.prisma.emailCode.findFirst({
      where: { email, purpose, usedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, codeHash: true },
    });
  }

  async markUsed(id: number, usedAt: Date): Promise<void> {
    await this.prisma.emailCode.update({
      where: { id },
      data: { usedAt },
    });
  }
}

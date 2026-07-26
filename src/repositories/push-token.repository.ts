import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type UpsertPushTokenParams = {
  readonly userId: number;
  readonly deviceId: string;
  readonly token: string;
};

export type PushTokenRecord = {
  readonly id: number;
  readonly userId: number;
  readonly deviceId: string;
  readonly token: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;

@Injectable()
export class PushTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(params: UpsertPushTokenParams): Promise<PushTokenRecord> {
    const { userId, deviceId, token } = params;

    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      // Проверяем существование пользователя перед созданием токена
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      try {
        return await tx.pushToken.upsert({
          where: {
            userId_deviceId: {
              userId,
              deviceId,
            },
          },
          update: {
            token,
            deletedAt: null,
          },
          create: {
            userId,
            deviceId,
            token,
          },
        });
      } catch (error: any) {
        // Обрабатываем ошибку foreign key constraint, если пользователь был удален между проверкой и созданием
        if (error?.code === 'P2003') {
          throw new NotFoundException(`User with id ${userId} not found`);
        }
        throw error;
      }
    });
  }

  async findByUserId(userId: number): Promise<PushTokenRecord[]> {
    return await this.prisma.$transaction((tx: TransactionClient) => {
      return tx.pushToken.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
      });
    });
  }

  async delete(userId: number, deviceId: string): Promise<void> {
    await this.prisma.$transaction(async (tx: TransactionClient) => {
      await tx.pushToken.updateMany({
        where: {
          userId,
          deviceId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }
}

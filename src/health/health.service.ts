import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type HealthReadiness = {
  readonly status: 'ok' | 'degraded' | 'down';
  readonly checks: { readonly db: 'up' | 'down' };
  readonly uptime: number;
  readonly timestamp: string;
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getStatus(): string {
    return 'ok';
  }

  async getReadiness(): Promise<HealthReadiness> {
    const uptime: number = process.uptime();
    const timestamp: string = new Date().toISOString();
    let db: 'up' | 'down' = 'up';
    try {
      await this.prisma.$executeRawUnsafe('SELECT 1');
    } catch {
      db = 'down';
    }
    const status: 'ok' | 'degraded' | 'down' = db === 'up' ? 'ok' : 'degraded';
    return { status, checks: { db }, uptime, timestamp };
  }
}

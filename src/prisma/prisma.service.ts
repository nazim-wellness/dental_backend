import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';
import { createLoggingExtension } from './middleware/logging.middleware';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly client: any;
  private readonly shouldConnect: boolean;

  constructor(private readonly configService: ConfigService) {
    const { databaseUrl } = configService.getAppConfig();
    const baseClient = new PrismaClient(
      databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
    );
    // Prisma 6 extensions return a complex type that TypeScript cannot properly infer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.client = baseClient.$extends(createLoggingExtension()) as any;
    this.shouldConnect = Boolean(databaseUrl);
  }

  async onModuleInit(): Promise<void> {
    if (this.shouldConnect) {
      await this.client.$connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.shouldConnect) {
      await this.client.$disconnect();
    }
  }

  /**
   * Returns Prisma client for integrations like AdminJS.
   */
  getClient(): PrismaClient {
    return this.client as PrismaClient;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get $connect() {
    return this.client.$connect.bind(this.client);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get $disconnect() {
    return this.client.$disconnect.bind(this.client);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get $executeRawUnsafe() {
    return this.client.$executeRawUnsafe.bind(this.client);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get user() {
    return this.client.user;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get otpCode() {
    return this.client.otpCode;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get specialty() {
    return this.client.specialty;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarFormat() {
    return this.client.seminarFormat;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get lecturer() {
    return this.client.lecturer;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminar() {
    return this.client.seminar;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarCart() {
    return this.client.seminarCart;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarBooking() {
    return this.client.seminarBooking;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarPayment() {
    return this.client.seminarPayment;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarFavorite() {
    return this.client.seminarFavorite;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarView() {
    return this.client.seminarView;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarPhoto() {
    return this.client.seminarPhoto;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get seminarEventDay() {
    return this.client.seminarEventDay;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get pushToken() {
    return this.client.pushToken;
  }
}

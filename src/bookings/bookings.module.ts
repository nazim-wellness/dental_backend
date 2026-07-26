import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsPaymentsController } from './bookings-payments.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './repositories/bookings.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { SeminarRepository } from '../repositories/seminar.repository';
import { SeminarViewRepository } from '../repositories/seminar-view.repository';
import { SeminarPhotoRepository } from '../repositories/seminar-photo.repository';
import { CartRepository } from '../cart/repositories/cart.repository';
import { SpecialtyRepository } from '../repositories/specialty.repository';
import { SeminarPaymentRepository } from '../repositories/seminar-payment.repository';
import { UserRepository } from '../repositories/user.repository';
import { YookassaService } from './services/yookassa.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [BookingsController, BookingsPaymentsController],
  providers: [
    BookingsService,
    BookingsRepository,
    UserRepository,
    SeminarRepository,
    SeminarViewRepository,
    SeminarPhotoRepository,
    CartRepository,
    SpecialtyRepository,
    SeminarPaymentRepository,
    YookassaService,
  ],
  exports: [BookingsService, BookingsRepository],
})
export class BookingsModule {}

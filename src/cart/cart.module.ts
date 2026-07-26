import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { SeminarRepository } from '../repositories/seminar.repository';
import { SeminarViewRepository } from '../repositories/seminar-view.repository';
import { SeminarPhotoRepository } from '../repositories/seminar-photo.repository';
import { SpecialtyRepository } from '../repositories/specialty.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    SeminarRepository,
    SeminarViewRepository,
    SeminarPhotoRepository,
    SpecialtyRepository,
  ],
  exports: [CartService, CartRepository],
})
export class CartModule {}

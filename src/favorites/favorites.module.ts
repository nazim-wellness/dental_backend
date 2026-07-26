import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { FavoritesRepository } from './repositories/favorites.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { SeminarRepository } from '../repositories/seminar.repository';
import { SeminarViewRepository } from '../repositories/seminar-view.repository';
import { SeminarPhotoRepository } from '../repositories/seminar-photo.repository';
import { SpecialtyRepository } from '../repositories/specialty.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FavoritesController],
  providers: [
    FavoritesService,
    FavoritesRepository,
    SeminarRepository,
    SeminarViewRepository,
    SeminarPhotoRepository,
    SpecialtyRepository,
  ],
  exports: [FavoritesService, FavoritesRepository],
})
export class FavoritesModule {}

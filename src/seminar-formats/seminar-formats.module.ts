import { Module } from '@nestjs/common';
import { SeminarFormatsService } from './seminar-formats.service';
import { SeminarFormatsController } from './seminar-formats.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SeminarFormatRepository } from '../repositories/seminar-format.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SeminarFormatsController],
  providers: [SeminarFormatsService, SeminarFormatRepository],
  exports: [SeminarFormatsService],
})
export class SeminarFormatsModule {}

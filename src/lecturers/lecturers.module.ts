import { Module } from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { LecturersController } from './lecturers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LecturerRepository } from '../repositories/lecturer.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LecturersController],
  providers: [LecturersService, LecturerRepository],
  exports: [LecturersService],
})
export class LecturersModule {}

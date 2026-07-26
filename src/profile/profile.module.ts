import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SpecialtyRepository } from '../repositories/specialty.repository';
import { UserRepository } from '../repositories/user.repository';
import { LecturerRepository } from '../repositories/lecturer.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    SpecialtyRepository,
    UserRepository,
    LecturerRepository,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}

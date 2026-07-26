import { Module } from '@nestjs/common';
import { SeminarsService } from './seminars.service';
import { SeminarsController } from './seminars.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SeminarRepository } from '../repositories/seminar.repository';
import { LecturerRepository } from '../repositories/lecturer.repository';
import { SeminarFormatRepository } from '../repositories/seminar-format.repository';
import { SeminarViewRepository } from '../repositories/seminar-view.repository';
import { SeminarPhotoRepository } from '../repositories/seminar-photo.repository';
import { SpecialtyRepository } from '../repositories/specialty.repository';
import { UserRepository } from '../repositories/user.repository';
import { PushTokenRepository } from '../repositories/push-token.repository';
import { PushTokensModule } from '../push-tokens/push-tokens.module';

@Module({
  imports: [PrismaModule, AuthModule, PushTokensModule],
  controllers: [SeminarsController],
  providers: [
    SeminarsService,
    SeminarRepository,
    LecturerRepository,
    SeminarFormatRepository,
    SeminarViewRepository,
    SeminarPhotoRepository,
    SpecialtyRepository,
    UserRepository,
    PushTokenRepository,
  ],
  exports: [SeminarsService],
})
export class SeminarsModule {}

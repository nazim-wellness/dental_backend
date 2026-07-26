import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { PushTokensController } from './push-tokens.controller';
import { PushTokensService } from './push-tokens.service';
import { PushTokenRepository } from '../repositories/push-token.repository';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule],
  controllers: [PushTokensController],
  providers: [PushTokensService, PushTokenRepository, FirebaseService],
  exports: [PushTokensService, FirebaseService],
})
export class PushTokensModule {}

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';
import { ConfigService } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true, // Разрешаем неизвестные переменные
        abortEarly: false, // Показываем все ошибки валидации
      },
      envFilePath: [process.env.NODE_ENV === 'test' ? '.env.test' : '.env'],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

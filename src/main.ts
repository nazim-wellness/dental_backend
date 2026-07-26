import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const { port } = configService.getAppConfig();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });
  app.useStaticAssets(join(__dirname, 'admin-assets'), {
    prefix: '/admin-assets',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dental API')
    .setDescription('Документация API для стоматологического сервиса')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'Auth',
    )
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDoc);
  await app.listen(port);
  app.enableCors({
    origin: true, // или '*' — разрешить любой origin
    credentials: true,
  });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

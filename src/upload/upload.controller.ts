import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Загрузка файлов')
@ApiBearerAuth('Auth')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Загрузить изображение',
    description:
      'Загружает изображение в S3 хранилище. Поддерживаются форматы: JPEG, PNG, WebP. Максимальный размер: 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения',
        },
        folder: {
          type: 'string',
          description: 'Папка для сохранения (seminars, lecturers, etc)',
          default: 'general',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Файл успешно загружен',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://bucket.s3.region.amazonaws.com/seminars/123-uuid.jpg',
        },
        key: {
          type: 'string',
          example: 'seminars/123-uuid.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат файла или размер превышает лимит',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    // По умолчанию сохраняем в папку general
    const folder = 'general';

    return await this.uploadService.uploadFile(file, folder);
  }

  @Post('seminar-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Загрузить фото семинара',
    description: 'Загружает фото семинара в S3',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadSeminarImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    return await this.uploadService.uploadFile(file, 'seminars');
  }

  @Post('lecturer-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Загрузить фото лектора',
    description: 'Загружает фото лектора в S3',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadLecturerImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    return await this.uploadService.uploadFile(file, 'lecturers');
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '../config/config.service';
import { randomUUID } from 'node:crypto';

export type UploadFileResult = {
  readonly url: string;
  readonly key: string;
};

/**
 * Сервис для работы с S3 хранилищем
 */
@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly publicUrl: string;
  private readonly endpoint: string;

  // Разрешенные MIME типы для изображений
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  // Максимальный размер файла (5MB)
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.getAppConfig().aws;

    this.bucketName = awsConfig.s3Bucket;
    this.region = awsConfig.region;
    this.publicUrl = awsConfig.s3PublicUrl;
    this.endpoint = awsConfig.s3Endpoint;

    const s3Config: {
      region: string;
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
      };
      endpoint?: string;
      forcePathStyle?: boolean;
    } = {
      region: this.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    };

    // Если указан custom endpoint (не AWS S3), используем его
    if (this.endpoint && this.endpoint.length > 0) {
      s3Config.endpoint = this.endpoint;
      s3Config.forcePathStyle = true; // Для S3-compatible хранилищ
      console.log('[UploadService] Using custom S3 endpoint:', this.endpoint);
    } else {
      console.log(
        '[UploadService] Using default AWS S3 endpoint for region:',
        this.region,
      );
    }

    console.log('[UploadService] S3 Config:', {
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      bucket: this.bucketName,
      forcePathStyle: s3Config.forcePathStyle,
    });

    this.s3Client = new S3Client(s3Config);
  }

  /**
   * Загружает файл в S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadFileResult> {
    this.validateFile(file);

    const key = this.generateKey(folder, file.originalname);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    // Формируем URL файла
    let url: string;
    if (this.publicUrl) {
      // Используем публичный URL (CDN или custom domain)
      url = `${this.publicUrl}/${this.bucketName}/${key}`;
    } else if (this.endpoint) {
      // Custom S3-compatible endpoint (TWC, MinIO и т.д.)
      url = `${this.endpoint}/${this.bucketName}/${key}`;
    } else {
      // Стандартный AWS S3
      url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    return { url, key };
  }

  /**
   * Удаляет файл из S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Получает подписанный URL для приватного файла
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Валидирует файл
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Недопустимый тип файла. Разрешены: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `Размер файла превышает максимальный (${this.maxFileSize / 1024 / 1024}MB)`,
      );
    }
  }

  /**
   * Генерирует уникальный ключ для файла
   */
  private generateKey(folder: string, originalName: string): string {
    const extension = originalName.split('.').pop();
    const uuid = randomUUID();
    const timestamp = Date.now();
    return `${folder}/${timestamp}-${uuid}.${extension}`;
  }

  /**
   * Извлекает ключ из полного URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Убираем первый слэш
      return urlObj.pathname.substring(1);
    } catch {
      return null;
    }
  }
}

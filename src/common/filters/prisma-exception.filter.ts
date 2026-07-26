import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import {
  UniqueConstraintException,
  ForeignKeyConstraintException,
  RecordNotFoundException,
  DatabaseValidationException,
} from '../exceptions/database.exception';

/**
 * Глобальный фильтр для обработки Prisma ошибок
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.handleKnownRequestError(exception, response);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      this.handleValidationError(exception, response);
    }
  }

  /**
   * Обрабатывает известные ошибки Prisma
   */
  private handleKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ): void {
    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = this.extractTarget(exception);
        const field = this.getFieldName(target);
        const error = new UniqueConstraintException(field);
        response.status(error.getStatus()).json(error.getResponse());
        break;
      }

      case 'P2003': {
        // Foreign key constraint violation
        const field = this.getFieldName(
          this.extractTarget(exception) || 'unknown',
        );
        const error = new ForeignKeyConstraintException(field);
        response.status(error.getStatus()).json(error.getResponse());
        break;
      }

      case 'P2025': {
        // Record not found
        const error = new RecordNotFoundException('Запись');
        response.status(error.getStatus()).json(error.getResponse());
        break;
      }

      case 'P2014': {
        // Required relation violation
        const error = new DatabaseValidationException(
          'Нарушено ограничение связи между таблицами',
        );
        response.status(error.getStatus()).json(error.getResponse());
        break;
      }

      case 'P2011': {
        // Null constraint violation
        const target = this.extractTarget(exception);
        const field = this.getFieldName(target);
        const error = new DatabaseValidationException(
          `Поле "${field}" не может быть пустым`,
          field,
        );
        response.status(error.getStatus()).json(error.getResponse());
        break;
      }

      default: {
        // Для неизвестных ошибок возвращаем общую ошибку БД
        response.status(500).json({
          statusCode: 500,
          message: 'Ошибка базы данных',
          error: 'Internal Server Error',
          code: exception.code,
        });
      }
    }
  }

  /**
   * Обрабатывает ошибки валидации Prisma
   */
  private handleValidationError(
    exception: Prisma.PrismaClientValidationError,
    response: Response,
  ): void {
    const error = new DatabaseValidationException(
      'Неверные данные для операции с базой данных',
    );
    response.status(error.getStatus()).json(error.getResponse());
  }

  /**
   * Извлекает целевое поле из метаданных ошибки
   */
  private extractTarget(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string | undefined {
    const meta = exception.meta as { target?: string[] } | undefined;
    if (meta?.target && Array.isArray(meta.target) && meta.target.length > 0) {
      return meta.target[0];
    }
    return undefined;
  }

  /**
   * Преобразует название поля в человекочитаемый формат
   */
  private getFieldName(field: string | undefined): string {
    if (!field) return 'неизвестное поле';

    const fieldNames: Record<string, string> = {
      phone: 'телефон',
      email: 'email',
      telegramId: 'Telegram ID',
      telegramUsername: 'Telegram username',
      referralCode: 'реферальный код',
      specialtyId: 'специальность',
    };

    return fieldNames[field] || field;
  }
}

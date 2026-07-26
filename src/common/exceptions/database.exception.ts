import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Исключение для конфликтов уникальности в БД
 */
export class UniqueConstraintException extends HttpException {
  constructor(field: string, value?: string) {
    const message = value
      ? `Значение "${value}" уже используется для поля "${field}"`
      : `Нарушено ограничение уникальности для поля "${field}"`;

    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
        field,
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Исключение для ошибок внешнего ключа (связей)
 */
export class ForeignKeyConstraintException extends HttpException {
  constructor(field: string, relatedEntity?: string) {
    const message = relatedEntity
      ? `Связанная запись "${relatedEntity}" не найдена для поля "${field}"`
      : `Нарушено ограничение внешнего ключа для поля "${field}"`;

    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
        field,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Исключение для ошибок записи не найдена
 */
export class RecordNotFoundException extends HttpException {
  constructor(entity: string, identifier?: string | number) {
    const message = identifier
      ? `${entity} с идентификатором "${identifier}" не найден`
      : `${entity} не найден`;

    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Исключение для ошибок валидации данных БД
 */
export class DatabaseValidationException extends HttpException {
  constructor(message: string, field?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
        field,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

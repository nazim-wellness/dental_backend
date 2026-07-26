# Обработка ошибок

## Обзор

В проекте реализована централизованная обработка ошибок базы данных (Prisma) с преобразованием в понятные HTTP ответы.

## Архитектура

### 1. Кастомные исключения (`src/common/exceptions/`)

#### `UniqueConstraintException`

Используется при нарушении уникальности (например, дублирование телефона, email).

**HTTP Status:** `409 Conflict`

```typescript
throw new UniqueConstraintException('phone', '+79991234567');
```

**Ответ:**

```json
{
  "statusCode": 409,
  "message": "Значение \"+79991234567\" уже используется для поля \"phone\"",
  "error": "Conflict",
  "field": "phone"
}
```

#### `ForeignKeyConstraintException`

Используется при нарушении внешнего ключа (связь не найдена).

**HTTP Status:** `400 Bad Request`

```typescript
throw new ForeignKeyConstraintException('specialtyId', 'Specialty');
```

**Ответ:**

```json
{
  "statusCode": 400,
  "message": "Связанная запись \"Specialty\" не найдена для поля \"specialtyId\"",
  "error": "Bad Request",
  "field": "specialtyId"
}
```

#### `RecordNotFoundException`

Используется когда запись не найдена.

**HTTP Status:** `404 Not Found`

```typescript
throw new RecordNotFoundException('User', 123);
```

**Ответ:**

```json
{
  "statusCode": 404,
  "message": "User с идентификатором \"123\" не найден",
  "error": "Not Found"
}
```

#### `DatabaseValidationException`

Используется для других ошибок валидации БД.

**HTTP Status:** `400 Bad Request`

```typescript
throw new DatabaseValidationException('Поле не может быть пустым', 'firstName');
```

**Ответ:**

```json
{
  "statusCode": 400,
  "message": "Поле не может быть пустым",
  "error": "Bad Request",
  "field": "firstName"
}
```

---

### 2. Глобальный фильтр (`src/common/filters/prisma-exception.filter.ts`)

Автоматически перехватывает ошибки Prisma и преобразует их в кастомные исключения.

#### Поддерживаемые коды ошибок Prisma:

| Код Prisma | Описание                 | HTTP Status | Исключение                      |
| ---------- | ------------------------ | ----------- | ------------------------------- |
| `P2002`    | Нарушение уникальности   | 409         | `UniqueConstraintException`     |
| `P2003`    | Нарушение внешнего ключа | 400         | `ForeignKeyConstraintException` |
| `P2025`    | Запись не найдена        | 404         | `RecordNotFoundException`       |
| `P2014`    | Нарушение связи          | 400         | `DatabaseValidationException`   |
| `P2011`    | Нарушение NOT NULL       | 400         | `DatabaseValidationException`   |
| Другие     | Общая ошибка БД          | 500         | -                               |

---

## Примеры использования

### Автоматическая обработка (рекомендуется)

Prisma ошибки автоматически обрабатываются глобальным фильтром:

```typescript
// В репозитории - просто делаем операцию
async updateProfile(params: UpdateProfileParams): Promise<void> {
  await this.prisma.user.update({
    where: { id: params.userId },
    data: {
      phone: params.phone, // Если телефон занят - автоматически вернется 409
      specialtyId: params.specialtyId, // Если не найдена - автоматически 400
    },
  });
}
```

**При дублировании телефона:**

```json
{
  "statusCode": 409,
  "message": "Значение уже используется для поля \"телефон\"",
  "error": "Conflict",
  "field": "телефон"
}
```

### Ручная обработка (когда нужна кастомная логика)

```typescript
import { UniqueConstraintException } from '../common/exceptions';

async createUser(phone: string): Promise<User> {
  // Проверяем существование до создания
  const existing = await this.prisma.user.findUnique({
    where: { phone }
  });

  if (existing) {
    throw new UniqueConstraintException('phone', phone);
  }

  return this.prisma.user.create({ data: { phone } });
}
```

---

## Локализация полей

Фильтр автоматически переводит названия полей на русский:

```typescript
private getFieldName(field: string | undefined): string {
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
```

Добавьте новые поля по необходимости.

---

## Тестирование

### Тест unique constraint:

```bash
curl -X 'PATCH' \
  'http://localhost:3000/profile' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79991234567"
}'
```

Если телефон занят:

```json
{
  "statusCode": 409,
  "message": "Значение уже используется для поля \"телефон\"",
  "error": "Conflict",
  "field": "телефон"
}
```

### Тест foreign key constraint:

```bash
curl -X 'PATCH' \
  'http://localhost:3000/profile' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "firstName": "Иван",
  "lastName": "Иванов",
  "specialtyId": 9999
}'
```

Если specialtyId не существует:

```json
{
  "statusCode": 400,
  "message": "Нарушено ограничение внешнего ключа для поля \"специальность\"",
  "error": "Bad Request",
  "field": "специальность"
}
```

---

## Best Practices

### ✅ DO

1. **Полагайтесь на автоматическую обработку** - глобальный фильтр обработает большинство случаев
2. **Используйте кастомные исключения** только когда нужна специфичная логика до операции с БД
3. **Добавляйте новые поля** в `getFieldName()` для локализации
4. **Логируйте критические ошибки** (те, что возвращают 500)

```typescript
// Хорошо - автоматическая обработка
async updateUser(id: number, data: UpdateData): Promise<void> {
  await this.prisma.user.update({ where: { id }, data });
}

// Хорошо - специфичная проверка до операции
async assignSpecialty(userId: number, specialtyId: number): Promise<void> {
  const specialty = await this.specialtyRepo.findById(specialtyId);
  if (!specialty) {
    throw new ForeignKeyConstraintException('specialtyId', 'Specialty');
  }
  await this.prisma.user.update({
    where: { id: userId },
    data: { specialtyId },
  });
}
```

### ❌ DON'T

1. **Не оборачивайте все Prisma операции в try-catch** - фильтр это сделает
2. **Не возвращайте 500** для ожидаемых ошибок (дубликаты, не найдено)
3. **Не показывайте внутренние детали БД** пользователям

```typescript
// Плохо - избыточный try-catch
async updateUser(id: number, data: UpdateData): Promise<void> {
  try {
    await this.prisma.user.update({ where: { id }, data });
  } catch (error) {
    // Фильтр уже это обработает!
    throw new InternalServerErrorException();
  }
}
```

---

## Расширение

### Добавление нового типа ошибки:

1. Создайте класс в `src/common/exceptions/database.exception.ts`
2. Добавьте обработку в `PrismaExceptionFilter`
3. Обновите эту документацию

### Добавление нового Prisma кода:

```typescript
// В prisma-exception.filter.ts
case 'P2XXX': {
  const error = new YourCustomException('message');
  response.status(error.getStatus()).json(error.getResponse());
  break;
}
```

---

## Справка по кодам ошибок Prisma

Полный список: https://www.prisma.io/docs/reference/api-reference/error-reference

Часто используемые:

- `P2002` - Unique constraint failed
- `P2003` - Foreign key constraint failed
- `P2025` - Record not found
- `P2011` - Null constraint violation
- `P2014` - Required relation violation

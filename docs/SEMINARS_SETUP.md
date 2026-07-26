# Настройка модуля семинаров

## 📦 Установка зависимостей

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @nestjs/platform-express multer
npm install -D @types/multer
```

## 🗄️ Миграция базы данных

```bash
# Создать миграцию
npx prisma migrate dev --name add_seminars

# Применить миграцию
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate
```

## 🔧 Переменные окружения

Добавьте в `.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
AWS_S3_PUBLIC_URL=https://your-cdn-url.com
```

## 📝 Структура модулей

### ✅ Созданные модули:

1. **Upload Module** - загрузка файлов в S3
   - `src/upload/`
2. **SeminarFormats Module** - форматы семинаров
   - `src/seminar-formats/`
3. **Lecturers Module** - лекторы (нужно создать)
   - `src/lecturers/`
4. **Seminars Module** - семинары (нужно создать)
   - `src/seminars/`

### 🔨 Что нужно создать:

#### 1. Lecturers Module

Создайте следующие файлы по аналогии с `seminar-formats`:

- `src/lecturers/lecturers.service.ts`
- `src/lecturers/lecturers.controller.ts`
- `src/lecturers/lecturers.module.ts`

#### 2. Seminars Module

Создайте:

- `src/seminars/seminars.service.ts` - основная логика
- `src/seminars/seminars.controller.ts` - REST API
- `src/seminars/seminars.module.ts` - модуль

**Важно:** В сервисе семинаров:

- При создании: автоматически устанавливать `organizerId` из текущего пользователя
- При обновлении: проверять через `SeminarOwnerGuard`
- Включать связанные данные (organizer, lecturer, format)

## 🔐 Права доступа

### Создание семинара:

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZER)
async create(@CurrentUser() user, @Body() dto) {
  // Автоматически устанавливаем organizerId
  return this.service.create(dto, user.userId);
}
```

### Обновление/Удаление:

```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, SeminarOwnerGuard)
async update(@Param('id') id, @Body() dto) {
  return this.service.update(id, dto);
}
```

## 📋 Регистрация модулей

В `src/app.module.ts`:

```typescript
import { UploadModule } from './upload/upload.module';
import { SeminarFormatsModule } from './seminar-formats/seminar-formats.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { SeminarsModule } from './seminars/seminars.module';

@Module({
  imports: [
    // ... existing imports
    UploadModule,
    SeminarFormatsModule,
    LecturersModule,
    SeminarsModule,
  ],
})
export class AppModule {}
```

## 🧪 Тестирование

### 1. Создать формат семинара

```bash
curl -X POST http://localhost:3000/seminar-formats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Мастер-класс",
    "description": "Практический мастер-класс"
  }'
```

### 2. Загрузить фото

```bash
curl -X POST http://localhost:3000/upload/seminar-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### 3. Создать лектора

```bash
curl -X POST http://localhost:3000/lecturers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Иванов",
    "position": "Главный врач",
    "yearsExperience": 15,
    "achievements": ["Кандидат медицинских наук"],
    "photoUrl": "https://..."
  }'
```

### 4. Создать семинар

```bash
curl -X POST http://localhost:3000/seminars \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Современные методы имплантации",
    "description": "Подробное описание...",
    "city": "Москва",
    "price": 15000,
    "eventDate": "2024-12-15",
    "eventTime": "10:00",
    "lecturerId": 1,
    "formatId": 1,
    "contactPhone": "+79991234567",
    "contactEmail": "contact@example.com"
  }'
```

## 📊 Модель данных

### Seminar

- `title` - название
- `description` - описание
- `city` - город
- `price` - цена
- `eventDate` - дата
- `eventTime` - время (HH:MM)
- `photoUrl` - фото
- `contactPhone`, `contactEmail`, `contactTelegram` - контакты
- `organizerId` → User (ORGANIZER)
- `lecturerId` → Lecturer
- `formatId` → SeminarFormat

### Lecturer

- `firstName`, `lastName`, `middleName` - ФИО
- `position` - должность
- `yearsExperience` - опыт (лет)
- `achievements` - регалии (JSON array)
- `photoUrl` - фото
- `bio` - биография

### SeminarFormat

- `name` - название
- `description` - описание

## 🔍 Пример сервиса семинаров

```typescript
@Injectable()
export class SeminarsService {
  async create(dto: CreateSeminarDto, organizerId: number) {
    return await this.prisma.seminar.create({
      data: {
        ...dto,
        organizerId,
        eventDate: new Date(dto.eventDate),
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lecturer: true,
        format: true,
      },
    });
  }

  async findAll(filters?: { city?: string; formatId?: number }) {
    return await this.prisma.seminar.findMany({
      where: {
        isActive: true,
        ...filters,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lecturer: true,
        format: true,
      },
      orderBy: { eventDate: 'asc' },
    });
  }
}
```

## 🎯 Checklist

- [ ] Установить зависимости AWS SDK и multer
- [ ] Создать миграцию БД
- [ ] Настроить переменные окружения
- [ ] Создать Lecturers Module
- [ ] Создать Seminars Module
- [ ] Зарегистрировать модули в App Module
- [ ] Протестировать загрузку файлов
- [ ] Протестировать CRUD операции
- [ ] Добавить фильтры и пагинацию (опционально)

## 📚 Дополнительные улучшения

1. **Фильтрация семинаров**
   - По городу
   - По формату
   - По дате
   - По диапазону цен

2. **Пагинация**
   - Добавить limit/offset
   - Или cursor-based pagination

3. **Поиск**
   - Полнотекстовый поиск по названию/описанию
   - Поиск по лектору

4. **Регистрация на семинары**
   - Таблица участников
   - Подтверждение участия
   - Оплата

5. **Уведомления**
   - Email напоминания
   - Telegram уведомления

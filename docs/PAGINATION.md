# Пагинация

## Обзор

В проекте реализована универсальная система пагинации для всех списочных эндпоинтов.

## 📦 Общие компоненты

### 1. **PaginationQueryDto** (`src/common/dto/pagination-query.dto.ts`)

Query параметры для пагинации:

```typescript
class PaginationQueryDto {
  page?: number = 1; // Номер страницы (от 1)
  limit?: number = 10; // Элементов на странице (1-100)
}
```

### 2. **PaginatedResponseDto** (`src/common/dto/paginated-response.dto.ts`)

Структура пагинированного ответа:

```typescript
class PaginatedResponseDto<T> {
  data: T[]; // Массив данных
  meta: PaginationMeta; // Метаданные пагинации
}

class PaginationMeta {
  currentPage: number; // Текущая страница
  itemsPerPage: number; // Элементов на странице
  totalItems: number; // Всего элементов
  totalPages: number; // Всего страниц
  hasNextPage: boolean; // Есть ли следующая страница
  hasPreviousPage: boolean; // Есть ли предыдущая страница
}
```

### 3. **Типы** (`src/common/types/pagination.types.ts`)

```typescript
type PaginationParams = {
  page: number;
  limit: number;
};

type PaginatedResult<T> = {
  data: T[];
  total: number;
};

// Утилита для вычисления метаданных
function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta;
```

---

## 🔨 Использование в проекте

### В Repository:

```typescript
import {
  PaginationParams,
  PaginatedResult,
} from '../common/types/pagination.types';

@Injectable()
export class YourRepository {
  async findAllPaginated(
    pagination: PaginationParams,
  ): Promise<PaginatedResult<YourRecord>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = { isActive: true, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.yourModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.yourModel.count({ where }),
    ]);

    return { data, total };
  }
}
```

### В Service:

```typescript
import {
  PaginationParams,
  calculatePaginationMeta,
} from '../common/types/pagination.types';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class YourService {
  async findAllPaginated(
    pagination: PaginationParams,
  ): Promise<PaginatedResponseDto<YourDto>> {
    const { data, total } = await this.repository.findAllPaginated(pagination);

    const meta = calculatePaginationMeta(
      pagination.page,
      pagination.limit,
      total,
    );

    return {
      data: data.map((item) => this.mapToDto(item)),
      meta,
    };
  }
}
```

### В Controller:

```typescript
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Controller('your-resource')
export class YourController {
  @Get()
  @ApiOperation({ summary: 'Получить список с пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'Пагинированный список',
    // Swagger схема будет автоматически сгенерирована
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<YourDto>> {
    return this.service.findAllPaginated({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }
}
```

---

## 🧪 Примеры использования

### Базовый запрос (страница 1, лимит 10):

```bash
GET http://localhost:3000/seminars/my
```

Ответ:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Семинар 1",
      "city": "Москва",
      "price": 15000,
      "eventDate": "2024-12-15",
      "eventTime": "10:00",
      "photoUrl": "https://...",
      "lecturer": { "id": 1, "firstName": "Иван", "lastName": "Иванов" },
      "format": { "id": 1, "name": "Мастер-класс" }
    }
    // ... ещё 9 элементов
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### С параметрами пагинации:

```bash
GET http://localhost:3000/seminars/my?page=2&limit=20
```

Ответ:

```json
{
  "data": [
    /* 20 элементов */
  ],
  "meta": {
    "currentPage": 2,
    "itemsPerPage": 20,
    "totalItems": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### Последняя страница:

```bash
GET http://localhost:3000/seminars/my?page=5&limit=10
```

Ответ:

```json
{
  "data": [ /* 10 элементов */ ],
  "meta": {
    "currentPage": 5,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": false,    ← Последняя страница
    "hasPreviousPage": true
  }
}
```

---

## 🎯 Swagger UI

В Swagger UI появятся query параметры:

**Query Parameters:**

- `page` (integer, optional) - Номер страницы (min: 1, default: 1)
- `limit` (integer, optional) - Элементов на странице (min: 1, max: 100, default: 10)

**Response Schema:**

```json
{
  "data": [
    /* array of items */
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## ⚙️ Валидация

- ✅ `page` - минимум 1
- ✅ `limit` - от 1 до 100
- ✅ По умолчанию: page=1, limit=10
- ✅ Автоматическое преобразование типов (string → number)

### Ошибки валидации:

```bash
# Неверная страница
GET /seminars/my?page=0
# 400: page must not be less than 1

# Превышен лимит
GET /seminars/my?limit=1000
# 400: limit must not be greater than 100

# Неверный тип
GET /seminars/my?page=abc
# 400: page must be an integer number
```

---

## 📊 Реализовано в эндпоинтах:

| Эндпоинт               | Пагинация | Описание                      |
| ---------------------- | --------- | ----------------------------- |
| `GET /seminars/my`     | ✅        | Свои семинары организатора    |
| `GET /seminars`        | ❌        | Все семинары (можно добавить) |
| `GET /lecturers`       | ❌        | Все лекторы (можно добавить)  |
| `GET /seminar-formats` | ❌        | Форматы (можно добавить)      |

---

## 🚀 Добавление пагинации в другие эндпоинты

### Шаг 1: Обновите Repository

```typescript
async findAllPaginated(
  pagination: PaginationParams,
): Promise<PaginatedResult<YourRecord>> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.yourModel.findMany({ skip, take: limit }),
    this.prisma.yourModel.count(),
  ]);

  return { data, total };
}
```

### Шаг 2: Обновите Service

```typescript
async findAllPaginated(
  pagination: PaginationParams,
): Promise<PaginatedResponseDto<YourDto>> {
  const { data, total } = await this.repo.findAllPaginated(pagination);

  const meta = calculatePaginationMeta(
    pagination.page,
    pagination.limit,
    total,
  );

  return {
    data: data.map((item) => this.mapToDto(item)),
    meta,
  };
}
```

### Шаг 3: Обновите Controller

```typescript
@Get()
async findAll(
  @Query() query: PaginationQueryDto,
): Promise<PaginatedResponseDto<YourDto>> {
  return this.service.findAllPaginated({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
  });
}
```

---

## 💡 Best Practices

### ✅ DO

1. **Используйте параллельные запросы** для data и count

   ```typescript
   const [data, total] = await Promise.all([
     this.prisma.findMany({ ... }),
     this.prisma.count({ ... }),
   ]);
   ```

2. **Одинаковые where условия** для findMany и count

3. **Разумные лимиты** - максимум 100 элементов

4. **Сортировка по умолчанию** - orderBy для предсказуемых результатов

### ❌ DON'T

1. **Не загружайте все данные** без пагинации для больших таблиц

2. **Не делайте отдельные запросы** для data и count последовательно

3. **Не разрешайте неограниченный limit**

---

## 📈 Производительность

- ✅ **Параллельные запросы** - data и count выполняются одновременно
- ✅ **OFFSET/LIMIT** - эффективная пагинация в PostgreSQL
- ✅ **Индексы** - используйте индексы для сортировки
- ✅ **Кеширование** - можно добавить Redis для total count

---

## 🎯 Пример для фронтенда

```typescript
// Vue 3 Composition API
const page = ref(1);
const limit = ref(10);

async function loadSeminars() {
  const response = await fetch(
    `/seminars/my?page=${page.value}&limit=${limit.value}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const result = await response.json();

  seminars.value = result.data;
  totalPages.value = result.meta.totalPages;
  hasMore.value = result.meta.hasNextPage;
}

function nextPage() {
  if (hasMore.value) {
    page.value++;
    loadSeminars();
  }
}
```

---

## ✅ Готово!

Универсальная система пагинации:

- ✅ Общие DTO и типы
- ✅ Валидация параметров
- ✅ Swagger документация
- ✅ Типобезопасность
- ✅ Легко переиспользовать в других эндпоинтах

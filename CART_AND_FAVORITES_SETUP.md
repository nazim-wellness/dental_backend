# Настройка модулей Корзины, Бронирований и Избранного

## Обзор

Добавлены три новых модуля для управления семинарами:

- **Корзина** (`cart`) - временное хранение семинаров перед бронированием
- **Бронирования** (`bookings`) - подтвержденные бронирования семинаров
- **Избранное** (`favorites`) - избранные семинары

## 📦 Структура

### Модуль Корзины (`src/cart/`)

```
src/cart/
├── repositories/
│   └── cart.repository.ts       # Репозиторий для работы с БД
├── dto/
│   ├── cart-item.dto.ts         # DTO элемента корзины
│   └── add-to-cart.dto.ts       # DTO для добавления в корзину
├── cart.service.ts              # Бизнес-логика
├── cart.controller.ts           # REST API эндпоинты
└── cart.module.ts               # Модуль NestJS
```

### Модуль Избранного (`src/favorites/`)

```
src/favorites/
├── repositories/
│   └── favorites.repository.ts  # Репозиторий для работы с БД
├── dto/
│   ├── favorite-item.dto.ts     # DTO элемента избранного
│   └── add-to-favorites.dto.ts  # DTO для добавления в избранное
├── favorites.service.ts         # Бизнес-логика
├── favorites.controller.ts      # REST API эндпоинты
└── favorites.module.ts          # Модуль NestJS
```

## 🗄️ Модели базы данных

### SeminarCart (Корзина)

```prisma
model SeminarCart {
  id        Int      @id @default(autoincrement())
  seminarId Int      @map("seminar_id")
  userId    Int      @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  seminar Seminar @relation(fields: [seminarId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([seminarId, userId])
  @@index([seminarId])
  @@index([userId])
  @@map("seminar_cart")
}
```

### SeminarBooking (Бронирования)

```prisma
model SeminarBooking {
  id        Int      @id @default(autoincrement())
  seminarId Int      @map("seminar_id")
  userId    Int      @map("user_id")
  status    String   @default("pending")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  seminar Seminar @relation(fields: [seminarId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([seminarId, userId])
  @@index([seminarId])
  @@index([userId])
  @@index([status])
  @@map("seminar_bookings")
}
```

### SeminarFavorite (Избранное)

```prisma
model SeminarFavorite {
  id        Int      @id @default(autoincrement())
  seminarId Int      @map("seminar_id")
  userId    Int      @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  seminar Seminar @relation(fields: [seminarId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([seminarId, userId])
  @@index([seminarId])
  @@index([userId])
  @@map("seminar_favorites")
}
```

## 🚀 Миграция базы данных

### Модуль Бронирований (`src/bookings/`)

```
src/bookings/
├── repositories/
│   └── bookings.repository.ts   # Репозиторий для работы с БД
├── dto/
│   ├── booking.dto.ts           # DTO бронирования
│   └── create-booking.dto.ts    # DTO для создания бронирования
├── bookings.service.ts          # Бизнес-логика
├── bookings.controller.ts       # REST API эндпоинты
└── bookings.module.ts           # Модуль NestJS
```

---

### Создать и применить миграцию:

```bash
npx prisma migrate dev --name add_cart_bookings_and_favorites
```

Эта команда:

1. Создаст новую миграцию
2. Применит её к базе данных
3. Перегенерирует Prisma Client

## 📡 API Эндпоинты

### Корзина

#### POST /cart

Добавить семинар в корзину

**Доступ:** DOCTOR

**Тело запроса:**

```json
{
  "seminarId": 1
}
```

**Ответы:**

- `201` - Семинар успешно добавлен в корзину
- `404` - Семинар не найден
- `409` - Семинар уже добавлен в корзину

---

#### GET /cart

Получить корзину

**Доступ:** DOCTOR

**Ответ:**

```json
[
  {
    "id": 1,
    "seminarId": 1,
    "seminar": {
      "id": 1,
      "title": "Современные методы имплантации",
      "description": "Подробное описание...",
      "city": "Москва",
      "price": 15000.0,
      "eventDate": "2024-12-15",
      "eventTime": "10:00",
      "photoUrl": "https://...",
      "lecturer": {
        "id": 1,
        "firstName": "Иван",
        "lastName": "Иванов",
        "middleName": "Петрович"
      },
      "format": {
        "id": 1,
        "name": "Мастер-класс"
      }
    },
    "addedAt": "2024-11-03T19:00:00.000Z"
  }
]
```

---

#### DELETE /cart/:seminarId

Удалить семинар из корзины

**Доступ:** DOCTOR

**Параметры:**

- `seminarId` - ID семинара

**Ответы:**

- `204` - Семинар успешно удалён из корзины
- `404` - Семинар не найден в корзине

---

### Бронирования

#### POST /bookings

Забронировать семинар

**Доступ:** DOCTOR

**Тело запроса:**

```json
{
  "seminarId": 1
}
```

**Ответы:**

- `201` - Семинар успешно забронирован
- `404` - Семинар не найден
- `409` - Семинар уже забронирован

**Примечание:** При создании бронирования семинар автоматически удаляется из корзины, если он там был.

---

#### GET /bookings

Получить бронирования

**Доступ:** DOCTOR

**Ответ:**

```json
[
  {
    "id": 1,
    "seminarId": 1,
    "status": "confirmed",
    "seminar": {
      "id": 1,
      "title": "Современные методы имплантации",
      "description": "Подробное описание...",
      "city": "Москва",
      "price": 15000.0,
      "eventDate": "2024-12-15",
      "eventTime": "10:00",
      "photoUrl": "https://...",
      "lecturer": {
        "id": 1,
        "firstName": "Иван",
        "lastName": "Иванов",
        "middleName": "Петрович"
      },
      "format": {
        "id": 1,
        "name": "Мастер-класс"
      }
    },
    "bookedAt": "2024-11-03T19:00:00.000Z"
  }
]
```

---

#### DELETE /bookings/:seminarId

Отменить бронирование

**Доступ:** DOCTOR

**Параметры:**

- `seminarId` - ID семинара

**Ответы:**

- `204` - Бронирование успешно отменено
- `404` - Бронирование не найдено

---

### Избранное

#### POST /favorites

Добавить семинар в избранное

**Доступ:** DOCTOR

**Тело запроса:**

```json
{
  "seminarId": 1
}
```

**Ответы:**

- `201` - Семинар успешно добавлен в избранное
- `404` - Семинар не найден
- `409` - Семинар уже добавлен в избранное

---

#### GET /favorites

Получить избранное

**Доступ:** DOCTOR

**Ответ:** Аналогичен GET /cart

---

#### DELETE /favorites/:seminarId

Удалить семинар из избранного

**Доступ:** DOCTOR

**Параметры:**

- `seminarId` - ID семинара

**Ответы:**

- `204` - Семинар успешно удалён из избранного
- `404` - Семинар не найден в избранном

---

## 🧪 Примеры использования

### Добавить семинар в корзину

```bash
curl -X POST http://localhost:3000/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seminarId": 1}'
```

### Получить корзину

```bash
curl -X GET http://localhost:3000/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Удалить из корзины

```bash
curl -X DELETE http://localhost:3000/cart/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Добавить в избранное

```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seminarId": 1}'
```

### Получить избранное

```bash
curl -X GET http://localhost:3000/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Удалить из избранного

```bash
curl -X DELETE http://localhost:3000/favorites/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚙️ Обновлённый эндпоинт семинаров

### GET /seminars/upcoming

Теперь параметр `booked` фильтрует семинары на основе бронирований (не корзины):

```bash
# Все неистекшие семинары
GET /seminars/upcoming

# Только забронированные семинары
GET /seminars/upcoming?booked=true

# Только незабронированные семинары
GET /seminars/upcoming?booked=false

# С поиском
GET /seminars/upcoming?search=имплантация&booked=true
```

---

## 📝 Архитектура

### Разделение ответственности

1. **Repository** - работа с БД через Prisma
   - CRUD операции
   - Фильтрация
   - Проверка существования

2. **Service** - бизнес-логика
   - Валидация
   - Маппинг в DTO
   - Обработка ошибок

3. **Controller** - HTTP API
   - Авторизация
   - Swagger документация
   - Обработка запросов/ответов

### Особенности реализации

- ✅ Отдельные модули для корзины и избранного
- ✅ Использование репозиториев [[memory:10743018]]
- ✅ Защита через JWT и роли (только DOCTOR)
- ✅ Уникальное ограничение (пользователь + семинар)
- ✅ Cascade delete при удалении пользователя или семинара
- ✅ Swagger документация
- ✅ Типобезопасность TypeScript

---

## ✅ Готово!

Модули корзины и избранного полностью настроены и готовы к использованию.

**Не забудьте применить миграцию:**

```bash
npx prisma migrate dev --name add_cart_bookings_and_favorites
```

---

## 🔄 Workflow использования

### Типичный сценарий использования:

1. **Пользователь просматривает семинары** → `GET /seminars/upcoming`
2. **Добавляет интересные в корзину** → `POST /cart`
3. **Добавляет избранные в избранное** → `POST /favorites`
4. **Просматривает корзину** → `GET /cart`
5. **Бронирует семинар из корзины** → `POST /bookings`
   - Семинар автоматически удаляется из корзины
6. **Просматривает свои бронирования** → `GET /bookings`

### Различие между модулями:

- **Корзина** - временное хранение, пользователь еще думает
- **Бронирования** - подтвержденное решение, пользователь зарегистрирован
- **Избранное** - семинары, которые нравятся, но не обязательно для бронирования

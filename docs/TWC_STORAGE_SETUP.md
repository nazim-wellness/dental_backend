# Настройка TWC Cloud Storage (S3-compatible)

## 📦 Конфигурация для TWC Storage

Для вашего случая используйте следующие настройки в `.env`:

```env
# TWC Cloud Storage Configuration
AWS_ACCESS_KEY_ID=M5AFY0R63S5R5ZZ7KZVC
AWS_SECRET_ACCESS_KEY=cw7CiGLs9eRbSVukHgLKBUpqYznphsHgHCf8s3R0
AWS_REGION=ru-1
AWS_S3_BUCKET=7cb6d027-8a835b14-10e4-4ae1-bab8-1d8c2447bd3d
AWS_S3_ENDPOINT=https://s3.twcstorage.ru
AWS_S3_PUBLIC_URL=https://s3.twcstorage.ru
```

## ✅ Ключевые моменты для TWC Storage:

### 1. **AWS_S3_ENDPOINT обязателен!**

```env
AWS_S3_ENDPOINT=https://s3.twcstorage.ru
```

Без этой переменной SDK будет пытаться подключиться к AWS (`bucket.s3.region.amazonaws.com`), что вызовет ошибку `ENOTFOUND`.

### 2. **forcePathStyle включен автоматически**

Когда указан custom endpoint, библиотека автоматически включает `forcePathStyle: true`, что нужно для S3-compatible хранилищ.

**Path style URL**: `https://s3.twcstorage.ru/bucket-name/file.jpg`  
**Virtual host style URL** (AWS): `https://bucket-name.s3.region.amazonaws.com/file.jpg`

### 3. **Формирование публичного URL**

Файлы будут доступны по адресу:

```
https://s3.twcstorage.ru/7cb6d027-8a835b14-10e4-4ae1-bab8-1d8c2447bd3d/seminars/123456-uuid.jpg
```

Где:

- `s3.twcstorage.ru` - endpoint
- `7cb6d027-8a835b14-10e4-4ae1-bab8-1d8c2447bd3d` - bucket name
- `seminars/123456-uuid.jpg` - key (путь к файлу)

## 🧪 Тестирование

### 1. Авторизуйтесь

```bash
curl -X POST http://localhost:3000/auth/telegram/dev-test \
  -H 'Content-Type: application/json' \
  -d '{
    "user": {
      "id": 841534211,
      "first_name": "Nata",
      "username": "l_nata_33",
      "auth_date": 1730921234
    },
    "role": "ORGANIZER"
  }'
```

Ответ:

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### 2. Загрузите файл

```bash
curl -X POST http://localhost:3000/upload/seminar-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

Ответ:

```json
{
  "url": "https://s3.twcstorage.ru/7cb6d027-8a835b14-10e4-4ae1-bab8-1d8c2447bd3d/seminars/1730921234567-uuid-abc.jpg",
  "key": "seminars/1730921234567-uuid-abc.jpg"
}
```

### 3. Проверьте доступность файла

Откройте URL из ответа в браузере. Файл должен загрузиться.

## 🔧 Troubleshooting

### Ошибка: ENOTFOUND

```
Error: getaddrinfo ENOTFOUND bucket.s3.region.amazonaws.com
```

**Решение:** Убедитесь, что `AWS_S3_ENDPOINT=https://s3.twcstorage.ru` установлена в `.env`

### Ошибка: Access Denied

```
AccessDenied: Access Denied
```

**Причины:**

1. Неправильный Access Key или Secret Key
2. Bucket не существует
3. Нет прав на запись в bucket

**Решение:** Проверьте credentials в TWC панели

### Ошибка: ACL not supported

```
NotImplemented: A header you provided implies functionality that is not implemented
```

**Решение:** Некоторые S3-compatible хранилища не поддерживают ACL. Обновите код:

```typescript
// В upload.service.ts уберите ACL
const command = new PutObjectCommand({
  Bucket: this.bucketName,
  Key: key,
  Body: file.buffer,
  ContentType: file.mimetype,
  // ACL: 'public-read',  // ← Закомментируйте или удалите
});
```

## 📋 Настройка прав в TWC Storage

1. Войдите в панель TWC Cloud
2. Перейдите в раздел Object Storage
3. Выберите ваш bucket
4. Настройте:
   - **Публичный доступ** - включен (для чтения)
   - **CORS** - настроен для вашего домена

### Пример CORS для TWC:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"]
  }
]
```

## 🎯 Итоговая конфигурация

Ваш `.env` должен выглядеть так:

```env
NODE_ENV=development
PORT=3000

# ... другие переменные ...

# TWC Cloud Storage
AWS_ACCESS_KEY_ID=M5AFY0R63S5R5ZZ7KZVC
AWS_SECRET_ACCESS_KEY=cw7CiGLs9eRbSVukHgLKBUpqYznphsHgHCf8s3R0
AWS_REGION=ru-1
AWS_S3_BUCKET=7cb6d027-8a835b14-10e4-4ae1-bab8-1d8c2447bd3d
AWS_S3_ENDPOINT=https://s3.twcstorage.ru
AWS_S3_PUBLIC_URL=https://s3.twcstorage.ru
```

## ✅ Результат

После настройки:

- ✅ Файлы загружаются в TWC Storage
- ✅ Формируется правильный публичный URL
- ✅ Файлы доступны по ссылке
- ✅ Работает с любым S3-compatible хранилищем (TWC, MinIO, DigitalOcean Spaces, и т.д.)

🎉 **Готово к использованию!**

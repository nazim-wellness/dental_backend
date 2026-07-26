# Переменные окружения

## Пример `.env` файла

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=https://your-api-domain.com  # Обязательно для production при ADMIN_JS_SKIP_BUNDLE=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dental?schema=public

# Security
OTP_PEPPER=your-otp-pepper-min-8-chars
JWT_SECRET=your-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-jwt-refresh-secret-min-32-characters-long

# AdminJS
ADMIN_EMAIL=admin@local.dev
ADMIN_PASSWORD=admin-password-min-8-chars
ADMIN_COOKIE_SECRET=admin-cookie-secret-min-16-chars
ADMIN_SESSION_SECRET=admin-session-secret-min-16-chars
ADMIN_ROOT_PATH=/admin

# ЮKassa
PAYMENT_URL=https://api.yookassa.ru/v3/payments
PAYMENT_REDIRECT_URL_USER=https://dev.guprpvv.ru/pay
PAYMENT_REDIRECT_URL=https://dev.guprpvv.ru/qr-complete
PAYMENT_LOGIN=your-yookassa-shop-id
PAYMENT_PASSWORD=your-yookassa-secret-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# AWS S3 / S3-compatible storage (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PUBLIC_URL=https://your-cdn-url.com
AWS_S3_ENDPOINT=https://s3.twcstorage.ru  # Для S3-compatible хранилищ (TWC, MinIO и т.д.)

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# SMS.RU (for SMS notifications)
SMS_RU_API_ID=your-sms-ru-api-id
```

## Описание переменных

### Application

- **NODE_ENV** - Окружение приложения
  - Возможные значения: `development`, `test`, `production`
  - По умолчанию: `development`

- **PORT** - Порт для запуска сервера
  - По умолчанию: `3000`

- **APP_URL** - Публичный URL приложения (без завершающего слеша)
  - Пример: `https://api.example.com`
  - Используется для AdminJS assets при `ADMIN_JS_SKIP_BUNDLE=true`
  - Обязательно в production при деплое через Docker
  - По умолчанию: `http://localhost:3000` в development

### Database

- **DATABASE_URL** - URL подключения к PostgreSQL
  - Формат: `postgresql://user:password@host:port/database?schema=public`
  - Обязательная для `production` и `development`
  - Опциональная для `test`

### Security

- **OTP_PEPPER** - Соль для хеширования OTP кодов
  - Минимум 8 символов
  - Обязательная в `production`
  - Опциональная в `development` (используется дефолтное значение)

- **JWT_SECRET** - Секрет для JWT access токенов
  - Минимум 32 символа
  - Обязательная в `production`
  - Опциональная в `development`

- **JWT_REFRESH_SECRET** - Секрет для JWT refresh токенов
  - Минимум 32 символа
  - Обязательная в `production`
  - Опциональная в `development`

### AdminJS

- **ADMIN_EMAIL** - Email администратора для входа в AdminJS
  - Формат: валидный email
  - Обязательная в `production`
  - Опциональная в `development`

- **ADMIN_PASSWORD** - Пароль администратора для входа в AdminJS
  - Минимум 8 символов
  - Обязательная в `production`
  - Опциональная в `development`

- **ADMIN_COOKIE_SECRET** - Секрет для подписи cookies AdminJS
  - Минимум 16 символов
  - Обязательная в `production`
  - Опциональная в `development`

- **ADMIN_SESSION_SECRET** - Секрет для сессии AdminJS
  - Минимум 16 символов
  - Обязательная в `production`
  - Опциональная в `development`

- **ADMIN_ROOT_PATH** - URL префикс для AdminJS
  - Формат: путь, начинающийся с `/`
  - По умолчанию: `/admin`

### ЮKassa

- **PAYMENT_URL** - URL API ЮKassa для создания платежей
  - Формат: URL
  - Пример: `https://api.yookassa.ru/v3/payments`
  - Обязательная в `production`
  - Опциональная в `development`

- **PAYMENT_REDIRECT_URL_USER** - URL возврата пользователя после оплаты
  - Формат: URL
  - Обязательная в `production`
  - Опциональная в `development`

- **PAYMENT_REDIRECT_URL** - Альтернативный URL возврата (например, для QR/десктопа)
  - Формат: URL
  - Обязательная в `production`
  - Опциональная в `development`

- **PAYMENT_LOGIN** - Идентификатор магазина ЮKassa
  - Минимум 3 символа
  - Обязательная в `production`
  - Опциональная в `development`

- **PAYMENT_PASSWORD** - Секретный ключ ЮKassa
  - Минимум 8 символов
  - Обязательная в `production`
  - Опциональная в `development`

### Telegram Bot

- **TELEGRAM_BOT_TOKEN** - Токен Telegram бота
  - Формат: `число:строка_из_букв_цифр_и_спецсимволов`
  - Пример: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
  - Получить: [@BotFather](https://t.me/BotFather)
  - Обязательная в `production`
  - Опциональная в `development`

### AWS S3

Используется для загрузки и хранения файлов (фото семинаров, лекторов).

- **AWS_ACCESS_KEY_ID** - AWS Access Key ID
  - Получить: AWS Console → IAM → Users → Security credentials
  - Опциональная (если не используется загрузка файлов)

- **AWS_SECRET_ACCESS_KEY** - AWS Secret Access Key
  - Получить: AWS Console → IAM → Users → Security credentials
  - Опциональная

- **AWS_REGION** - AWS регион
  - Примеры: `us-east-1`, `eu-west-1`, `ap-southeast-1`
  - По умолчанию: `us-east-1`

- **AWS_S3_BUCKET** - Название S3 bucket
  - Создать: AWS Console → S3 → Create bucket
  - Опциональная

- **AWS_S3_PUBLIC_URL** - Публичный URL для доступа к файлам
  - Если используется CloudFront или другой CDN
  - Пример: `https://d1234567890.cloudfront.net`
  - Опциональная (если не указана, используется прямой URL S3 или endpoint)

- **AWS_S3_ENDPOINT** - Custom S3-compatible endpoint
  - Для использования альтернативных S3-совместимых хранилищ
  - Примеры:
    - TWC Storage: `https://s3.twcstorage.ru`
    - MinIO: `http://localhost:9000`
    - DigitalOcean Spaces: `https://nyc3.digitaloceanspaces.com`
  - Опциональная (для AWS S3 не указывайте)

### Firebase

Используется для отправки push-уведомлений на мобильные устройства.

- **FIREBASE_PROJECT_ID** - ID проекта Firebase
  - Получить: Firebase Console → Project Settings → General → Project ID
  - Опциональная (если не используются push-уведомления)

- **FIREBASE_PRIVATE_KEY** - Приватный ключ сервисного аккаунта
  - Получить: Firebase Console → Project Settings → Service Accounts → Generate new private key
  - Формат: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
  - Должен быть в кавычках и содержать `\n` для переносов строк
  - Опциональная

- **FIREBASE_CLIENT_EMAIL** - Email сервисного аккаунта
  - Получить: Firebase Console → Project Settings → Service Accounts → Service account ID
  - Формат: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
  - Опциональная

**Подробная инструкция:** См. [docs/FIREBASE_SETUP.md](../docs/FIREBASE_SETUP.md)

### SMS.RU

Используется для отправки SMS сообщений (OTP коды для авторизации).

- **SMS_RU_API_ID** - API ключ для SMS.RU
  - Получить: [SMS.RU личный кабинет](https://sms.ru/?panel=my) → Главная страница
  - Формат: UUID (например: `2F1C8999-2F52-9327-3CBE-AF7888E9923C`)
  - Обязательная (SMS всегда отправляются через SMS.RU)

## Генерация секретов

### Для Unix/Linux/MacOS:

```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET
openssl rand -base64 32

# OTP_PEPPER
openssl rand -base64 16
```

### Для Windows (PowerShell):

```powershell
# JWT_SECRET
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))

# JWT_REFRESH_SECRET
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))

# OTP_PEPPER
[Convert]::ToBase64String((1..16|%{Get-Random -Max 256}))
```

## Настройка AWS S3

### 1. Создайте S3 Bucket

```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 2. Настройте CORS (если загрузка с фронтенда)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Настройте публичный доступ (для публичных файлов)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 4. Создайте IAM пользователя с правами:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Валидация

Все переменные валидируются при запуске приложения с помощью Joi:

- `src/config/env.validation.ts` - схема валидации
- `src/config/config.service.ts` - типобезопасный доступ

При неправильной конфигурации приложение не запустится и покажет ошибку валидации.

## Production чеклист

- [ ] Установлены все обязательные переменные
- [ ] JWT секреты минимум 32 символа
- [ ] OTP_PEPPER минимум 8 символов
- [ ] DATABASE_URL указывает на production БД
- [ ] TELEGRAM_BOT_TOKEN соответствует production боту
- [ ] SMS_RU_API_ID настроен и проверен
- [ ] AWS credentials имеют минимально необходимые права
- [ ] S3 bucket настроен с правильными CORS и permissions
- [ ] Firebase настроен (если используются push-уведомления)
- [ ] FIREBASE_PRIVATE_KEY правильно экранирован с `\n`
- [ ] Переменные окружения не коммитятся в git (.env в .gitignore)

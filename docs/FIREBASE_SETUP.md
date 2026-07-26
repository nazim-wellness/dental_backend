# Настройка Firebase для Push-уведомлений

## 📋 Получение учетных данных Firebase

### Шаг 1: Создание проекта в Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Add project"** или выберите существующий проект
3. Следуйте инструкциям для создания проекта

### Шаг 2: Получение Service Account ключей

1. В Firebase Console выберите ваш проект
2. Нажмите на иконку **шестеренки** (⚙️) рядом с "Project Overview"
3. Выберите **"Project settings"**
4. Перейдите на вкладку **"Service accounts"**
5. Убедитесь, что выбран **"Firebase Admin SDK"**
6. Нажмите кнопку **"Generate new private key"**
7. Подтвердите действие в диалоговом окне
8. Будет скачан JSON файл с учетными данными

### Шаг 3: Извлечение данных из JSON файла

Скачанный JSON файл будет выглядеть примерно так:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Шаг 4: Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Важно:**

- `FIREBASE_PROJECT_ID` - это значение поля `project_id` из JSON файла
- `FIREBASE_PRIVATE_KEY` - это значение поля `private_key` из JSON файла (включая `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`)
- `FIREBASE_CLIENT_EMAIL` - это значение поля `client_email` из JSON файла
- `FIREBASE_PRIVATE_KEY` должен быть в кавычках и содержать `\n` для переносов строк

### Пример правильного формата:

```env
FIREBASE_PROJECT_ID=dental-app-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@dental-app-12345.iam.gserviceaccount.com
```

## 🔒 Безопасность

⚠️ **ВАЖНО:**

- Никогда не коммитьте JSON файл с ключами в Git
- Добавьте `.env` в `.gitignore`
- Храните ключи в безопасном месте
- В продакшене используйте секреты (например, AWS Secrets Manager, Google Secret Manager)

## ✅ Проверка настройки

После настройки переменных окружения:

1. Перезапустите приложение
2. Проверьте логи - не должно быть ошибок инициализации Firebase
3. Попробуйте отправить тестовое push-уведомление через API:

   ```bash
   POST /push-tokens/test
   Authorization: Bearer <your-token>

   {
     "title": "Тест",
     "body": "Проверка работы push-уведомлений"
   }
   ```

## 📱 Настройка Firebase в мобильном приложении

Для работы push-уведомлений также необходимо:

1. **Android:**
   - Добавить `google-services.json` в проект
   - Настроить Firebase Cloud Messaging (FCM) в приложении

2. **iOS:**
   - Добавить `GoogleService-Info.plist` в проект
   - Настроить APNs (Apple Push Notification service)
   - Загрузить APNs сертификат в Firebase Console

## 🔗 Полезные ссылки

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

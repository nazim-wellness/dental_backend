# Правила использования транзакций в Prisma

## Обязательные правила

### 1. Всегда используйте транзакции для операций с базой данных

**Правило**: Все операции с базой данных в репозиториях должны выполняться внутри транзакций Prisma.

**Почему**: Транзакции обеспечивают атомарность операций, консистентность данных и изоляцию между операциями.

### 2. Инкапсуляция в репозиториях

**Правило**: Сервисы должны использовать только репозитории для доступа к базе данных, никогда не обращаться к Prisma напрямую.

**Почему**: Репозитории обеспечивают единую точку доступа к данным и централизованное управление транзакциями.

## Примеры правильного использования

### ✅ Правильно - с транзакцией

```typescript
// В репозитории
async createUser(userData: CreateUserData): Promise<User> {
  return await this.prisma.$transaction(async (tx) => {
    return await tx.user.create({
      data: userData,
    });
  });
}

// В сервисе
async registerUser(userData: CreateUserData): Promise<User> {
  return await this.userRepository.createUser(userData);
}
```

### ❌ Неправильно - без транзакции

```typescript
// В репозитории
async createUser(userData: CreateUserData): Promise<User> {
  return await this.prisma.user.create({
    data: userData,
  });
}

// В сервисе - прямое обращение к Prisma
async registerUser(userData: CreateUserData): Promise<User> {
  return await this.prisma.user.create({
    data: userData,
  });
}
```

## Сложные операции с множественными изменениями

### ✅ Правильно - одна транзакция для связанных операций

```typescript
async createUserWithProfile(userData: CreateUserData, profileData: CreateProfileData): Promise<User> {
  return await this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });

    await tx.profile.create({
      data: {
        ...profileData,
        userId: user.id,
      },
    });

    return user;
  });
}
```

## Обработка ошибок в транзакциях

### ✅ Правильно - транзакция автоматически откатывается при ошибке

```typescript
async updateUserWithLogging(userId: string, userData: UpdateUserData): Promise<User> {
  try {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: userData,
      });

      await tx.auditLog.create({
        data: {
          action: 'USER_UPDATED',
          userId,
          details: userData,
        },
      });

      return user;
    });
  } catch (error) {
    // Транзакция автоматически откатится
    throw new Error(`Failed to update user: ${error.message}`);
  }
}
```

## Операции чтения

### ✅ Правильно - даже операции чтения в транзакциях для консистентности

```typescript
async findUserWithProfile(userId: string): Promise<UserWithProfile | null> {
  return await this.prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const profile = await tx.profile.findUnique({
      where: { userId },
    });

    return {
      ...user,
      profile,
    };
  });
}
```

## Исключения

### Операции чтения без транзакций (только в особых случаях)

Транзакции для операций чтения можно опустить только если:

1. Операция выполняется изолированно
2. Нет риска race conditions
3. Производительность критична

```typescript
// Только для простых операций чтения
async findUserById(id: string): Promise<User | null> {
  return await this.prisma.user.findUnique({
    where: { id },
  });
}
```

## Контрольный список

- [ ] Все операции записи в транзакциях
- [ ] Связанные операции в одной транзакции
- [ ] Сервисы используют только репозитории
- [ ] Правильная обработка ошибок
- [ ] Операции чтения в транзакциях для консистентности
- [ ] Документирование исключений

## Нарушения правил

Если обнаружено нарушение этих правил:

1. Немедленно исправить код
2. Добавить тесты для проверки транзакций
3. Провести code review для предотвращения повторных нарушений

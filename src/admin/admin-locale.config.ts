type ResourceTranslations = {
  readonly labels?: Record<string, string>;
  readonly properties?: Record<string, string>;
  readonly actions?: Record<string, string>;
  readonly messages?: Record<string, string>;
};

type LanguageTranslations = {
  readonly labels: Record<string, string>;
  readonly messages: Record<string, string>;
  readonly buttons: Record<string, string>;
  readonly actions: Record<string, string>;
  readonly properties: Record<string, string>;
  readonly components: Record<string, Record<string, unknown>>;
  readonly resources: Record<string, ResourceTranslations>;
};

type AdminLocale = {
  readonly language: string;
  readonly availableLanguages: readonly string[];
  readonly translations: Record<string, LanguageTranslations>;
};

const RU_TRANSLATIONS: LanguageTranslations = {
  components: {
    Login: {
      welcomeHeader: 'Панель администратора',
      welcomeMessage: 'Войдите для управления данными',
      properties: {
        email: 'Email',
        password: 'Пароль',
      },
      loginButton: 'Войти',
    },
    DropZone: {
      placeholder: 'Перетащите файл сюда или нажмите для выбора',
      acceptedSize: 'Макс. размер: {{maxSize}}',
      acceptedType: 'Форматы: {{mimeTypes}}',
      unsupportedSize: 'Файл {{fileName}} слишком большой',
      unsupportedType:
        'Файл {{fileName}} имеет неподдерживаемый тип: {{fileType}}',
    },
    LanguageSelector: {
      availableLanguages: {
        ru: 'Русский',
      },
    },
  },
  labels: {
    // Навигация и общие
    navigation: 'Навигация',
    dashboard: 'Главная',
    pages: 'Страницы',
    selectedRecords: 'Выбрано записей',
    filters: 'Фильтры',
    adminVersion: 'Версия',
    loggedIn: 'Авторизован как',
    loginWelcome: 'Панель администратора',
    // Модели (названия разделов в меню)
    User: 'Пользователи',
    OtpCode: 'OTP коды',
    PushToken: 'Push токены',
    Specialty: 'Специальности',
    SeminarFormat: 'Форматы семинаров',
    Lecturer: 'Лекторы',
    Seminar: 'Семинары',
    SeminarEventDay: 'Дни семинаров',
    SeminarPhoto: 'Фото семинаров',
    SeminarCart: 'Корзина',
    SeminarBooking: 'Бронирования',
    SeminarPayment: 'Платежи',
    SeminarFavorite: 'Избранное',
    SeminarView: 'Просмотры',
  },
  messages: {
    loginWelcome: 'Войдите в панель управления',
    welcomeOnBoard_title: 'Добро пожаловать в панель управления!',
    welcomeOnBoard_subtitle: 'Управляйте данными через меню слева.',
    invalidCredentials: 'Неверный email или пароль',
    successfullyBulkDeleted: 'Удалено записей: {{count}}',
    successfullyBulkDeleted_plural: 'Удалено записей: {{count}}',
    successfullyDeleted: 'Запись успешно удалена',
    successfullyCreated: 'Запись успешно создана',
    successfullyUpdated: 'Запись успешно обновлена',
    theseRecordsWillBeRemoved: 'Будет удалена следующая запись:',
    theseRecordsWillBeRemoved_plural: 'Будут удалены записи ({{count}})',
    confirmDelete:
      'Вы действительно хотите удалить эту запись? Это действие необратимо.',
    noRecords: 'Записи не найдены',
    noRecordsInResource: 'Пока нет ни одной записи. Создайте первую!',
    error404Resource: 'Раздел не найден',
    error404Action: 'Действие не найдено',
    error404Record: 'Запись с таким ID не найдена',
    seeTheDocumentation: 'См. документацию',
    pickSomeRecords: 'Выберите записи из списка',
  },
  buttons: {
    login: 'Войти',
    logout: 'Выйти',
    seeTheDocumentation: 'Документация',
    save: 'Сохранить',
    addNewItem: 'Создать запись',
    filter: 'Фильтр',
    applyChanges: 'Применить',
    resetFilter: 'Сбросить',
    confirmRemovalMany_1: 'Подтвердить удаление ({{count}} запись)',
    confirmRemovalMany_2: 'Подтвердить удаление ({{count}} записи)',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    createFirstRecord: 'Создать первую запись',
    copyToClipboard: 'Скопировать',
  },
  actions: {
    new: 'Создать',
    edit: 'Редактировать',
    show: 'Просмотр',
    delete: 'Удалить',
    bulkDelete: 'Удалить выбранные',
    list: 'Список',
    search: 'Поиск',
  },
  properties: {
    // Общие свойства (fallback для всех ресурсов)
    id: 'ID',
    createdAt: 'Дата создания',
    updatedAt: 'Дата обновления',
    deletedAt: 'Дата удаления',
    length: 'Количество',
    from: 'От',
    to: 'До',
    email: 'Email',
    password: 'Пароль',
    phone: 'Телефон',
    name: 'Название',
    description: 'Описание',
    isActive: 'Активен',
    status: 'Статус',
    title: 'Название',
  },
  resources: {
    User: {
      properties: {
        id: 'ID',
        phone: 'Телефон',
        isPhoneVerified: 'Телефон подтверждён',
        telegramId: 'Telegram ID',
        telegramUsername: 'Имя в Telegram',
        role: 'Роль',
        firstName: 'Имя',
        lastName: 'Фамилия',
        middleName: 'Отчество',
        companyName: 'Компания',
        referralCode: 'Реферальный код',
        specialtyId: 'Специальность',
        createdAt: 'Дата регистрации',
        updatedAt: 'Дата обновления',
        deletedAt: 'Дата удаления',
        'role.ADMIN': 'Администратор',
        'role.ORGANIZER': 'Организатор',
        'role.DOCTOR': 'Врач',
      },
      actions: {
        new: 'Создать пользователя',
        edit: 'Редактировать пользователя',
        show: 'Просмотр пользователя',
        delete: 'Удалить пользователя',
        list: 'Все пользователи',
      },
    },
    OtpCode: {
      properties: {
        id: 'ID',
        phone: 'Телефон',
        codeHash: 'Хэш кода',
        purpose: 'Назначение',
        expiresAt: 'Действителен до',
        usedAt: 'Использован',
        attempts: 'Попыток',
        createdAt: 'Дата создания',
        'purpose.REGISTER': 'Регистрация',
        'purpose.LOGIN': 'Вход',
      },
      actions: {
        list: 'Все OTP коды',
        show: 'Просмотр OTP кода',
      },
    },
    PushToken: {
      properties: {
        id: 'ID',
        userId: 'Пользователь',
        deviceId: 'ID устройства',
        token: 'Токен',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        deletedAt: 'Дата удаления',
      },
      actions: {
        list: 'Все Push токены',
        show: 'Просмотр Push токена',
      },
    },
    Specialty: {
      properties: {
        id: 'ID',
        name: 'Название',
        description: 'Описание',
        isActive: 'Активна',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
      },
      actions: {
        new: 'Создать специальность',
        edit: 'Редактировать специальность',
        show: 'Просмотр специальности',
        delete: 'Удалить специальность',
        list: 'Все специальности',
      },
    },
    SeminarFormat: {
      properties: {
        id: 'ID',
        name: 'Название',
        description: 'Описание',
        isActive: 'Активен',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
      },
      actions: {
        new: 'Создать формат',
        edit: 'Редактировать формат',
        show: 'Просмотр формата',
        delete: 'Удалить формат',
        list: 'Все форматы',
      },
    },
    Lecturer: {
      properties: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фамилия',
        middleName: 'Отчество',
        position: 'Должность',
        yearsExperience: 'Стаж (лет)',
        achievements: 'Достижения',
        photoUrl: 'Фото (URL)',
        bio: 'Биография',
        isActive: 'Активен',
        userId: 'Связанный пользователь',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        deletedAt: 'Дата удаления',
      },
      actions: {
        new: 'Создать лектора',
        edit: 'Редактировать лектора',
        show: 'Просмотр лектора',
        delete: 'Удалить лектора',
        list: 'Все лекторы',
      },
    },
    Seminar: {
      properties: {
        id: 'ID',
        title: 'Название',
        description: 'Описание',
        topic: 'Тема',
        city: 'Город',
        price: 'Цена (₽)',
        eventDate: 'Дата проведения',
        eventTime: 'Время проведения',
        contactPhone: 'Контактный телефон',
        secondaryPhone: 'Доп. телефон',
        contactEmail: 'Контактный email',
        contactTelegram: 'Контактный Telegram',
        isActive: 'Активен',
        organizerId: 'Организатор',
        lecturerId: 'Лектор',
        formatId: 'Формат',
        specialtyId: 'Специальность',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        deletedAt: 'Дата удаления',
      },
      actions: {
        new: 'Создать семинар',
        edit: 'Редактировать семинар',
        show: 'Просмотр семинара',
        delete: 'Удалить семинар',
        list: 'Все семинары',
      },
    },
    SeminarEventDay: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        date: 'Дата',
        startTime: 'Время начала',
        endTime: 'Время окончания',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
      },
      actions: {
        new: 'Добавить день',
        edit: 'Редактировать день',
        show: 'Просмотр дня',
        delete: 'Удалить день',
        list: 'Все дни семинаров',
      },
    },
    SeminarPhoto: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        url: 'Ссылка на фото',
        order: 'Порядок отображения',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
      },
      actions: {
        new: 'Добавить фото',
        edit: 'Редактировать фото',
        show: 'Просмотр фото',
        delete: 'Удалить фото',
        list: 'Все фото семинаров',
      },
    },
    SeminarBooking: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        userId: 'Пользователь',
        paymentId: 'Платёж',
        status: 'Статус',
        createdAt: 'Дата бронирования',
        updatedAt: 'Дата обновления',
        'status.pending': 'Ожидает',
        'status.confirmed': 'Подтверждено',
        'status.cancelled': 'Отменено',
      },
      actions: {
        show: 'Просмотр бронирования',
        delete: 'Удалить бронирование',
        list: 'Все бронирования',
      },
    },
    SeminarPayment: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        userId: 'Пользователь',
        provider: 'Платёжная система',
        providerPaymentId: 'ID платежа в ЮKassa',
        status: 'Статус',
        amount: 'Сумма',
        currency: 'Валюта',
        confirmationUrl: 'Ссылка на оплату',
        description: 'Описание',
        metadata: 'Метаданные',
        paidAt: 'Дата оплаты',
        cancelledAt: 'Дата отмены',
        createdAt: 'Дата создания',
        updatedAt: 'Дата обновления',
        deletedAt: 'Дата удаления',
        'status.PENDING': 'Ожидает',
        'status.WAITING_FOR_CAPTURE': 'Ожидает подтверждения',
        'status.SUCCEEDED': 'Оплачен',
        'status.CANCELED': 'Отменён',
        'provider.YOOKASSA': 'ЮKassa',
      },
      actions: {
        show: 'Просмотр платежа',
        list: 'Все платежи',
      },
    },
    SeminarCart: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        userId: 'Пользователь',
        createdAt: 'Дата добавления',
        updatedAt: 'Дата обновления',
      },
      actions: {
        show: 'Просмотр элемента корзины',
        delete: 'Удалить из корзины',
        list: 'Вся корзина',
      },
    },
    SeminarFavorite: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        userId: 'Пользователь',
        createdAt: 'Дата добавления',
        updatedAt: 'Дата обновления',
      },
      actions: {
        show: 'Просмотр избранного',
        delete: 'Удалить из избранного',
        list: 'Всё избранное',
      },
    },
    SeminarView: {
      properties: {
        id: 'ID',
        seminarId: 'Семинар',
        userId: 'Пользователь',
        createdAt: 'Дата просмотра',
      },
      actions: {
        show: 'Просмотр записи',
        list: 'Все просмотры',
      },
    },
  },
};

/**
 * Русская локаль для AdminJS v7 — полный перевод интерфейса.
 * Переводы вложены под ключ языка 'ru' согласно формату i18next.
 */
export const ADMIN_LOCALE_RU: AdminLocale = {
  language: 'ru',
  availableLanguages: ['ru'],
  translations: {
    ru: RU_TRANSLATIONS,
  },
};

import type { PrismaClient } from '@prisma/client';

type AdminActionRequest = {
  readonly payload?: Record<string, unknown>;
};

type AdminActionBeforeHook = (
  request: AdminActionRequest,
) => AdminActionRequest | Promise<AdminActionRequest>;

type AdminResourceOptions = {
  readonly navigation?:
    | {
        readonly name: string;
        readonly icon: string;
      }
    | false;
  readonly listProperties?: readonly string[];
  readonly showProperties?: readonly string[];
  readonly filterProperties?: readonly string[];
  readonly editProperties?: readonly string[];
  readonly properties?: Record<
    string,
    {
      readonly isTitle?: boolean;
      readonly isVisible?:
        | boolean
        | {
            readonly list: boolean;
            readonly show: boolean;
            readonly edit: boolean;
            readonly filter: boolean;
          };
      readonly type?: string;
      readonly description?: string;
      readonly components?: {
        readonly list?: string;
        readonly show?: string;
      };
    }
  >;
  readonly actions?: Record<
    string,
    {
      readonly isAccessible?: boolean;
      readonly isVisible?: boolean;
      readonly before?:
        | AdminActionBeforeHook
        | readonly AdminActionBeforeHook[];
    }
  >;
  readonly sort?: {
    readonly sortBy: string;
    readonly direction: 'asc' | 'desc';
  };
};

type AdminResource = {
  readonly resource: {
    readonly model: unknown;
    readonly client: PrismaClient;
  };
  readonly options: AdminResourceOptions;
};

type ResourceDefinition = {
  readonly modelName: string;
  readonly options: AdminResourceOptions;
};

type RelationConnectInput = {
  readonly connect: {
    readonly id: number;
  };
};
type RelationIdMapping = {
  readonly idField: string;
  readonly relationField: string;
};

const NAVIGATION_USERS = { name: 'Пользователи', icon: 'User' } as const;
const NAVIGATION_SEMINARS = { name: 'Семинары', icon: 'Calendar' } as const;
const NAVIGATION_BOOKINGS = {
  name: 'Бронирования и оплаты',
  icon: 'CreditCard',
} as const;
const NAVIGATION_SETTINGS = { name: 'Справочники', icon: 'Settings' } as const;
const DECIMAL_SEPARATOR = ',' as const;
const DECIMAL_DOT = '.' as const;

const parseIdValue = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmedValue: string = value.trim();
  if (trimmedValue.length === 0) {
    return undefined;
  }
  const parsedValue: number = Number.parseInt(trimmedValue, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
};

const createConnectInput = (id: number): RelationConnectInput => {
  return { connect: { id } };
};

const parsePriceValue = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalizedValue: string = value
    .trim()
    .replaceAll(DECIMAL_SEPARATOR, DECIMAL_DOT);
  if (normalizedValue.length === 0) {
    return undefined;
  }
  const parsedValue: number = Number.parseFloat(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const normalizeSeminarPayload = (
  request: AdminActionRequest,
): AdminActionRequest => {
  if (!request.payload) {
    return request;
  }
  const payload: Record<string, unknown> = { ...request.payload };
  const organizerId: number | undefined = parseIdValue(payload.organizerId);
  const lecturerId: number | undefined = parseIdValue(payload.lecturerId);
  const formatId: number | undefined = parseIdValue(payload.formatId);
  const specialtyId: number | undefined = parseIdValue(payload.specialtyId);
  const price: number | undefined = parsePriceValue(payload.price);
  if (organizerId !== undefined) {
    payload.organizer = createConnectInput(organizerId);
  }
  if (lecturerId !== undefined) {
    payload.lecturer = createConnectInput(lecturerId);
  }
  if (formatId !== undefined) {
    payload.format = createConnectInput(formatId);
  }
  if (specialtyId !== undefined) {
    payload.specialty = createConnectInput(specialtyId);
  }
  if (price !== undefined) {
    payload.price = price;
  }
  return { ...request, payload };
};

const normalizeRelationIdsPayload = (
  request: AdminActionRequest,
  mappings: readonly RelationIdMapping[],
): AdminActionRequest => {
  if (!request.payload) {
    return request;
  }
  const payload: Record<string, unknown> = { ...request.payload };
  mappings.forEach((mapping: RelationIdMapping) => {
    const relationId: number | undefined = parseIdValue(
      payload[mapping.idField],
    );
    if (relationId === undefined) {
      return;
    }
    payload[mapping.relationField] = createConnectInput(relationId);
  });
  return { ...request, payload };
};

const normalizeUserPayload = (
  request: AdminActionRequest,
): AdminActionRequest => {
  return normalizeRelationIdsPayload(request, [
    { idField: 'specialtyId', relationField: 'specialty' },
  ]);
};

const normalizeSeminarEventDayPayload = (
  request: AdminActionRequest,
): AdminActionRequest => {
  return normalizeRelationIdsPayload(request, [
    { idField: 'seminarId', relationField: 'seminar' },
  ]);
};

const normalizeSeminarPhotoPayload = (
  request: AdminActionRequest,
): AdminActionRequest => {
  return normalizeRelationIdsPayload(request, [
    { idField: 'seminarId', relationField: 'seminar' },
  ]);
};

const normalizeLecturerPayload = (
  request: AdminActionRequest,
): AdminActionRequest => {
  return normalizeRelationIdsPayload(request, [
    { idField: 'userId', relationField: 'user' },
  ]);
};

const normalizeSeminarBookingPayload = (
  request: AdminActionRequest,
): AdminActionRequest => {
  return normalizeRelationIdsPayload(request, [
    { idField: 'seminarId', relationField: 'seminar' },
    { idField: 'userId', relationField: 'user' },
    { idField: 'paymentId', relationField: 'payment' },
  ]);
};

const RESOURCE_DEFINITIONS: readonly ResourceDefinition[] = [
  {
    modelName: 'User',
    options: {
      navigation: NAVIGATION_USERS,
      listProperties: [
        'id',
        'phone',
        'firstName',
        'lastName',
        'role',
        'createdAt',
      ],
      filterProperties: ['id', 'phone', 'role', 'createdAt'],
      showProperties: [
        'id',
        'phone',
        'isPhoneVerified',
        'telegramId',
        'telegramUsername',
        'role',
        'firstName',
        'lastName',
        'middleName',
        'companyName',
        'specialtyId',
        'createdAt',
        'updatedAt',
      ],
      editProperties: [
        'phone',
        'role',
        'firstName',
        'lastName',
        'middleName',
        'companyName',
        'specialtyId',
      ],
      properties: {
        id: { description: 'Идентификатор' },
        phone: { isTitle: true, description: 'Телефон' },
        role: { description: 'Роль' },
        firstName: { description: 'Имя' },
        lastName: { description: 'Фамилия' },
        middleName: { description: 'Отчество' },
        companyName: { description: 'Компания' },
        createdAt: { description: 'Дата регистрации' },
      },
      actions: {
        new: { before: normalizeUserPayload },
        edit: { before: normalizeUserPayload },
      },
      sort: { sortBy: 'createdAt', direction: 'desc' },
    },
  },
  {
    modelName: 'OtpCode',
    options: {
      navigation: NAVIGATION_USERS,
      listProperties: [
        'id',
        'phone',
        'purpose',
        'expiresAt',
        'attempts',
        'createdAt',
      ],
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
      },
      sort: { sortBy: 'createdAt', direction: 'desc' },
    },
  },
  {
    modelName: 'PushToken',
    options: {
      navigation: NAVIGATION_USERS,
      listProperties: ['id', 'userId', 'deviceId', 'createdAt'],
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
      },
      sort: { sortBy: 'createdAt', direction: 'desc' },
    },
  },
  {
    modelName: 'Seminar',
    options: {
      navigation: NAVIGATION_SEMINARS,
      listProperties: ['id', 'title', 'city', 'price', 'eventDate', 'isActive'],
      filterProperties: [
        'id',
        'title',
        'city',
        'isActive',
        'eventDate',
        'organizerId',
        'lecturerId',
      ],
      showProperties: [
        'id',
        'title',
        'description',
        'topic',
        'city',
        'price',
        'eventDate',
        'eventTime',
        'contactPhone',
        'secondaryPhone',
        'contactEmail',
        'contactTelegram',
        'isActive',
        'organizerId',
        'lecturerId',
        'formatId',
        'specialtyId',
        'createdAt',
        'updatedAt',
      ],
      editProperties: [
        'title',
        'description',
        'topic',
        'city',
        'price',
        'eventDate',
        'eventTime',
        'contactPhone',
        'secondaryPhone',
        'contactEmail',
        'contactTelegram',
        'isActive',
        'organizerId',
        'lecturerId',
        'formatId',
        'specialtyId',
      ],
      properties: {
        title: { isTitle: true, description: 'Название' },
        description: { description: 'Описание' },
        city: { description: 'Город' },
        price: { description: 'Цена (₽)' },
        eventDate: { description: 'Дата проведения' },
        eventTime: { description: 'Время проведения' },
        isActive: { description: 'Активен' },
      },
      actions: {
        new: { before: normalizeSeminarPayload },
        edit: { before: normalizeSeminarPayload },
      },
      sort: { sortBy: 'eventDate', direction: 'desc' },
    },
  },
  {
    modelName: 'SeminarEventDay',
    options: {
      navigation: NAVIGATION_SEMINARS,
      listProperties: ['id', 'seminarId', 'date', 'startTime', 'endTime'],
      actions: {
        new: { before: normalizeSeminarEventDayPayload },
        edit: { before: normalizeSeminarEventDayPayload },
      },
      sort: { sortBy: 'date', direction: 'asc' },
    },
  },
  {
    modelName: 'SeminarPhoto',
    options: {
      navigation: NAVIGATION_SEMINARS,
      listProperties: ['id', 'seminarId', 'url', 'order'],
      properties: {
        url: {
          description: 'Фото',
          components: {
            list: '__PHOTO_PREVIEW__',
            show: '__PHOTO_PREVIEW__',
          },
        },
      },
      actions: {
        new: { before: normalizeSeminarPhotoPayload },
        edit: { before: normalizeSeminarPhotoPayload },
      },
      sort: { sortBy: 'order', direction: 'asc' },
    },
  },
  {
    modelName: 'Lecturer',
    options: {
      navigation: NAVIGATION_SEMINARS,
      listProperties: [
        'id',
        'firstName',
        'lastName',
        'position',
        'yearsExperience',
        'isActive',
      ],
      properties: {
        firstName: { description: 'Имя' },
        lastName: { isTitle: true, description: 'Фамилия' },
        position: { description: 'Должность' },
        yearsExperience: { description: 'Стаж (лет)' },
        isActive: { description: 'Активен' },
        bio: { description: 'Биография', type: 'richtext' },
      },
      actions: {
        new: { before: normalizeLecturerPayload },
        edit: { before: normalizeLecturerPayload },
      },
      sort: { sortBy: 'lastName', direction: 'asc' },
    },
  },
  {
    modelName: 'SeminarBooking',
    options: {
      navigation: NAVIGATION_BOOKINGS,
      listProperties: [
        'id',
        'seminarId',
        'userId',
        'status',
        'paymentId',
        'createdAt',
      ],
      filterProperties: ['id', 'seminarId', 'userId', 'status', 'createdAt'],
      properties: {
        status: { description: 'Статус' },
        createdAt: { description: 'Дата бронирования' },
      },
      actions: {
        new: { isAccessible: false },
        edit: { before: normalizeSeminarBookingPayload },
      },
      sort: { sortBy: 'createdAt', direction: 'desc' },
    },
  },
  {
    modelName: 'SeminarPayment',
    options: {
      navigation: NAVIGATION_BOOKINGS,
      listProperties: [
        'id',
        'seminarId',
        'userId',
        'provider',
        'status',
        'amount',
        'currency',
        'createdAt',
      ],
      filterProperties: [
        'id',
        'seminarId',
        'userId',
        'provider',
        'status',
        'createdAt',
      ],
      showProperties: [
        'id',
        'seminarId',
        'userId',
        'provider',
        'providerPaymentId',
        'status',
        'amount',
        'currency',
        'confirmationUrl',
        'description',
        'paidAt',
        'cancelledAt',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        provider: { description: 'Платежная система' },
        providerPaymentId: { description: 'ID в ЮKassa' },
        status: { description: 'Статус' },
        amount: { description: 'Сумма' },
        currency: { description: 'Валюта' },
        paidAt: { description: 'Дата оплаты' },
        cancelledAt: { description: 'Дата отмены' },
      },
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
      },
      sort: { sortBy: 'createdAt', direction: 'desc' },
    },
  },
  {
    modelName: 'SeminarCart',
    options: {
      navigation: false,
    },
  },
  {
    modelName: 'SeminarFavorite',
    options: {
      navigation: false,
    },
  },
  {
    modelName: 'SeminarView',
    options: {
      navigation: false,
    },
  },
  {
    modelName: 'Specialty',
    options: {
      navigation: NAVIGATION_SETTINGS,
      listProperties: ['id', 'name', 'isActive', 'createdAt'],
      properties: {
        name: { isTitle: true, description: 'Название' },
        isActive: { description: 'Активна' },
      },
      sort: { sortBy: 'name', direction: 'asc' },
    },
  },
  {
    modelName: 'SeminarFormat',
    options: {
      navigation: NAVIGATION_SETTINGS,
      listProperties: ['id', 'name', 'isActive', 'createdAt'],
      properties: {
        name: { isTitle: true, description: 'Название' },
        isActive: { description: 'Активен' },
      },
      sort: { sortBy: 'name', direction: 'asc' },
    },
  },
];

const PHOTO_PREVIEW_PLACEHOLDER = '__PHOTO_PREVIEW__';

type PropertyWithComponents = {
  readonly isTitle?: boolean;
  readonly type?: string;
  readonly description?: string;
  readonly components?: {
    readonly list?: string;
    readonly show?: string;
  };
};

/**
 * Заменить плейсхолдеры компонентов на реальные имена.
 */
const resolveComponents = (
  options: AdminResourceOptions,
  photoPreviewComponent: string,
): AdminResourceOptions => {
  if (!options.properties) {
    return options;
  }
  const resolvedProperties: Record<string, PropertyWithComponents> = {};
  for (const key of Object.keys(options.properties)) {
    const prop: PropertyWithComponents = options.properties[key];
    if (prop?.components) {
      const list =
        prop.components.list === PHOTO_PREVIEW_PLACEHOLDER
          ? photoPreviewComponent
          : prop.components.list;
      const show =
        prop.components.show === PHOTO_PREVIEW_PLACEHOLDER
          ? photoPreviewComponent
          : prop.components.show;
      resolvedProperties[key] = { ...prop, components: { list, show } };
    } else {
      resolvedProperties[key] = prop;
    }
  }
  return { ...options, properties: resolvedProperties };
};

/**
 * Собрать ресурсы AdminJS из конфигурации и доступных моделей Prisma.
 */
export const buildAdminResources = (
  getModelByName: (name: string) => unknown,
  prismaClient: PrismaClient,
  availableModelNames: Set<string>,
  photoPreviewComponent: string,
): AdminResource[] => {
  return RESOURCE_DEFINITIONS.filter((def: ResourceDefinition) =>
    availableModelNames.has(def.modelName),
  ).map((def: ResourceDefinition) => ({
    resource: {
      model: getModelByName(def.modelName),
      client: prismaClient,
    },
    options: resolveComponents(def.options, photoPreviewComponent),
  }));
};

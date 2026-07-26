import { Injectable } from '@nestjs/common';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UniqueConstraintException } from '../common/exceptions';

export type UpsertUserByPhoneResult = {
  readonly id: number;
  readonly role: UserRole;
  readonly isNewUser: boolean;
};

export type CreateUserByEmailParams = {
  readonly email: string;
  readonly passwordHash: string;
  readonly phone: string;
  readonly role: UserRole;
};

export type CreateUserByEmailResult = {
  readonly id: number;
  readonly role: UserRole;
};

export type UserAuthRecord = {
  readonly id: number;
  readonly role: UserRole;
  readonly password: string | null;
};

export type UpsertUserByTelegramParams = {
  readonly telegramId: string;
  readonly telegramUsername?: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly role: UserRole;
};

export type UpsertUserByTelegramResult = {
  readonly id: number;
  readonly role: UserRole;
  readonly isNewUser: boolean;
};

export type UpdateProfileParams = {
  readonly userId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName?: string;
  readonly companyName?: string;
  readonly referralCode?: string;
  readonly phone?: string;
  /**
   * Для врача: полная замена набора специальностей (sorted по id на сервисе).
   * undefined — не менять связи и specialty_id.
   */
  readonly doctorSpecialtyIds?: readonly number[];
};

export type ProfileRecord = {
  readonly id: number;
  readonly phone?: string;
  readonly role: UserRole;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly middleName?: string;
  readonly companyName?: string;
  readonly referralCode?: string;
  /** Все специальности врача (по возрастанию id), для GET /profile. */
  readonly specialties: ReadonlyArray<{
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
  }>;
  /** Основная / первая по возрастанию id (совпадает с specialtyId). */
  readonly specialty: {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
  } | null;
  readonly isLecturer: boolean;
  readonly lecturer: {
    readonly id: number;
    readonly position: string;
    readonly yearsExperience: number;
    readonly achievements: string[];
    readonly photoUrl: string | null;
    readonly bio: string | null;
  } | null;
};

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;

type SpecialtyRow = {
  id: number;
  name: string;
  description: string | null;
};

type UserRecord = {
  id: number;
  phone: string | null;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  companyName: string | null;
  referralCode: string | null;
  specialty: SpecialtyRow | null;
  specialtyLinks: ReadonlyArray<{ readonly specialty: SpecialtyRow }>;
};

function buildOrderedSpecialties(
  primary: SpecialtyRow | null,
  links: ReadonlyArray<{ readonly specialty: SpecialtyRow }>,
): SpecialtyRow[] {
  const byId = new Map<number, SpecialtyRow>();
  for (const link of links) {
    byId.set(link.specialty.id, link.specialty);
  }
  if (primary !== null && !byId.has(primary.id)) {
    byId.set(primary.id, primary);
  }
  return [...byId.values()].sort(
    (a: SpecialtyRow, b: SpecialtyRow) => a.id - b.id,
  );
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByPhoneAndVerify(params: {
    phone: string;
    role: UserRole;
  }): Promise<UpsertUserByPhoneResult> {
    const { phone, role } = params;

    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const existingUser = await tx.user.findUnique({
        where: { phone },
        select: { id: true, firstName: true, lastName: true },
      });

      const isNewUser = !existingUser;

      const user = await tx.user.upsert({
        where: { phone },
        update: { isPhoneVerified: true, role },
        create: { phone, isPhoneVerified: true, role },
        select: { id: true, role: true, firstName: true, lastName: true },
      });

      // Если это новый организатор, создаем для него лектора
      if (isNewUser && role === UserRole.ORGANIZER) {
        await tx.lecturer.create({
          data: {
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            middleName: null,
            position: 'Организатор',
            yearsExperience: 0,
            achievements: [],
            userId: user.id,
          },
        });
      }

      return {
        id: user.id,
        role: user.role,
        isNewUser,
      };
    });
  }

  async createByEmail(
    params: CreateUserByEmailParams,
  ): Promise<CreateUserByEmailResult> {
    const { email, passwordHash, phone, role } = params;

    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const existingEmail = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingEmail) {
        throw new UniqueConstraintException('email', email);
      }

      const existingPhone = await tx.user.findUnique({
        where: { phone },
        select: { id: true },
      });
      if (existingPhone) {
        throw new UniqueConstraintException('phone', phone);
      }

      const user = await tx.user.create({
        data: { email, password: passwordHash, phone, role },
        select: { id: true, role: true },
      });

      if (role === UserRole.ORGANIZER) {
        await tx.lecturer.create({
          data: {
            firstName: '',
            lastName: '',
            middleName: null,
            position: 'Организатор',
            yearsExperience: 0,
            achievements: [],
            userId: user.id,
          },
        });
      }

      return { id: user.id, role: user.role };
    });
  }

  async findByEmail(email: string): Promise<UserAuthRecord | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, password: true },
    });
  }

  async upsertByTelegram(
    params: UpsertUserByTelegramParams,
  ): Promise<UpsertUserByTelegramResult> {
    const { telegramId, telegramUsername, firstName, lastName, role } = params;

    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const existingUser = await tx.user.findUnique({
        where: { telegramId },
        select: { id: true },
      });

      const isNewUser = !existingUser;

      const user = await tx.user.upsert({
        where: { telegramId },
        update: {
          telegramUsername,
          firstName,
          lastName,
          role,
        },
        create: {
          telegramId,
          telegramUsername,
          firstName,
          lastName,
          role,
        },
        select: { id: true, role: true },
      });

      // Если это новый организатор, создаем для него лектора
      if (isNewUser && role === UserRole.ORGANIZER && firstName && lastName) {
        await tx.lecturer.create({
          data: {
            firstName,
            lastName,
            middleName: null,
            position: 'Организатор',
            yearsExperience: 0,
            achievements: [],
            userId: user.id,
          },
        });
      }

      return {
        id: user.id,
        role: user.role,
        isNewUser,
      };
    });
  }

  async updateProfile(params: UpdateProfileParams): Promise<void> {
    const {
      userId,
      firstName,
      lastName,
      middleName,
      companyName,
      referralCode,
      phone,
      doctorSpecialtyIds,
    } = params;

    await this.prisma.$transaction(async (tx: TransactionClient) => {
      if (phone) {
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { telegramId: true, phone: true },
        });

        if (currentUser?.phone !== phone) {
          const existingUser = await tx.user.findUnique({
            where: { phone },
            select: { id: true, telegramId: true },
          });

          if (existingUser) {
            if (
              !currentUser?.telegramId ||
              !existingUser.telegramId ||
              currentUser.telegramId !== existingUser.telegramId
            ) {
              throw new UniqueConstraintException('phone', phone);
            }
          }
        }
      }

      let primarySpecialtyId: number | null | undefined;
      if (doctorSpecialtyIds !== undefined) {
        const sortedIds: readonly number[] = [
          ...new Set(doctorSpecialtyIds),
        ].sort((a: number, b: number) => a - b);
        await tx.userSpecialty.deleteMany({ where: { userId } });
        if (sortedIds.length > 0) {
          await tx.userSpecialty.createMany({
            data: sortedIds.map((specialtyId: number) => ({
              userId,
              specialtyId,
            })),
          });
          primarySpecialtyId = sortedIds[0];
        } else {
          primarySpecialtyId = null;
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          middleName,
          companyName,
          referralCode,
          phone,
          ...(primarySpecialtyId !== undefined && {
            specialtyId: primarySpecialtyId,
          }),
        },
      });
    });
  }

  async findProfileById(userId: number): Promise<ProfileRecord | null> {
    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const rec = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phone: true,
          role: true,
          firstName: true,
          lastName: true,
          middleName: true,
          companyName: true,
          referralCode: true,
          specialty: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          specialtyLinks: {
            select: {
              specialty: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      if (!rec) return null;

      const lecturer = await tx.lecturer.findUnique({
        where: { userId },
        select: {
          id: true,
          position: true,
          yearsExperience: true,
          achievements: true,
          photoUrl: true,
          bio: true,
        },
      });

      const userRec = rec as UserRecord;
      const specialtiesOrdered: SpecialtyRow[] = buildOrderedSpecialties(
        userRec.specialty,
        userRec.specialtyLinks,
      );
      const primarySpecialty: SpecialtyRow | null =
        specialtiesOrdered.length > 0 ? specialtiesOrdered[0] : null;
      return {
        id: userRec.id,
        phone: userRec.phone ?? undefined,
        role: userRec.role,
        firstName: userRec.firstName ?? undefined,
        lastName: userRec.lastName ?? undefined,
        middleName: userRec.middleName ?? undefined,
        companyName: userRec.companyName ?? undefined,
        referralCode: userRec.referralCode ?? undefined,
        specialties: specialtiesOrdered,
        specialty: primarySpecialty
          ? {
              id: primarySpecialty.id,
              name: primarySpecialty.name,
              description: primarySpecialty.description,
            }
          : null,
        isLecturer: lecturer !== null,
        lecturer: lecturer
          ? {
              id: lecturer.id,
              position: lecturer.position,
              yearsExperience: lecturer.yearsExperience,
              achievements: lecturer.achievements as string[],
              photoUrl: lecturer.photoUrl,
              bio: lecturer.bio,
            }
          : null,
      };
    });
  }

  /**
   * Получить контактные данные пользователя для чека (телефон).
   */
  async findContactById(
    userId: number,
  ): Promise<{ phone: string | null } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });
    return user;
  }

  /**
   * Получить всех активных организаторов
   */
  async findAllOrganizers(): Promise<
    Array<{
      readonly id: number;
      readonly firstName: string | null;
      readonly lastName: string | null;
      readonly middleName: string | null;
      readonly phone: string | null;
    }>
  > {
    return await this.prisma.user.findMany({
      where: {
        role: UserRole.ORGANIZER,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }
}

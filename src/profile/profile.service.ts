import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { SpecialtyRepository } from '../repositories/specialty.repository';
import { UserRepository } from '../repositories/user.repository';
import { LecturerRepository } from '../repositories/lecturer.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SpecialtyDto } from './dto/specialty.dto';
import { ProfileDto } from './dto/profile.dto';

function resolveDoctorSpecialtyIds(
  updateData: UpdateProfileDto,
): readonly number[] {
  if (
    updateData.specialtyIds !== undefined &&
    updateData.specialtyIds.length > 0
  ) {
    return [...new Set(updateData.specialtyIds)].sort(
      (a: number, b: number) => a - b,
    );
  }
  if (updateData.specialtyId !== undefined && updateData.specialtyId !== null) {
    return [updateData.specialtyId];
  }
  return [];
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly specialtyRepo: SpecialtyRepository,
    private readonly userRepo: UserRepository,
    private readonly lecturerRepo: LecturerRepository,
  ) {}

  async getSpecialties(): Promise<SpecialtyDto[]> {
    return this.specialtyRepo.findAllActive();
  }

  async getProfile(userId: number): Promise<ProfileDto | null> {
    const record = await this.userRepo.findProfileById(userId);
    if (!record) return null;
    const specialtiesPayload =
      record.role === UserRole.DOCTOR
        ? record.specialties.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description ?? undefined,
          }))
        : undefined;
    const specialtyIdsPayload =
      record.role === UserRole.DOCTOR
        ? record.specialties.map((s) => s.id)
        : undefined;
    const specialtyIdPayload =
      record.role === UserRole.DOCTOR && record.specialties.length > 0
        ? record.specialties[0].id
        : undefined;
    return {
      id: record.id,
      phone: record.phone ?? undefined,
      role: record.role,
      firstName: record.firstName ?? undefined,
      lastName: record.lastName ?? undefined,
      middleName: record.middleName ?? undefined,
      companyName: record.companyName ?? undefined,
      referralCode: record.referralCode ?? undefined,
      specialties: specialtiesPayload,
      specialtyIds: specialtyIdsPayload,
      specialtyId: specialtyIdPayload,
      specialty: record.specialty
        ? {
            id: record.specialty.id,
            name: record.specialty.name,
            description: record.specialty.description ?? undefined,
          }
        : null,
      isLecturer: record.isLecturer,
      lecturer: record.lecturer
        ? {
            id: record.lecturer.id,
            position: record.lecturer.position,
            yearsExperience: record.lecturer.yearsExperience,
            achievements: record.lecturer.achievements,
            photoUrl: record.lecturer.photoUrl ?? undefined,
            bio: record.lecturer.bio ?? undefined,
          }
        : null,
    };
  }

  async updateProfile(
    userId: number,
    userRole: UserRole,
    updateData: UpdateProfileDto,
  ): Promise<void> {
    const {
      firstName,
      lastName,
      middleName,
      companyName,
      referralCode,
      phone,
      lecturerPosition,
      lecturerYearsExperience,
      lecturerAchievements,
      lecturerPhotoUrl,
      lecturerBio,
    } = updateData;

    let doctorSpecialtyIds: readonly number[] | undefined;
    if (userRole === UserRole.DOCTOR) {
      const resolvedIds: readonly number[] =
        resolveDoctorSpecialtyIds(updateData);
      if (resolvedIds.length === 0) {
        throw new BadRequestException(
          'Укажите specialtyIds или specialtyId (специальности обязательны для врачей)',
        );
      }
      const foundCount: number =
        await this.specialtyRepo.countActiveByIds(resolvedIds);
      if (foundCount !== resolvedIds.length) {
        throw new BadRequestException(
          'Одна или несколько специальностей не найдены или неактивны',
        );
      }
      doctorSpecialtyIds = resolvedIds;
    }

    await this.userRepo.updateProfile({
      userId,
      firstName,
      lastName,
      middleName,
      companyName,
      referralCode,
      phone,
      doctorSpecialtyIds,
    });

    // Если пользователь является лектором, обновляем данные лектора
    const lecturer = await this.lecturerRepo.findByUserId(userId);
    if (lecturer) {
      const updateParams: {
        firstName?: string;
        lastName?: string;
        middleName?: string;
        position?: string;
        yearsExperience?: number;
        achievements?: string[];
        photoUrl?: string;
        bio?: string;
      } = {};

      // Обновляем имя, фамилию и отчество из профиля пользователя
      if (firstName) updateParams.firstName = firstName;
      if (lastName) updateParams.lastName = lastName;
      if (middleName !== undefined) updateParams.middleName = middleName;

      // Обновляем поля лектора, если они переданы
      if (lecturerPosition !== undefined)
        updateParams.position = lecturerPosition;
      if (lecturerYearsExperience !== undefined)
        updateParams.yearsExperience = lecturerYearsExperience;
      if (lecturerAchievements !== undefined)
        updateParams.achievements = lecturerAchievements;
      if (lecturerPhotoUrl !== undefined)
        updateParams.photoUrl = lecturerPhotoUrl;
      if (lecturerBio !== undefined) updateParams.bio = lecturerBio;

      // Обновляем только если есть что обновлять
      if (Object.keys(updateParams).length > 0) {
        await this.lecturerRepo.update(lecturer.id, updateParams);
      }
    }
  }
}

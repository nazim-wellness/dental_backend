import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { ProfileService } from './profile.service';
import { UpdateProfileBody } from './dto/update-profile.dto';
import { SpecialtyResponse } from './dto/specialty.dto';
import { ProfileResponse } from './dto/profile.dto';

@ApiTags('Профиль пользователя')
@Controller('profile')
@ApiBearerAuth('Auth')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Текущий профиль',
    type: ProfileResponse,
  })
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfileResponse | null> {
    return this.profileService.getProfile(user.userId);
  }

  @Get('specialties')
  @ApiOperation({ summary: 'Получить список специальностей' })
  @ApiResponse({
    status: 200,
    description: 'Список активных специальностей',
    type: [SpecialtyResponse],
  })
  async getSpecialties(): Promise<SpecialtyResponse[]> {
    return this.profileService.getSpecialties();
  }

  @Put()
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно обновлен',
  })
  @ApiResponse({
    status: 400,
    description:
      'Некорректные данные или отсутствует обязательная специальность для врача',
  })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateProfileBody,
  ): Promise<void> {
    return this.profileService.updateProfile(
      user.userId,
      user.role as UserRole,
      body,
    );
  }
}

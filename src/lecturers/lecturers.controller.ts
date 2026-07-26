import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { LecturersService } from './lecturers.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { LecturerDto } from './dto/lecturer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Лекторы')
@ApiBearerAuth('Auth')
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать лектора' })
  @ApiResponse({
    status: 201,
    description: 'Лектор успешно создан',
    type: LecturerDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async create(@Body() createDto: CreateLecturerDto): Promise<LecturerDto> {
    return this.lecturersService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить список лекторов' })
  @ApiResponse({ status: 200, type: [LecturerDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(): Promise<LecturerDto[]> {
    return this.lecturersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить лектора по ID' })
  @ApiResponse({ status: 200, type: LecturerDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Лектор не найден' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LecturerDto> {
    const lecturer = await this.lecturersService.findOne(id);
    if (!lecturer) {
      throw new NotFoundException('Лектор не найден');
    }
    return lecturer;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновить лектора' })
  @ApiResponse({ status: 200, type: LecturerDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Лектор не найден' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLecturerDto,
  ): Promise<LecturerDto> {
    return this.lecturersService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удалить лектора (soft delete)' })
  @ApiResponse({ status: 200, description: 'Лектор успешно удалён' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Только ADMIN' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.lecturersService.remove(id);
  }
}

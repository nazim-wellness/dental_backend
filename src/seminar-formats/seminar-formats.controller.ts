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
import { SeminarFormatsService } from './seminar-formats.service';
import { CreateSeminarFormatDto } from './dto/create-seminar-format.dto';
import { UpdateSeminarFormatDto } from './dto/update-seminar-format.dto';
import { SeminarFormatDto } from './dto/seminar-format.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Форматы семинаров')
@Controller('seminar-formats')
export class SeminarFormatsController {
  constructor(private readonly seminarFormatsService: SeminarFormatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Создать формат семинара' })
  @ApiResponse({ status: 201, type: SeminarFormatDto })
  async create(
    @Body() createDto: CreateSeminarFormatDto,
  ): Promise<SeminarFormatDto> {
    return this.seminarFormatsService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Получить список форматов' })
  @ApiResponse({ status: 200, type: [SeminarFormatDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(): Promise<SeminarFormatDto[]> {
    return this.seminarFormatsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Получить формат по ID' })
  @ApiResponse({ status: 200, type: SeminarFormatDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Формат не найден' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SeminarFormatDto> {
    const format = await this.seminarFormatsService.findOne(id);
    if (!format) {
      throw new NotFoundException('Формат семинара не найден');
    }
    return format;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Обновить формат' })
  @ApiResponse({ status: 200, type: SeminarFormatDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSeminarFormatDto,
  ): Promise<SeminarFormatDto> {
    return this.seminarFormatsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Удалить формат' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.seminarFormatsService.remove(id);
  }
}

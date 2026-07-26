import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SeminarsService } from './seminars.service';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { SeminarDto } from './dto/seminar.dto';
import { SendPromoPushDto } from './dto/send-promo-push.dto';
import { MySeminarDto } from './dto/my-seminar.dto';
import { SeminarsStatsDto } from './dto/seminars-stats.dto';
import { OrganizerSeminarsStatsDto } from './dto/seminar-stats.dto';
import { OrganizerDto } from './dto/organizer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SeminarOwnerGuard } from './guards/seminar-owner.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UpcomingSeminarsQueryDto } from './dto/upcoming-seminars-query.dto';

@ApiTags('Семинары')
@ApiBearerAuth('Auth')
@Controller('seminars')
export class SeminarsController {
  constructor(private readonly seminarsService: SeminarsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({
    summary: 'Создать семинар',
    description: 'Создать новый семинар. Доступно только для роли ORGANIZER.',
  })
  @ApiResponse({
    status: 201,
    description: 'Семинар успешно создан',
    type: SeminarDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав (требуется роль ORGANIZER)',
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные (лектор или формат не найдены)',
  })
  async create(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Body() createDto: CreateSeminarDto,
  ): Promise<SeminarDto> {
    return this.seminarsService.create(createDto, user.userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({
    summary: 'Получить свои семинары с пагинацией и статистикой',
    description:
      'Получить упрощенный список семинаров, созданных текущим организатором. ' +
      'Возвращает основную информацию без полных данных организатора и контактов, ' +
      'а также статистику: количество уникальных просмотров и бронирований для каждого семинара. ' +
      'Поддерживает пагинацию (по умолчанию: страница 1, лимит 10). ' +
      'Доступно только для роли ORGANIZER.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Пагинированный список семинаров текущего организатора с метаданными',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/MySeminarDto' },
        },
        meta: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            itemsPerPage: { type: 'number', example: 10 },
            totalItems: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли ORGANIZER',
  })
  async findMySeminars(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<MySeminarDto>> {
    return this.seminarsService.findByOrganizerPaginated(user.userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Получить статистику семинаров',
    description:
      'Получить статистику по неистекшим семинарам для текущего пользователя: ' +
      'количество доступных для бронирования, количество забронированных и общее количество. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика семинаров',
    type: SeminarsStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  async getStats(
    @CurrentUser() user: { userId: number; role: UserRole },
  ): Promise<SeminarsStatsDto> {
    return this.seminarsService.getStats(user.userId);
  }

  @Get('organizer/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({
    summary: 'Получить статистику по семинарам организатора',
    description:
      'Получить статистику по всем семинарам текущего организатора: ' +
      'количество уникальных просмотров и бронирований для каждого семинара, ' +
      'а также общую статистику по всем семинарам. ' +
      'Доступно только для роли ORGANIZER.',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика семинаров организатора',
    type: OrganizerSeminarsStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли ORGANIZER',
  })
  async getOrganizerStats(
    @CurrentUser() user: { userId: number; role: UserRole },
  ): Promise<OrganizerSeminarsStatsDto> {
    return this.seminarsService.getOrganizerStats(user.userId);
  }

  @Get('organizers')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить список всех организаторов',
    description:
      'Получить список всех активных организаторов без пагинации. ' +
      'Список отсортирован по фамилии и имени.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список организаторов',
    type: [OrganizerDto],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAllOrganizers(): Promise<OrganizerDto[]> {
    return this.seminarsService.findAllOrganizers();
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Получить неистекшие семинары с пагинацией и фильтрами',
    description:
      'Получить список всех активных семинаров, которые еще не истекли (eventDate >= сегодня), ' +
      'с информацией об организаторе, лекторе и формате. ' +
      'Поддерживает пагинацию (по умолчанию: страница 1, лимит 10) и множество фильтров: ' +
      'поиск по названию, лектору и организатору; фильтр по забронированным семинарам; ' +
      'фильтр по городу; фильтр по диапазону дат; фильтр по диапазону цен; ' +
      'фильтр по лектору; фильтр по организатору; фильтр по специальностям. ' +
      'Все параметры опциональны. Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Пагинированный список неистекших семинаров с метаданными',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/SeminarDto' },
        },
        meta: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            itemsPerPage: { type: 'number', example: 10 },
            totalItems: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  async findUpcoming(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Query() query: UpcomingSeminarsQueryDto,
  ): Promise<PaginatedResponseDto<SeminarDto>> {
    return this.seminarsService.findUpcomingPaginated(
      {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
      {
        // Передаем только непустые значения
        search: query.search?.trim() || undefined,
        userId: user.userId,
        booked: query.booked,
        city: query.city?.trim() || undefined,
        dateFrom: query.dateFrom?.trim() || undefined,
        dateTo: query.dateTo?.trim() || undefined,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        lecturerId: query.lecturerId,
        organizerId: query.organizerId,
        specialties: query.specialties?.trim() || undefined,
      },
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить список семинаров',
    description:
      'Получить список всех активных семинаров с информацией об организаторе, лекторе и формате.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список семинаров',
    type: [SeminarDto],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(): Promise<SeminarDto[]> {
    return this.seminarsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить семинар по ID',
    description:
      'Получить детальную информацию о семинаре включая организатора, лектора и формат. ' +
      'Для пользователей с ролью DOCTOR автоматически записывается просмотр семинара.',
  })
  @ApiResponse({ status: 200, type: SeminarDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number; role: UserRole } | null,
  ): Promise<SeminarDto> {
    const seminar = await this.seminarsService.findOne(
      id,
      user?.userId,
      user?.role,
    );
    if (!seminar) {
      throw new NotFoundException('Семинар не найден');
    }
    return seminar;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SeminarOwnerGuard)
  @ApiOperation({
    summary: 'Обновить семинар',
    description:
      'Обновить семинар. Доступно только создателю семинара (проверка через organizerId).',
  })
  @ApiResponse({ status: 200, type: SeminarDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Только создатель семинара может его обновить',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные (лектор или формат не найдены)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSeminarDto,
  ): Promise<SeminarDto> {
    return this.seminarsService.update(id, updateDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SeminarOwnerGuard)
  @ApiOperation({
    summary: 'Частично обновить семинар',
    description:
      'Частично обновить семинар. Доступно только создателю семинара (проверка через organizerId).',
  })
  @ApiResponse({ status: 200, type: SeminarDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Только создатель семинара может его обновить',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные (лектор или формат не найдены)',
  })
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSeminarDto,
  ): Promise<SeminarDto> {
    return this.seminarsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SeminarOwnerGuard)
  @ApiOperation({
    summary: 'Удалить семинар',
    description:
      'Удалить семинар (soft delete). Доступно только создателю семинара.',
  })
  @ApiResponse({ status: 200, description: 'Семинар успешно удалён' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Только создатель семинара может его удалить',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.seminarsService.remove(id);
  }

  @Post('promo-push')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiOperation({
    summary: 'Отправить рекламное push-уведомление о семинаре',
    description:
      'Отправить рекламное push-уведомление о предстоящем семинаре. ' +
      'Уведомления отправляются только докторам, которые: ' +
      '- Имеют специальность, совпадающую со специальностью семинара ' +
      '- Бронировали семинары в том же городе. ' +
      'Доступно только для роли ORGANIZER.',
  })
  @ApiResponse({
    status: 200,
    description: 'Рекламные уведомления отправлены',
    schema: {
      properties: {
        sent: { type: 'number', example: 15 },
        failed: { type: 'number', example: 2 },
        totalTargets: { type: 'number', example: 20 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли ORGANIZER',
  })
  @ApiResponse({
    status: 400,
    description:
      'Семинар не найден, не принадлежит организатору, уже прошел, ' +
      'не имеет специальности или Firebase не настроен',
  })
  async sendPromoPush(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Body() dto: SendPromoPushDto,
  ): Promise<{ sent: number; failed: number; totalTargets: number }> {
    return this.seminarsService.sendPromoPush(dto.seminarId, user.userId);
  }
}

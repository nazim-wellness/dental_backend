import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingDto } from './dto/booking.dto';
import { CreateBookingPaymentDto } from './dto/create-booking-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Бронирования семинаров')
@ApiBearerAuth('Auth')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Забронировать семинар',
    description:
      'Создать платеж для бронирования семинара. ' +
      'Бронирование будет создано после успешной оплаты по уведомлению ЮKassa. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Платеж для бронирования успешно создан',
    type: CreateBookingPaymentDto,
  })
  @ApiResponse({
    status: 402,
    description:
      'Платеж не прошел (отклонен банком или отменен). Проверьте данные карты.',
  })
  @ApiResponse({
    status: 502,
    description: 'Ошибка платежного сервиса',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  @ApiResponse({
    status: 409,
    description: 'Семинар уже забронирован',
  })
  async createBooking(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Body() dto: CreateBookingDto,
  ): Promise<CreateBookingPaymentDto> {
    return await this.bookingsService.createBooking(
      dto.seminarId,
      user.userId,
      dto.paymentToken,
      dto.paymentMethodType,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Получить бронирования с пагинацией',
    description:
      'Получить список всех бронирований текущего пользователя с пагинацией. ' +
      'Поддерживает пагинацию (по умолчанию: страница 1, лимит 10). ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Пагинированный список бронирований',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BookingDto' },
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
  async getBookings(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookingDto>> {
    return this.bookingsService.getBookingsPaginated(user.userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Delete(':seminarId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Отменить бронирование',
    description:
      'Отменить бронирование семинара текущего пользователя. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 204,
    description: 'Бронирование успешно отменено',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено' })
  async cancelBooking(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Param('seminarId', ParseIntPipe) seminarId: number,
  ): Promise<void> {
    await this.bookingsService.cancelBooking(seminarId, user.userId);
  }
}

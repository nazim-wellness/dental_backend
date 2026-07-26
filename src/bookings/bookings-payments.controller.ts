import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { YookassaNotificationDto } from './dto/yookassa-notification.dto';

@ApiTags('Платежи')
@Controller('payments')
export class BookingsPaymentsController {
  private readonly logger = new Logger(BookingsPaymentsController.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @Post('yookassa/notification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Уведомление от ЮKassa',
    description:
      'Получить уведомление о платеже от ЮKassa и создать бронирование при успехе.',
  })
  @ApiResponse({ status: 200, description: 'Уведомление обработано' })
  async handleYookassaNotification(
    @Req() req: Request,
    @Body() dto: YookassaNotificationDto,
  ): Promise<void> {
    this.logger.log(
      `ЮKassa webhook: полное тело запроса: ${JSON.stringify(req.body, null, 2)}`,
    );
    await this.bookingsService.handleYookassaNotification(dto);
  }
}

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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItemDto } from './dto/cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Корзина семинаров')
@ApiBearerAuth('Auth')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({
    summary: 'Добавить семинар в корзину',
    description:
      'Добавить семинар в корзину текущего пользователя. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Семинар успешно добавлен в корзину',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  @ApiResponse({
    status: 409,
    description: 'Семинар уже добавлен в корзину',
  })
  async addToCart(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Body() dto: AddToCartDto,
  ): Promise<void> {
    await this.cartService.addToCart(dto.seminarId, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить корзину с пагинацией',
    description:
      'Получить список всех семинаров в корзине текущего пользователя с пагинацией. ' +
      'Поддерживает пагинацию (по умолчанию: страница 1, лимит 10). ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Пагинированный список семинаров в корзине',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CartItemDto' },
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
  async getCart(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<CartItemDto>> {
    return this.cartService.getCartPaginated(user.userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Delete(':seminarId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить семинар из корзины',
    description:
      'Удалить семинар из корзины текущего пользователя. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 204,
    description: 'Семинар успешно удалён из корзины',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден в корзине' })
  async removeFromCart(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Param('seminarId', ParseIntPipe) seminarId: number,
  ): Promise<void> {
    await this.cartService.removeFromCart(seminarId, user.userId);
  }
}

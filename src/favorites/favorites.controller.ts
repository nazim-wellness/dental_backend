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
import { FavoritesService } from './favorites.service';
import { AddToFavoritesDto } from './dto/add-to-favorites.dto';
import { FavoriteItemDto } from './dto/favorite-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Избранные семинары')
@ApiBearerAuth('Auth')
@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({
    summary: 'Добавить семинар в избранное',
    description:
      'Добавить семинар в избранное текущего пользователя. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Семинар успешно добавлен в избранное',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден' })
  @ApiResponse({
    status: 409,
    description: 'Семинар уже добавлен в избранное',
  })
  async addToFavorites(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Body() dto: AddToFavoritesDto,
  ): Promise<void> {
    await this.favoritesService.addToFavorites(dto.seminarId, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить избранное с пагинацией',
    description:
      'Получить список всех избранных семинаров текущего пользователя с пагинацией. ' +
      'Поддерживает пагинацию (по умолчанию: страница 1, лимит 10). ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Пагинированный список избранных семинаров',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/FavoriteItemDto' },
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
  async getFavorites(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<FavoriteItemDto>> {
    return this.favoritesService.getFavoritesPaginated(user.userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Delete(':seminarId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить семинар из избранного',
    description:
      'Удалить семинар из избранного текущего пользователя. ' +
      'Доступно только для роли DOCTOR.',
  })
  @ApiResponse({
    status: 204,
    description: 'Семинар успешно удалён из избранного',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Доступно только для роли DOCTOR',
  })
  @ApiResponse({ status: 404, description: 'Семинар не найден в избранном' })
  async removeFromFavorites(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Param('seminarId', ParseIntPipe) seminarId: number,
  ): Promise<void> {
    await this.favoritesService.removeFromFavorites(seminarId, user.userId);
  }
}

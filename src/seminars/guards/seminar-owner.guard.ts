import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type RequestWithUser = {
  user?: {
    userId: number;
    role: UserRole;
  };
  params: {
    id: string;
  };
};

/**
 * Guard проверяет, является ли пользователь создателем семинара
 */
@Injectable()
export class SeminarOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const seminarId = Number.parseInt(request.params.id, 10);

    if (!user) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    if (isNaN(seminarId)) {
      throw new ForbiddenException('Неверный ID семинара');
    }

    const seminar = (await this.prisma.seminar.findUnique({
      where: { id: seminarId },
      select: { organizerId: true },
    })) as { organizerId: number } | null;

    if (!seminar) {
      throw new NotFoundException('Семинар не найден');
    }

    if (seminar.organizerId !== user.userId) {
      throw new ForbiddenException(
        'Только создатель семинара может выполнить это действие',
      );
    }

    return true;
  }
}

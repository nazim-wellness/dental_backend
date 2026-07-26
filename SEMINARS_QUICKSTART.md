# 🚀 Быстрый старт: Модуль семинаров

## ✅ Что уже сделано:

1. ✅ **Prisma схема** - таблицы Seminar, Lecturer, SeminarFormat
2. ✅ **Upload Module** - загрузка файлов в S3
3. ✅ **SeminarFormats Module** - CRUD для форматов
4. ✅ **DTOs** - для всех модулей
5. ✅ **Guards** - RolesGuard, SeminarOwnerGuard
6. ✅ **Decorators** - @Roles(), @CurrentUser()

## 📦 Шаг 1: Установите зависимости

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @nestjs/platform-express
npm install -D @types/multer
```

## 🗄️ Шаг 2: Миграция БД

```bash
npx prisma migrate dev --name add_seminars
npx prisma generate
```

## 🔧 Шаг 3: Добавьте переменные окружения

В `.env`:

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket
AWS_S3_PUBLIC_URL=https://your-cdn.com
```

## 🏗️ Шаг 4: Создайте недостающие модули

### A. Lecturers Module

Создайте `src/lecturers/lecturers.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { LecturerDto } from './dto/lecturer.dto';

@Injectable()
export class LecturersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLecturerDto): Promise<LecturerDto> {
    const lecturer = await this.prisma.lecturer.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        position: dto.position,
        yearsExperience: dto.yearsExperience,
        achievements: dto.achievements,
        photoUrl: dto.photoUrl,
        bio: dto.bio,
      },
    });
    return this.mapToDto(lecturer);
  }

  async findAll(): Promise<LecturerDto[]> {
    const lecturers = await this.prisma.lecturer.findMany({
      where: { isActive: true },
    });
    return lecturers.map((l) => this.mapToDto(l));
  }

  private mapToDto(lecturer: any): LecturerDto {
    return {
      id: lecturer.id,
      firstName: lecturer.firstName,
      lastName: lecturer.lastName,
      middleName: lecturer.middleName,
      position: lecturer.position,
      yearsExperience: lecturer.yearsExperience,
      achievements: lecturer.achievements,
      photoUrl: lecturer.photoUrl,
      bio: lecturer.bio,
    };
  }
}
```

Создайте `src/lecturers/lecturers.controller.ts` (по аналогии с SeminarFormats).

Создайте `src/lecturers/lecturers.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { LecturersController } from './lecturers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // ← AuthModule обязателен для JwtAuthGuard!
  controllers: [LecturersController],
  providers: [LecturersService],
  exports: [LecturersService],
})
export class LecturersModule {}
```

### B. Lecturers Controller

Создайте `src/lecturers/lecturers.controller.ts`:

```typescript
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
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Создать лектора' })
  @ApiResponse({ status: 201, type: LecturerDto })
  async create(@Body() createDto: CreateLecturerDto): Promise<LecturerDto> {
    return this.lecturersService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Получить список лекторов' })
  @ApiResponse({ status: 200, type: [LecturerDto] })
  async findAll(): Promise<LecturerDto[]> {
    return this.lecturersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Получить лектора по ID' })
  @ApiResponse({ status: 200, type: LecturerDto })
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
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Обновить лектора' })
  @ApiResponse({ status: 200, type: LecturerDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLecturerDto,
  ): Promise<LecturerDto> {
    return this.lecturersService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Удалить лектора' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.lecturersService.remove(id);
  }
}
```

### C. Seminars Module

Создайте `src/seminars/seminars.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { SeminarDto } from './dto/seminar.dto';

@Injectable()
export class SeminarsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateSeminarDto,
    organizerId: number,
  ): Promise<SeminarDto> {
    const seminar = await this.prisma.seminar.create({
      data: {
        title: dto.title,
        description: dto.description,
        city: dto.city,
        price: dto.price,
        eventDate: new Date(dto.eventDate),
        eventTime: dto.eventTime,
        photoUrl: dto.photoUrl,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        contactTelegram: dto.contactTelegram,
        organizerId,
        lecturerId: dto.lecturerId,
        formatId: dto.formatId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lecturer: true,
        format: true,
      },
    });

    return this.mapToDto(seminar);
  }

  async findAll(): Promise<SeminarDto[]> {
    const seminars = await this.prisma.seminar.findMany({
      where: { isActive: true },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lecturer: true,
        format: true,
      },
      orderBy: { eventDate: 'asc' },
    });

    return seminars.map((s) => this.mapToDto(s));
  }

  private mapToDto(seminar: any): SeminarDto {
    return {
      id: seminar.id,
      title: seminar.title,
      description: seminar.description,
      city: seminar.city,
      price: Number(seminar.price),
      eventDate: seminar.eventDate,
      eventTime: seminar.eventTime,
      photoUrl: seminar.photoUrl,
      contactPhone: seminar.contactPhone,
      contactEmail: seminar.contactEmail,
      contactTelegram: seminar.contactTelegram,
      organizer: {
        id: seminar.organizer.id,
        firstName: seminar.organizer.firstName,
        lastName: seminar.organizer.lastName,
        phone: seminar.organizer.phone,
      },
      lecturer: seminar.lecturer,
      format: seminar.format,
      createdAt: seminar.createdAt,
      updatedAt: seminar.updatedAt,
    };
  }
}
```

Создайте контроллер `src/seminars/seminars.controller.ts`:

```typescript
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
import { SeminarsService } from './seminars.service';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { SeminarDto } from './dto/seminar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SeminarOwnerGuard } from './guards/seminar-owner.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Семинары')
@Controller('seminars')
export class SeminarsController {
  constructor(private readonly seminarsService: SeminarsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Создать семинар (только ORGANIZER)' })
  @ApiResponse({ status: 201, type: SeminarDto })
  async create(
    @CurrentUser() user: { userId: number; role: UserRole },
    @Body() createDto: CreateSeminarDto,
  ): Promise<SeminarDto> {
    return this.seminarsService.create(createDto, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Получить список семинаров' })
  @ApiResponse({ status: 200, type: [SeminarDto] })
  async findAll(): Promise<SeminarDto[]> {
    return this.seminarsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Получить семинар по ID' })
  @ApiResponse({ status: 200, type: SeminarDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SeminarDto> {
    const seminar = await this.seminarsService.findOne(id);
    if (!seminar) {
      throw new NotFoundException('Семинар не найден');
    }
    return seminar;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SeminarOwnerGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Обновить семинар (только создатель)' })
  @ApiResponse({ status: 200, type: SeminarDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSeminarDto,
  ): Promise<SeminarDto> {
    return this.seminarsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SeminarOwnerGuard)
  @ApiBearerAuth('Auth')
  @ApiOperation({ summary: 'Удалить семинар (только создатель)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.seminarsService.remove(id);
  }
}
```

### D. Обновите App Module

Добавьте в `src/app.module.ts`:

```typescript
import { LecturersModule } from './lecturers/lecturers.module';
import { SeminarsModule } from './seminars/seminars.module';

@Module({
  imports: [
    // ...existing
    LecturersModule,
    SeminarsModule,
  ],
})
```

## 🧪 Шаг 5: Тестирование

```bash
# 1. Запустите сервер
npm run start:dev

# 2. Создайте формат
curl -X POST http://localhost:3000/seminar-formats \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Мастер-класс", "description": "Практика"}'

# 3. Загрузите фото
curl -X POST http://localhost:3000/upload/lecturer-image \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@photo.jpg"

# 4. Создайте лектора
curl -X POST http://localhost:3000/lecturers \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Иванов",
    "position": "Главный врач",
    "yearsExperience": 15,
    "achievements": ["К.м.н."],
    "photoUrl": "https://..."
  }'

# 5. Создайте семинар
curl -X POST http://localhost:3000/seminars \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Имплантация",
    "description": "Описание",
    "city": "Москва",
    "price": 15000,
    "eventDate": "2024-12-15",
    "eventTime": "10:00",
    "lecturerId": 1,
    "formatId": 1
  }'
```

## 📚 Документация

- Полная документация: `docs/SEMINARS_SETUP.md`
- Обработка ошибок: `docs/ERROR_HANDLING.md`
- Telegram авторизация: `docs/TELEGRAM_AUTH_TESTING.md`

## ✨ Готово!

После выполнения этих шагов у вас будет:

- ✅ Загрузка файлов в S3
- ✅ CRUD для форматов, лекторов, семинаров
- ✅ Проверка прав доступа
- ✅ Swagger документация

🎉 **Успехов!**

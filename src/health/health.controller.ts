import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Здоровье сервиса')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка liveness (жив ли сервис)' })
  @ApiResponse({ status: 200, description: 'Сервис жив' })
  getHealth(): string {
    return this.healthService.getStatus();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Проверка readiness (готовность, в т.ч. БД)' })
  @ApiResponse({ status: 200, description: 'Сервис готов к приему трафика' })
  async getReadiness(): Promise<unknown> {
    return this.healthService.getReadiness();
  }
}

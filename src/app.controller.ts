import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('privacy-policy')
  getPrivacyPolicy(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'privacy-policy.html'));
  }

  @Get('terms-of-use')
  getTerms(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'terms-of-use.html'));
  }
}

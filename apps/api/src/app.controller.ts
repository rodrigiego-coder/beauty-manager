import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return { status: 'ok', service: 'beauty-manager-api' };
  }

  @Public()
  @Get('healthz')
  getHealthz() {
    return { status: 'ok' };
  }
}

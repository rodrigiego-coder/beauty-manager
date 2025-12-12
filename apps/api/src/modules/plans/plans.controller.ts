import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * GET /plans - List all active plans (public)
   */
  @Get()
  @Public()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.plansService.findAll(include);
  }

  /**
   * GET /plans/:id - Get plan details
   */
  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    return this.plansService.findById(id);
  }

  /**
   * POST /plans - Create a new plan (SUPER_ADMIN only)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  /**
   * PATCH /plans/:id - Update a plan (SUPER_ADMIN only)
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  /**
   * DELETE /plans/:id - Deactivate a plan (SUPER_ADMIN only)
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async deactivate(@Param('id') id: string) {
    return this.plansService.deactivate(id);
  }

  /**
   * POST /plans/seed - Seed default plans (SUPER_ADMIN only)
   */
  @Post('seed')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async seed() {
    await this.plansService.seedPlans();
    return { message: 'Planos padrão criados com sucesso' };
  }
}

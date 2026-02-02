import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateServiceDto, UpdateServiceDto } from './dto';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('services')
@UseGuards(AuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * GET /services
   * Lista todos os serviços do salão
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const showInactive = includeInactive === 'true';

    if (category) {
      return this.servicesService.findByCategory(user.salonId, category);
    }

    if (search) {
      return this.servicesService.search(user.salonId, search, showInactive);
    }

    return this.servicesService.findAll(user.salonId, showInactive);
  }

  /**
   * PATCH /services/bulk-status
   * Ativa/desativa múltiplos serviços de uma vez
   */
  @Patch('bulk-status')
  async bulkUpdateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { ids: number[]; active: boolean },
  ) {
    return this.servicesService.bulkUpdateStatus(body.ids, body.active, user.salonId);
  }

  /**
   * GET /services/:id
   * Busca serviço por ID
   */
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const service = await this.servicesService.findById(id);
    if (!service || service.salonId !== user.salonId) {
      return null;
    }
    return service;
  }

  /**
   * POST /services
   * Cria novo serviço
   */
  @Post()
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: CreateServiceDto,
  ) {
    return this.servicesService.create(user.salonId, data);
  }

  /**
   * PATCH /services/:id
   * Atualiza serviço existente
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, user.salonId, data);
  }

  /**
   * DELETE /services/:id
   * Desativa serviço (soft delete)
   */
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.servicesService.delete(id, user.salonId);
  }

  /**
   * PATCH /services/:id/reactivate
   * Reativa serviço desativado
   */
  @Patch(':id/reactivate')
  async reactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.servicesService.reactivate(id, user.salonId);
  }
}

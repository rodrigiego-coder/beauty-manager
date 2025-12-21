import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ServiceConsumptionsService } from './service-consumptions.service';
import { UpdateServiceConsumptionsDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('services')
@UseGuards(AuthGuard)
export class ServiceConsumptionsController {
  constructor(
    private readonly serviceConsumptionsService: ServiceConsumptionsService,
  ) {}

  /**
   * GET /services/:serviceId/consumptions
   * Lista BOM (Bill of Materials) do serviço
   */
  @Get(':serviceId/consumptions')
  @Roles('OWNER', 'MANAGER')
  async findByService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.serviceConsumptionsService.findByService(serviceId, user.salonId);
  }

  /**
   * PUT /services/:serviceId/consumptions
   * Substitui completamente o BOM do serviço
   */
  @Put(':serviceId/consumptions')
  @Roles('OWNER', 'MANAGER')
  async replaceConsumptions(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdateServiceConsumptionsDto,
  ) {
    return this.serviceConsumptionsService.replaceConsumptions(
      serviceId,
      user.salonId,
      data.items,
    );
  }
}

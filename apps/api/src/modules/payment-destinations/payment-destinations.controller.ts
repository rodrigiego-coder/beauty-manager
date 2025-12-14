import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PaymentDestinationsService } from './payment-destinations.service';
import { CreatePaymentDestinationDto, UpdatePaymentDestinationDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('payment-destinations')
@UseGuards(AuthGuard)
export class PaymentDestinationsController {
  constructor(private readonly paymentDestinationsService: PaymentDestinationsService) {}

  /**
   * GET /payment-destinations
   * Lista todos os destinos de pagamento do salão
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('all') all?: string,
  ) {
    const includeInactive = all === 'true';

    // Seed default destinations se necessário
    await this.paymentDestinationsService.seedDefaultDestinations(user.salonId);

    return this.paymentDestinationsService.findAll(user.salonId, includeInactive);
  }

  /**
   * GET /payment-destinations/:id
   * Busca um destino de pagamento por ID
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const item = await this.paymentDestinationsService.findById(id);
    if (!item || item.salonId !== user.salonId) {
      throw new NotFoundException('Destino de pagamento não encontrado');
    }
    return item;
  }

  /**
   * POST /payment-destinations
   * Cria um novo destino de pagamento
   */
  @Post()
  @Roles('OWNER', 'MANAGER')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: CreatePaymentDestinationDto,
  ) {
    return this.paymentDestinationsService.create(user.salonId, data);
  }

  /**
   * PATCH /payment-destinations/:id
   * Atualiza um destino de pagamento
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdatePaymentDestinationDto,
  ) {
    const existing = await this.paymentDestinationsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Destino de pagamento não encontrado');
    }
    return this.paymentDestinationsService.update(id, data);
  }

  /**
   * DELETE /payment-destinations/:id
   * Desativa um destino de pagamento (soft delete)
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const existing = await this.paymentDestinationsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Destino de pagamento não encontrado');
    }
    await this.paymentDestinationsService.delete(id);
    return { message: 'Destino de pagamento desativado com sucesso' };
  }

  /**
   * PATCH /payment-destinations/:id/reactivate
   * Reativa um destino de pagamento
   */
  @Patch(':id/reactivate')
  @Roles('OWNER', 'MANAGER')
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const existing = await this.paymentDestinationsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Destino de pagamento não encontrado');
    }
    return this.paymentDestinationsService.reactivate(id);
  }
}

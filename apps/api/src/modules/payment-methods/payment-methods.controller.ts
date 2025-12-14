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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('payment-methods')
@UseGuards(AuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  /**
   * GET /payment-methods
   * Lista todas as formas de pagamento do salão
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('all') all?: string,
  ) {
    const includeInactive = all === 'true';

    // Seed default methods se necessário
    await this.paymentMethodsService.seedDefaultMethods(user.salonId);

    return this.paymentMethodsService.findAll(user.salonId, includeInactive);
  }

  /**
   * GET /payment-methods/:id
   * Busca uma forma de pagamento por ID
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const item = await this.paymentMethodsService.findById(id);
    if (!item || item.salonId !== user.salonId) {
      throw new NotFoundException('Forma de pagamento não encontrada');
    }
    return item;
  }

  /**
   * POST /payment-methods
   * Cria uma nova forma de pagamento
   */
  @Post()
  @Roles('OWNER', 'MANAGER')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.create(user.salonId, data);
  }

  /**
   * PATCH /payment-methods/:id
   * Atualiza uma forma de pagamento
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdatePaymentMethodDto,
  ) {
    const existing = await this.paymentMethodsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Forma de pagamento não encontrada');
    }
    return this.paymentMethodsService.update(id, data);
  }

  /**
   * DELETE /payment-methods/:id
   * Desativa uma forma de pagamento (soft delete)
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const existing = await this.paymentMethodsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Forma de pagamento não encontrada');
    }
    await this.paymentMethodsService.delete(id);
    return { message: 'Forma de pagamento desativada com sucesso' };
  }

  /**
   * PATCH /payment-methods/:id/reactivate
   * Reativa uma forma de pagamento
   */
  @Patch(':id/reactivate')
  @Roles('OWNER', 'MANAGER')
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const existing = await this.paymentMethodsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Forma de pagamento não encontrada');
    }
    return this.paymentMethodsService.reactivate(id);
  }
}

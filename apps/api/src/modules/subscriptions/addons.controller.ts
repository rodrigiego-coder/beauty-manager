import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AddonsService } from './addons.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActivateAddonDto, GrantCreditsDto } from './addons.dto';

@Controller('subscriptions/addons')
@UseGuards(AuthGuard, RolesGuard)
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  /**
   * GET /subscriptions/addons/catalog
   * Retorna o catálogo de add-ons e pacotes de crédito disponíveis
   * Acessível por: OWNER, MANAGER, RECEPTIONIST, STYLIST
   */
  @Get('catalog')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getCatalog() {
    return this.addonsService.getCatalog();
  }

  /**
   * GET /subscriptions/addons/status
   * Retorna os add-ons ativos do salão e as quotas do mês atual
   * Acessível por: OWNER, MANAGER, RECEPTIONIST, STYLIST
   */
  @Get('status')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getStatus(@CurrentUser() user: any) {
    return this.addonsService.getStatus(user.salonId);
  }

  /**
   * POST /subscriptions/addons/activate
   * Ativa um add-on para o salão (sem cobrança MP - somente simulação)
   * Acessível por: OWNER, MANAGER
   */
  @Post('activate')
  @Roles('OWNER', 'MANAGER')
  async activateAddon(
    @CurrentUser() user: any,
    @Body() dto: ActivateAddonDto,
  ) {
    return this.addonsService.activateAddon(user.salonId, dto.addonCode, user.id);
  }
}

@Controller('subscriptions/credits')
@UseGuards(AuthGuard, RolesGuard)
export class CreditsController {
  constructor(private readonly addonsService: AddonsService) {}

  /**
   * POST /subscriptions/credits/grant
   * Concede créditos extras ao salão (simulação de compra)
   * Acessível por: OWNER, MANAGER
   */
  @Post('grant')
  @Roles('OWNER', 'MANAGER')
  async grantCredits(
    @CurrentUser() user: any,
    @Body() dto: GrantCreditsDto,
  ) {
    return this.addonsService.grantCredits(
      user.salonId,
      dto.packageCode,
      dto.qtyPackages,
      user.id,
    );
  }
}

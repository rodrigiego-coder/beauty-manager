import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AddonsService } from './addons.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActivateAddonDto, GrantCreditsDto } from './addons.dto';

@ApiTags('Subscriptions - Add-ons')
@ApiBearerAuth('access-token')
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
  @ApiOperation({ summary: 'Listar catálogo de add-ons disponíveis' })
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
  @ApiOperation({ summary: 'Status dos add-ons e quotas do salão' })
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
  @ApiOperation({ summary: 'Ativar add-on para o salão' })
  @ApiBody({ type: ActivateAddonDto })
  async activateAddon(
    @CurrentUser() user: any,
    @Body() dto: ActivateAddonDto,
  ) {
    return this.addonsService.activateAddon(user.salonId, dto.addonCode, user.id);
  }
}

@ApiTags('Subscriptions - Créditos')
@ApiBearerAuth('access-token')
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
  @ApiOperation({ summary: 'Comprar créditos extras' })
  @ApiBody({ type: GrantCreditsDto })
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

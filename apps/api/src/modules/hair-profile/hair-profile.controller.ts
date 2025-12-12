import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { HairProfileService } from './hair-profile.service';
import {
  CreateHairProfileDto,
  UpdateHairProfileDto,
  HairTypeLabels,
  HairThicknessLabels,
  HairLengthLabels,
  HairPorosityLabels,
  ScalpTypeLabels,
  ChemicalHistoryLabels,
  ChemicalHistoryOptions,
  HairConcernsLabels,
  HairConcernsOptions,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    salonId: string;
    role: string;
  };
}

/**
 * HairProfileController
 * Endpoints para gerenciamento de perfis capilares
 */
@Controller('hair-profiles')
@UseGuards(AuthGuard, RolesGuard)
export class HairProfileController {
  constructor(private readonly hairProfileService: HairProfileService) {}

  /**
   * GET /hair-profiles/options
   * Retorna as opções disponíveis para os campos
   */
  @Get('options')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  getOptions() {
    return {
      hairTypes: Object.entries(HairTypeLabels).map(([value, label]) => ({ value, label })),
      hairThickness: Object.entries(HairThicknessLabels).map(([value, label]) => ({ value, label })),
      hairLength: Object.entries(HairLengthLabels).map(([value, label]) => ({ value, label })),
      hairPorosity: Object.entries(HairPorosityLabels).map(([value, label]) => ({ value, label })),
      scalpTypes: Object.entries(ScalpTypeLabels).map(([value, label]) => ({ value, label })),
      chemicalHistory: ChemicalHistoryOptions.map(value => ({
        value,
        label: ChemicalHistoryLabels[value],
      })),
      concerns: HairConcernsOptions.map(value => ({
        value,
        label: HairConcernsLabels[value],
      })),
    };
  }

  /**
   * GET /hair-profiles/stats
   * Retorna estatísticas dos perfis capilares
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.hairProfileService.getStats(req.user.salonId);
  }

  /**
   * GET /hair-profiles/clients
   * Lista clientes com indicação se têm perfil
   */
  @Get('clients')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async listClientsWithProfile(@Request() req: AuthenticatedRequest) {
    return this.hairProfileService.listClientsWithProfile(req.user.salonId);
  }

  /**
   * GET /hair-profiles/client/:clientId
   * Obtém o perfil capilar de um cliente
   */
  @Get('client/:clientId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getByClientId(
    @Param('clientId') clientId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.hairProfileService.getByClientId(req.user.salonId, clientId);
  }

  /**
   * POST /hair-profiles
   * Cria ou atualiza o perfil capilar
   */
  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async upsert(
    @Body() dto: CreateHairProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.hairProfileService.upsert(
      req.user.salonId,
      dto,
      req.user.sub,
    );
  }

  /**
   * PUT /hair-profiles/client/:clientId
   * Atualiza parcialmente o perfil capilar
   */
  @Put('client/:clientId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async update(
    @Param('clientId') clientId: string,
    @Body() dto: UpdateHairProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.hairProfileService.update(
      req.user.salonId,
      clientId,
      dto,
      req.user.sub,
    );
  }

  /**
   * DELETE /hair-profiles/client/:clientId
   * Remove o perfil capilar
   */
  @Delete('client/:clientId')
  @Roles('OWNER', 'MANAGER')
  async delete(
    @Param('clientId') clientId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.hairProfileService.delete(req.user.salonId, clientId);
    return { message: 'Perfil capilar removido com sucesso' };
  }
}

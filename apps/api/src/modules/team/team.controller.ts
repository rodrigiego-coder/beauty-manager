import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto, SetServicesDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('team')
@UseGuards(AuthGuard, RolesGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  /**
   * GET /team - Lista membros da equipe
   */
  @Get()
  @Roles('OWNER', 'MANAGER')
  async findAll(
    @CurrentUser() user: any,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.teamService.findAll(
      user.salonId,
      includeInactive === 'true'
    );
  }

  /**
   * GET /team/summary - Resumo da equipe
   */
  @Get('summary')
  @Roles('OWNER', 'MANAGER')
  async getSummary(@CurrentUser() user: any) {
    return this.teamService.getSummary(user.salonId);
  }

  /**
   * GET /team/:id - Busca membro por ID
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamService.findById(id, user.salonId);
  }

  /**
   * POST /team - Convida novo membro
   */
  @Post()
  @Roles('OWNER', 'MANAGER')
  async invite(@Body() data: CreateTeamMemberDto, @CurrentUser() user: any) {
    return this.teamService.invite(user.salonId, data);
  }

  /**
   * PATCH /team/:id - Atualiza membro
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTeamMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.teamService.update(id, user.salonId, data);
  }

  /**
   * DELETE /team/:id - Desativa membro
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamService.deactivate(id, user.salonId);
  }

  /**
   * PATCH /team/:id/reactivate - Reativa membro
   */
  @Patch(':id/reactivate')
  @Roles('OWNER', 'MANAGER')
  async reactivate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamService.reactivate(id, user.salonId);
  }

  /**
   * GET /team/:id/services - Lista serviços que o profissional realiza
   */
  @Get(':id/services')
  @Roles('OWNER', 'MANAGER')
  async getServices(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamService.getAssignedServices(id, user.salonId);
  }

  /**
   * PUT /team/:id/services - Define serviços do profissional (replace all)
   * Suporta formato novo (manualServiceIds + onlineServiceIds) e legado (serviceIds)
   */
  @Patch(':id/services')
  @Roles('OWNER', 'MANAGER')
  async setServices(
    @Param('id') id: string,
    @Body() body: SetServicesDto,
    @CurrentUser() user: any,
  ) {
    return this.teamService.setAssignedServices(
      id,
      user.salonId,
      body.serviceIds || [],
      body.manualServiceIds,
      body.onlineServiceIds,
    );
  }
}

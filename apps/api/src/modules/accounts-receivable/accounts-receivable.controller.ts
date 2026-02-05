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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsReceivableService, SettleAccountDto } from './accounts-receivable.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface CurrentUserType {
  id: string;
  salonId: string;
  role: string;
}

@ApiTags('Contas a Receber')
@ApiBearerAuth()
@Controller('accounts-receivable')
@UseGuards(AuthGuard, RolesGuard)
export class AccountsReceivableController {
  constructor(private readonly accountsReceivableService: AccountsReceivableService) {}

  /**
   * GET /accounts-receivable
   * Lista todas as contas a receber do salão
   */
  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Lista contas a receber' })
  async findAll(
    @CurrentUser() user: CurrentUserType,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.accountsReceivableService.findAll(user.salonId, { status, clientId });
  }

  /**
   * GET /accounts-receivable/summary
   * Retorna resumo das contas a receber
   */
  @Get('summary')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Resumo de contas a receber' })
  async getSummary(@CurrentUser() user: CurrentUserType) {
    return this.accountsReceivableService.getSummary(user.salonId);
  }

  /**
   * GET /accounts-receivable/total-pending
   * Retorna total de contas pendentes (para dashboard financeiro)
   */
  @Get('total-pending')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Total de contas pendentes' })
  async getTotalPending(@CurrentUser() user: CurrentUserType) {
    return this.accountsReceivableService.getTotalPending(user.salonId);
  }

  /**
   * GET /accounts-receivable/:id
   * Busca conta por ID
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Busca conta por ID' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.accountsReceivableService.findById(id, user.salonId);
  }

  /**
   * POST /accounts-receivable/:id/settle
   * Quita uma conta a receber
   */
  @Post(':id/settle')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Quita conta a receber' })
  async settle(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
    @Body() data?: SettleAccountDto,
  ) {
    return this.accountsReceivableService.settle(id, user.salonId, user.id, data);
  }

  /**
   * PATCH /accounts-receivable/:id
   * Atualiza uma conta (notas, vencimento)
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Atualiza conta a receber' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
    @Body() data: { notes?: string; dueDate?: string },
  ) {
    return this.accountsReceivableService.update(id, user.salonId, {
      notes: data.notes,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  }

  /**
   * DELETE /accounts-receivable/:id/cancel
   * Cancela uma conta a receber
   */
  @Delete(':id/cancel')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Cancela conta a receber' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
    @Body() data?: { reason?: string },
  ) {
    return this.accountsReceivableService.cancel(id, user.salonId, user.id, data?.reason);
  }
}

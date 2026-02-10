import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientBookingRulesService } from '../online-booking/client-booking-rules.service';
import { BookingRuleType } from '../online-booking/dto';

/** User payload from JWT token */
interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('clients')
@UseGuards(AuthGuard)
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly bookingRulesService: ClientBookingRulesService,
  ) {}

  /**
   * GET /clients
   * Lista todos os clientes do salão
   */
  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('requiresDeposit') requiresDeposit?: string,
  ) {
    const clients = await this.clientsService.findAll({
      salonId: user.salonId,
      search,
      includeInactive: includeInactive === 'true',
    });

    // Busca todas as regras de booking ativas do salao
    const allRules = await this.bookingRulesService.listRules(user.salonId, false);

    // Enriquece os clientes com informacao de booking rules
    const enrichedClients = clients.map(client => {
      const clientRules = allRules.filter(
        r => r.clientId === client.id || r.clientPhone === client.phone
      );
      const hasDepositRule = clientRules.some(r => r.ruleType === 'DEPOSIT_REQUIRED');
      const hasBlockRule = clientRules.some(r => r.ruleType === 'BLOCKED');

      return {
        ...client,
        requiresDeposit: hasDepositRule,
        blockedFromOnline: hasBlockRule,
      };
    });

    // Filtra por requiresDeposit se solicitado
    if (requiresDeposit === 'true') {
      return enrichedClients.filter(c => c.requiresDeposit);
    }

    return enrichedClients;
  }

  /**
   * GET /clients/stats
   * Retorna estatísticas dos clientes
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.clientsService.getStats(user.salonId);
  }

  /**
   * GET /clients/search?term=xxx
   * Busca clientes por termo
   */
  @Get('search')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async search(
    @CurrentUser() user: CurrentUserPayload,
    @Query('term') term: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    if (!term || term.length < 2) {
      return [];
    }
    return this.clientsService.search(user.salonId, term, includeInactive === 'true');
  }

  /**
   * GET /clients/:id
   * Busca cliente por ID
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const client = await this.clientsService.findById(id);

    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return client;
  }

  /**
   * GET /clients/:id/history
   * Retorna histórico de comandas do cliente
   */
  @Get(':id/history')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getHistory(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const client = await this.clientsService.findById(id);
    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.getHistory(id);
  }

  /**
   * POST /clients
   * Cria um novo cliente
   */
  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: CreateClientDto,
  ) {
    return this.clientsService.create({
      ...data,
      salonId: user.salonId,
    });
  }

  /**
   * PATCH /clients/:id
   * Atualiza um cliente
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: UpdateClientDto,
  ) {
    // Verificar se cliente pertence ao salão
    const existing = await this.clientsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    const client = await this.clientsService.update(id, data);
    return client;
  }

  /**
   * PATCH /clients/:id/reactivate
   * Reativa um cliente desativado
   */
  @Patch(':id/reactivate')
  @Roles('OWNER', 'MANAGER')
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const existing = await this.clientsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.reactivate(id);
  }

  /**
   * DELETE /clients/:id
   * Desativa um cliente (soft delete)
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const existing = await this.clientsService.findById(id);
    if (!existing || existing.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    await this.clientsService.delete(id);
    return { message: 'Cliente desativado com sucesso' };
  }

  /**
   * PATCH /clients/:id/toggle-ai
   * Alterna o status da IA para o cliente
   */
  @Patch(':id/toggle-ai')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async toggleAi(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Verificar se cliente pertence ao salão
    const client = await this.clientsService.findById(id);
    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return this.clientsService.setAiActive(id, !client.aiActive);
  }

  // ==================== BOOKING RULES ====================

  /**
   * GET /clients/:id/booking-rules
   * Retorna regras de agendamento online para o cliente
   */
  @Get(':id/booking-rules')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getBookingRules(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const client = await this.clientsService.findById(id);
    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    const rules = await this.bookingRulesService.getActiveRulesForClient(
      user.salonId,
      client.phone,
      client.id,
    );

    // Determina os estados de forma simplificada
    const requiresDeposit = rules.some(r => r.ruleType === 'DEPOSIT_REQUIRED');
    const blockedFromOnline = rules.some(r => r.ruleType === 'BLOCKED');

    // Busca a regra de deposito para pegar a nota
    const depositRule = rules.find(r => r.ruleType === 'DEPOSIT_REQUIRED');
    const blockRule = rules.find(r => r.ruleType === 'BLOCKED');

    return {
      requiresDeposit,
      blockedFromOnline,
      depositNotes: depositRule?.reason || '',
      blockNotes: blockRule?.reason || '',
      rules,
    };
  }

  /**
   * PATCH /clients/:id/booking-rules
   * Atualiza regras de agendamento online para o cliente
   */
  @Patch(':id/booking-rules')
  @Roles('OWNER', 'MANAGER')
  async updateBookingRules(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: {
      requiresDeposit?: boolean;
      blockedFromOnline?: boolean;
      depositNotes?: string;
      blockNotes?: string;
    },
  ) {
    const client = await this.clientsService.findById(id);
    if (!client || client.salonId !== user.salonId) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    const currentRules = await this.bookingRulesService.getActiveRulesForClient(
      user.salonId,
      client.phone,
      client.id,
    );

    // Gerencia regra de DEPOSIT_REQUIRED
    if (body.requiresDeposit !== undefined) {
      const existingDepositRule = currentRules.find(r => r.ruleType === 'DEPOSIT_REQUIRED');

      if (body.requiresDeposit && !existingDepositRule) {
        // Cria nova regra
        await this.bookingRulesService.createRule(
          user.salonId,
          {
            clientId: client.id,
            clientPhone: client.phone,
            ruleType: BookingRuleType.DEPOSIT_REQUIRED,
            reason: body.depositNotes || 'Taxa obrigatoria',
          },
          user.id,
        );
      } else if (!body.requiresDeposit && existingDepositRule) {
        // Remove regra existente
        await this.bookingRulesService.deactivateRule(user.salonId, existingDepositRule.id);
      } else if (body.requiresDeposit && existingDepositRule && body.depositNotes !== undefined) {
        // Atualiza nota da regra existente
        await this.bookingRulesService.updateRule(user.salonId, existingDepositRule.id, {
          reason: body.depositNotes,
        });
      }
    }

    // Gerencia regra de BLOCKED
    if (body.blockedFromOnline !== undefined) {
      const existingBlockRule = currentRules.find(r => r.ruleType === 'BLOCKED');

      if (body.blockedFromOnline && !existingBlockRule) {
        // Cria nova regra
        await this.bookingRulesService.createRule(
          user.salonId,
          {
            clientId: client.id,
            clientPhone: client.phone,
            ruleType: BookingRuleType.BLOCKED,
            reason: body.blockNotes || 'Bloqueado do agendamento online',
          },
          user.id,
        );
      } else if (!body.blockedFromOnline && existingBlockRule) {
        // Remove regra existente
        await this.bookingRulesService.deactivateRule(user.salonId, existingBlockRule.id);
      } else if (body.blockedFromOnline && existingBlockRule && body.blockNotes !== undefined) {
        // Atualiza nota da regra existente
        await this.bookingRulesService.updateRule(user.salonId, existingBlockRule.id, {
          reason: body.blockNotes,
        });
      }
    }

    // Retorna o estado atualizado
    return this.getBookingRules(id, user);
  }

  /**
   * GET /clients/with-deposit-rule
   * Lista clientes que tem regra de deposito obrigatorio
   */
  @Get('with-deposit-rule')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getClientsWithDepositRule(@CurrentUser() user: CurrentUserPayload) {
    const rules = await this.bookingRulesService.listRules(user.salonId);
    const depositRules = rules.filter(r => r.ruleType === 'DEPOSIT_REQUIRED' && r.isActive);

    // Busca dados dos clientes
    const clientIds = depositRules
      .filter(r => r.clientId)
      .map(r => r.clientId);

    const clientsWithRules = await Promise.all(
      clientIds.map(async (clientId) => {
        if (!clientId) return null;
        const client = await this.clientsService.findById(clientId);
        const rule = depositRules.find(r => r.clientId === clientId);
        return client ? {
          ...client,
          depositNotes: rule?.reason,
        } : null;
      })
    );

    return clientsWithRules.filter(Boolean);
  }
}

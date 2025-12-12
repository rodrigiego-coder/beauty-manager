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
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LoyaltyService } from './loyalty.service';
import {
  CreateProgramDto,
  UpdateProgramDto,
  CreateTierDto,
  UpdateTierDto,
  CreateRewardDto,
  UpdateRewardDto,
  EnrollClientDto,
  AdjustPointsDto,
  UseVoucherDto,
  RewardTypeLabels,
  TransactionTypeLabels,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    salonId: string;
    role: string;
  };
}

/**
 * LoyaltyController
 * Endpoints para gerenciamento do programa de fidelidade
 */
@Controller('loyalty')
@UseGuards(AuthGuard, RolesGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // ==================== PROGRAM ENDPOINTS ====================

  /**
   * GET /loyalty/program
   * Obtém configuração do programa de fidelidade
   */
  @Get('program')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getProgram(@Request() req: AuthenticatedRequest) {
    return this.loyaltyService.getProgram(req.user.salonId);
  }

  /**
   * POST /loyalty/program
   * Cria/ativa programa de fidelidade
   */
  @Post('program')
  @Roles('OWNER', 'MANAGER')
  async createProgram(
    @Body() dto: CreateProgramDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.createProgram(req.user.salonId, dto);
  }

  /**
   * PATCH /loyalty/program
   * Atualiza configurações do programa
   */
  @Patch('program')
  @Roles('OWNER', 'MANAGER')
  async updateProgram(
    @Body() dto: UpdateProgramDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.updateProgram(req.user.salonId, dto);
  }

  // ==================== TIER ENDPOINTS ====================

  /**
   * GET /loyalty/tiers
   * Lista níveis do programa
   */
  @Get('tiers')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async listTiers(@Request() req: AuthenticatedRequest) {
    return this.loyaltyService.listTiers(req.user.salonId);
  }

  /**
   * POST /loyalty/tiers
   * Cria novo nível
   */
  @Post('tiers')
  @Roles('OWNER', 'MANAGER')
  async createTier(
    @Body() dto: CreateTierDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.createTier(req.user.salonId, dto);
  }

  /**
   * PATCH /loyalty/tiers/:id
   * Atualiza nível
   */
  @Patch('tiers/:id')
  @Roles('OWNER', 'MANAGER')
  async updateTier(
    @Param('id') id: string,
    @Body() dto: UpdateTierDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.updateTier(req.user.salonId, id, dto);
  }

  /**
   * DELETE /loyalty/tiers/:id
   * Remove nível
   */
  @Delete('tiers/:id')
  @Roles('OWNER', 'MANAGER')
  async deleteTier(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.loyaltyService.deleteTier(req.user.salonId, id);
    return { message: 'Nível removido com sucesso' };
  }

  // ==================== REWARD ENDPOINTS ====================

  /**
   * GET /loyalty/rewards
   * Lista recompensas
   */
  @Get('rewards')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async listRewards(@Request() req: AuthenticatedRequest) {
    return this.loyaltyService.listRewards(req.user.salonId);
  }

  /**
   * POST /loyalty/rewards
   * Cria nova recompensa
   */
  @Post('rewards')
  @Roles('OWNER', 'MANAGER')
  async createReward(
    @Body() dto: CreateRewardDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.createReward(req.user.salonId, dto);
  }

  /**
   * PATCH /loyalty/rewards/:id
   * Atualiza recompensa
   */
  @Patch('rewards/:id')
  @Roles('OWNER', 'MANAGER')
  async updateReward(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.updateReward(req.user.salonId, id, dto);
  }

  /**
   * DELETE /loyalty/rewards/:id
   * Remove recompensa (soft delete)
   */
  @Delete('rewards/:id')
  @Roles('OWNER', 'MANAGER')
  async deleteReward(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.loyaltyService.deleteReward(req.user.salonId, id);
    return { message: 'Recompensa removida com sucesso' };
  }

  // ==================== ACCOUNT ENDPOINTS ====================

  /**
   * GET /loyalty/account/:clientId
   * Obtém conta de fidelidade do cliente
   */
  @Get('account/:clientId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getAccount(
    @Param('clientId') clientId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.getAccount(req.user.salonId, clientId);
  }

  /**
   * POST /loyalty/account/:clientId/enroll
   * Inscreve cliente no programa
   */
  @Post('account/:clientId/enroll')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async enrollClient(
    @Param('clientId') clientId: string,
    @Body() dto: EnrollClientDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.enrollClient(
      req.user.salonId,
      clientId,
      dto.referralCode,
      req.user.sub,
    );
  }

  /**
   * GET /loyalty/account/:clientId/transactions
   * Lista extrato de pontos do cliente
   */
  @Get('account/:clientId/transactions')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getTransactions(
    @Param('clientId') clientId: string,
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.getTransactions(
      req.user.salonId,
      clientId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * GET /loyalty/account/:clientId/available-rewards
   * Lista recompensas disponíveis para o cliente
   */
  @Get('account/:clientId/available-rewards')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getAvailableRewards(
    @Param('clientId') clientId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.getAvailableRewards(req.user.salonId, clientId);
  }

  /**
   * POST /loyalty/account/:clientId/redeem/:rewardId
   * Resgata recompensa
   */
  @Post('account/:clientId/redeem/:rewardId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async redeemReward(
    @Param('clientId') clientId: string,
    @Param('rewardId') rewardId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.redeemReward(
      req.user.salonId,
      clientId,
      rewardId,
      req.user.sub,
    );
  }

  /**
   * POST /loyalty/account/:clientId/adjust
   * Ajuste manual de pontos (admin)
   */
  @Post('account/:clientId/adjust')
  @Roles('OWNER', 'MANAGER')
  async adjustPoints(
    @Param('clientId') clientId: string,
    @Body() dto: AdjustPointsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.adjustPoints(
      req.user.salonId,
      clientId,
      dto,
      req.user.sub,
    );
  }

  // ==================== VOUCHER ENDPOINTS ====================

  /**
   * GET /loyalty/voucher/:code
   * Valida voucher
   */
  @Get('voucher/:code')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async validateVoucher(
    @Param('code') code: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.validateVoucher(req.user.salonId, code);
  }

  /**
   * POST /loyalty/voucher/:code/use
   * Usa voucher na comanda
   */
  @Post('voucher/:code/use')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async useVoucher(
    @Param('code') code: string,
    @Body() dto: UseVoucherDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.loyaltyService.useVoucher(req.user.salonId, code, dto.commandId);
    return { message: 'Voucher aplicado com sucesso' };
  }

  // ==================== REFERRAL ENDPOINTS ====================

  /**
   * GET /loyalty/referral/:code
   * Info do código de indicação
   */
  @Get('referral/:code')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getReferralInfo(
    @Param('code') code: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.getReferralInfo(req.user.salonId, code);
  }

  // ==================== STATS ENDPOINTS ====================

  /**
   * GET /loyalty/stats
   * Estatísticas do programa
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.loyaltyService.getStats(req.user.salonId);
  }

  /**
   * GET /loyalty/leaderboard
   * Ranking de clientes
   */
  @Get('leaderboard')
  @Roles('OWNER', 'MANAGER')
  async getLeaderboard(
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.getLeaderboard(
      req.user.salonId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ==================== OPTIONS ENDPOINT ====================

  /**
   * GET /loyalty/options
   * Retorna opções para formulários
   */
  @Get('options')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  getOptions() {
    return {
      rewardTypes: Object.entries(RewardTypeLabels).map(([value, label]) => ({ value, label })),
      transactionTypes: Object.entries(TransactionTypeLabels).map(([value, label]) => ({ value, label })),
    };
  }

  // ==================== POINTS CALCULATION ENDPOINT ====================

  /**
   * GET /loyalty/calculate/:commandId
   * Calcula pontos para uma comanda
   */
  @Get('calculate/:commandId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async calculatePoints(
    @Param('commandId') commandId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.loyaltyService.calculatePointsForCommand(req.user.salonId, commandId);
  }
}

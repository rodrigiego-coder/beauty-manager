import {
  Controller,
  Get,
  Post,
  Put,
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
import { RecommendationsService } from './recommendations.service';
import {
  CreateRecommendationRuleDto,
  UpdateRecommendationRuleDto,
  LogRecommendationDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    salonId: string;
    role: string;
  };
}

/**
 * RecommendationsController
 * Endpoints para gerenciamento de recomendações de produtos
 */
@Controller('recommendations')
@UseGuards(AuthGuard, RolesGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  // ==================== RULES ====================

  /**
   * GET /recommendations/rules
   * Lista todas as regras de recomendação
   */
  @Get('rules')
  @Roles('OWNER', 'MANAGER')
  async listRules(@Request() req: AuthenticatedRequest) {
    return this.recommendationsService.listRules(req.user.salonId);
  }

  /**
   * GET /recommendations/rules/:ruleId
   * Obtém uma regra específica
   */
  @Get('rules/:ruleId')
  @Roles('OWNER', 'MANAGER')
  async getRule(
    @Param('ruleId') ruleId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recommendationsService.getRuleById(req.user.salonId, ruleId);
  }

  /**
   * POST /recommendations/rules
   * Cria uma nova regra de recomendação
   */
  @Post('rules')
  @Roles('OWNER', 'MANAGER')
  async createRule(
    @Body() dto: CreateRecommendationRuleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recommendationsService.createRule(
      req.user.salonId,
      dto,
      req.user.sub,
    );
  }

  /**
   * PUT /recommendations/rules/:ruleId
   * Atualiza uma regra existente
   */
  @Put('rules/:ruleId')
  @Roles('OWNER', 'MANAGER')
  async updateRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateRecommendationRuleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recommendationsService.updateRule(
      req.user.salonId,
      ruleId,
      dto,
    );
  }

  /**
   * DELETE /recommendations/rules/:ruleId
   * Remove uma regra
   */
  @Delete('rules/:ruleId')
  @Roles('OWNER', 'MANAGER')
  async deleteRule(
    @Param('ruleId') ruleId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.recommendationsService.deleteRule(req.user.salonId, ruleId);
    return { message: 'Regra removida com sucesso' };
  }

  // ==================== RECOMMENDATIONS ====================

  /**
   * GET /recommendations/client/:clientId
   * Obtém recomendações para um cliente específico
   */
  @Get('client/:clientId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getRecommendationsForClient(
    @Param('clientId') clientId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recommendationsService.getRecommendationsForClient(
      req.user.salonId,
      clientId,
    );
  }

  // ==================== LOGGING ====================

  /**
   * POST /recommendations/log
   * Registra uma recomendação mostrada
   */
  @Post('log')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async logRecommendation(
    @Body() dto: LogRecommendationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.recommendationsService.logRecommendation(req.user.salonId, dto);
    return { message: 'Recomendação registrada' };
  }

  /**
   * POST /recommendations/log/:logId/accept
   * Marca uma recomendação como aceita
   */
  @Post('log/:logId/accept')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async acceptRecommendation(
    @Param('logId') logId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.recommendationsService.acceptRecommendation(req.user.salonId, logId);
    return { message: 'Recomendação aceita' };
  }

  /**
   * POST /recommendations/log/:logId/reject
   * Marca uma recomendação como rejeitada
   */
  @Post('log/:logId/reject')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async rejectRecommendation(
    @Param('logId') logId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.recommendationsService.rejectRecommendation(req.user.salonId, logId);
    return { message: 'Recomendação rejeitada' };
  }

  // ==================== STATISTICS ====================

  /**
   * GET /recommendations/stats
   * Obtém estatísticas das recomendações
   */
  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(
    @Query('days') days: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recommendationsService.getStats(
      req.user.salonId,
      days ? parseInt(days, 10) : 30,
    );
  }
}

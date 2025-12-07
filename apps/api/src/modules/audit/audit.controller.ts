import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditService, AuditAction } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit/salon/:salonId
   * Lista todos os logs de auditoria de um salão
   */
  @Get('salon/:salonId')
  async findBySalon(@Param('salonId') salonId: string) {
    return this.auditService.findBySalon(salonId);
  }

  /**
   * GET /audit/entity/:entity
   * Lista logs de auditoria por entidade (opcionalmente filtrando por entityId)
   */
  @Get('entity/:entity')
  async findByEntity(
    @Param('entity') entity: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.auditService.findByEntity(entity, entityId);
  }

  /**
   * GET /audit/user/:userId
   * Lista logs de auditoria por usuário
   */
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }

  /**
   * GET /audit/period
   * Lista logs de auditoria por período
   */
  @Get('period')
  async findByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('salonId') salonId?: string,
  ) {
    return this.auditService.findByPeriod(
      new Date(startDate),
      new Date(endDate),
      salonId,
    );
  }

  /**
   * GET /audit/action/:action
   * Lista logs de auditoria por tipo de ação
   */
  @Get('action/:action')
  async findByAction(
    @Param('action') action: AuditAction,
    @Query('salonId') salonId?: string,
  ) {
    return this.auditService.findByAction(action, salonId);
  }

  /**
   * GET /audit/history/:entity/:entityId
   * Busca histórico completo de alterações de um registro específico
   */
  @Get('history/:entity/:entityId')
  async getEntityHistory(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityHistory(entity, entityId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { PayCommissionsDto, PayProfessionalCommissionsDto, ListCommissionsQueryDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('commissions')
@UseGuards(AuthGuard)
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  /**
   * GET /commissions
   * Lista comissoes do salao com filtros
   */
  @Get()
  async findAll(
    @CurrentUser() user: { salonId: string },
    @Query() query: ListCommissionsQueryDto,
  ) {
    return this.commissionsService.findAll(user.salonId, {
      professionalId: query.professionalId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  /**
   * GET /commissions/summary
   * Resumo geral das comissoes
   */
  @Get('summary')
  async getSummary(@CurrentUser() user: { salonId: string }) {
    return this.commissionsService.getSummary(user.salonId);
  }

  /**
   * GET /commissions/by-professional
   * Resumo agrupado por profissional
   */
  @Get('by-professional')
  async getSummaryByProfessional(@CurrentUser() user: { salonId: string }) {
    return this.commissionsService.getSummaryByProfessional(user.salonId);
  }

  /**
   * GET /commissions/:id
   * Detalhes de uma comissao
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: { salonId: string },
    @Param('id') id: string,
  ) {
    return this.commissionsService.findById(user.salonId, id);
  }

  /**
   * POST /commissions/pay
   * Paga comissoes selecionadas
   */
  @Post('pay')
  async payCommissions(
    @CurrentUser() user: { salonId: string; id: string },
    @Body() dto: PayCommissionsDto,
  ) {
    return this.commissionsService.payCommissions(
      user.salonId,
      dto.commissionIds,
      user.id,
    );
  }

  /**
   * POST /commissions/pay-professional
   * Paga todas as comissoes pendentes de um profissional
   */
  @Post('pay-professional')
  async payProfessionalCommissions(
    @CurrentUser() user: { salonId: string; id: string },
    @Body() dto: PayProfessionalCommissionsDto,
  ) {
    return this.commissionsService.payProfessionalCommissions(
      user.salonId,
      dto.professionalId,
      user.id,
      dto.startDate,
      dto.endDate,
    );
  }
}

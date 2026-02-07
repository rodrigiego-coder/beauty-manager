import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

interface CurrentUserPayload {
  id: string;
  salonId: string;
  role: string;
}

@Controller('stock')
@UseGuards(AuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * GET /stock/summary
   * Lista produtos com estoque, filtros e indicador de estoque baixo.
   */
  @Get('summary')
  @Roles('OWNER', 'MANAGER')
  async getSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.stockService.getSummary({
      salonId: user.salonId,
      location: location === 'RETAIL' || location === 'INTERNAL' ? location : undefined,
      search: search || undefined,
      lowStock: lowStock === 'true',
    });
  }

  /**
   * GET /stock/movements
   * Movimentações paginadas com filtros (datas em timezone SP).
   */
  @Get('movements')
  @Roles('OWNER', 'MANAGER')
  async getMovements(
    @CurrentUser() user: CurrentUserPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.stockService.getMovements({
      salonId: user.salonId,
      from: from || undefined,
      to: to || undefined,
      location: location === 'RETAIL' || location === 'INTERNAL' ? location : undefined,
      search: search || undefined,
      productId: productId ? parseInt(productId, 10) : undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service';
import { OpenCashRegisterDto, CloseCashRegisterDto, CashMovementDto } from './dto';
import { Roles } from '../../common/decorators';

@Controller('cash-registers')
export class CashRegistersController {
  constructor(private readonly cashRegistersService: CashRegistersService) {}

  /**
   * GET /cash-registers/current
   * Retorna o caixa aberto atual ou null
   */
  @Get('current')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getCurrent(@Request() req: any) {
    return this.cashRegistersService.getCurrent(req.user.salonId);
  }

  /**
   * POST /cash-registers/open
   * Abre um novo caixa
   */
  @Post('open')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @HttpCode(HttpStatus.CREATED)
  async open(@Request() req: any, @Body() dto: OpenCashRegisterDto) {
    return this.cashRegistersService.open(req.user.salonId, dto, req.user);
  }

  /**
   * POST /cash-registers/close
   * Fecha o caixa atual
   */
  @Post('close')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @HttpCode(HttpStatus.OK)
  async close(@Request() req: any, @Body() dto: CloseCashRegisterDto) {
    return this.cashRegistersService.close(req.user.salonId, dto, req.user);
  }

  /**
   * POST /cash-registers/:id/withdrawal
   * Registra sangria
   */
  @Post(':id/withdrawal')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @HttpCode(HttpStatus.CREATED)
  async withdrawal(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CashMovementDto,
  ) {
    return this.cashRegistersService.withdrawal(id, dto, req.user);
  }

  /**
   * POST /cash-registers/:id/deposit
   * Registra suprimento
   */
  @Post(':id/deposit')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  @HttpCode(HttpStatus.CREATED)
  async deposit(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CashMovementDto,
  ) {
    return this.cashRegistersService.deposit(id, dto, req.user);
  }

  /**
   * GET /cash-registers/:id/movements
   * Lista movimentos de um caixa
   */
  @Get(':id/movements')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getMovements(@Param('id') id: string) {
    return this.cashRegistersService.getMovements(id);
  }

  /**
   * GET /cash-registers/history
   * Histórico de caixas fechados
   */
  @Get('history')
  @Roles('OWNER', 'MANAGER')
  async getHistory(@Request() req: any) {
    return this.cashRegistersService.getHistory(req.user.salonId);
  }

  /**
   * GET /cash-registers/:id
   * Busca caixa por ID
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async findById(@Param('id') id: string) {
    return this.cashRegistersService.findById(id);
  }
}

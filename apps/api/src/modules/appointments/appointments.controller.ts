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
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  RescheduleAppointmentDto,
  CancelAppointmentDto,
  CheckAvailabilityDto,
  CreateBlockDto,
  UpdateBlockDto,
  RejectBlockDto,
  SetWorkingHoursDto,
  UpdateWorkingHourDto,
  AppointmentFiltersDto,
  BlockFiltersDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(AuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ==================== APPOINTMENTS CRUD ====================

  /**
   * GET /appointments - Lista agendamentos com filtros
   */
  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findAll(
    @CurrentUser() user: any,
    @Query() filters: AppointmentFiltersDto,
  ) {
    // Stylists can only see their own appointments
    if (user.role === 'STYLIST') {
      filters.professionalId = user.id;
    }
    return this.appointmentsService.findAll(user.salonId, filters);
  }

  /**
   * GET /appointments/kpis - KPIs de agendamentos
   */
  @Get('kpis')
  @Roles('OWNER', 'MANAGER')
  async getKPIs(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.calculateKPIs(user.salonId, startDate, endDate);
  }

  /**
   * GET /appointments/day/:date - Agenda do dia
   */
  @Get('day/:date')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findByDay(@CurrentUser() user: any, @Param('date') date: string) {
    return this.appointmentsService.findByDay(user.salonId, date);
  }

  /**
   * GET /appointments/week/:startDate - Agenda da semana
   */
  @Get('week/:startDate')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findByWeek(@CurrentUser() user: any, @Param('startDate') startDate: string) {
    return this.appointmentsService.findByWeek(user.salonId, startDate);
  }

  /**
   * GET /appointments/month/:year/:month - Agenda do mês
   */
  @Get('month/:year/:month')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findByMonth(
    @CurrentUser() user: any,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.appointmentsService.findByMonth(user.salonId, year, month);
  }

  /**
   * GET /appointments/professional/:id - Agendamentos de um profissional
   */
  @Get('professional/:id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findByProfessional(
    @CurrentUser() user: any,
    @Param('id') professionalId: string,
    @Query('date') date?: string,
  ) {
    // Stylists can only see their own
    if (user.role === 'STYLIST' && professionalId !== user.id) {
      return this.appointmentsService.findByProfessional(user.id, user.salonId, date);
    }
    return this.appointmentsService.findByProfessional(professionalId, user.salonId, date);
  }

  /**
   * GET /appointments/client/:id - Agendamentos de um cliente
   */
  @Get('client/:id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async findByClient(@CurrentUser() user: any, @Param('id') clientId: string) {
    return this.appointmentsService.findByClient(clientId, user.salonId);
  }

  /**
   * GET /appointments/:id - Detalhes do agendamento
   */
  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    const appointment = await this.appointmentsService.findById(id, user.salonId);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return appointment;
  }

  /**
   * POST /appointments - Criar agendamento
   */
  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async create(@CurrentUser() user: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.salonId, dto as any, user.id);
  }

  /**
   * PATCH /appointments/:id - Atualizar agendamento
   */
  @Patch(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    const result = await this.appointmentsService.update(id, user.salonId, dto as any, user.id);
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  /**
   * DELETE /appointments/:id - Cancelar agendamento
   */
  @Delete(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async cancel(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    const result = await this.appointmentsService.cancel(id, user.salonId, user.id, dto.reason);
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  // ==================== AVAILABILITY ====================

  /**
   * GET /appointments/availability/:professionalId/:date - Horários disponíveis
   */
  @Get('availability/:professionalId/:date')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getAvailableSlots(
    @CurrentUser() user: any,
    @Param('professionalId') professionalId: string,
    @Param('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.appointmentsService.getAvailableSlots(
      professionalId,
      user.salonId,
      date,
      serviceId ? parseInt(serviceId) : undefined,
    );
  }

  /**
   * POST /appointments/check-availability - Verificar disponibilidade
   */
  @Post('check-availability')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async checkAvailability(@CurrentUser() user: any, @Body() dto: CheckAvailabilityDto) {
    return this.appointmentsService.checkAvailability(
      user.salonId,
      dto.professionalId,
      dto.date,
      dto.startTime,
      dto.duration,
    );
  }

  /**
   * GET /appointments/next-available/:serviceId - Próximo horário disponível
   */
  @Get('next-available/:serviceId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async findNextAvailable(
    @CurrentUser() user: any,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.appointmentsService.findNextAvailable(serviceId, user.salonId, professionalId);
  }

  // ==================== STATUS TRANSITIONS ====================

  /**
   * POST /appointments/:id/confirm - Confirmar agendamento
   */
  @Post(':id/confirm')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async confirm(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('via') via?: string,
  ) {
    const result = await this.appointmentsService.confirm(id, user.salonId, via);
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  /**
   * POST /appointments/:id/start - Iniciar atendimento
   */
  @Post(':id/start')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async start(@CurrentUser() user: any, @Param('id') id: string) {
    const result = await this.appointmentsService.start(id, user.salonId);
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  /**
   * POST /appointments/:id/complete - Finalizar atendimento
   */
  @Post(':id/complete')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async complete(@CurrentUser() user: any, @Param('id') id: string) {
    const result = await this.appointmentsService.complete(id, user.salonId);
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  /**
   * POST /appointments/:id/no-show - Marcar como não compareceu
   */
  @Post(':id/no-show')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async noShow(@CurrentUser() user: any, @Param('id') id: string) {
    const result = await this.appointmentsService.noShow(id, user.salonId);
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  /**
   * POST /appointments/:id/reschedule - Reagendar
   */
  @Post(':id/reschedule')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async reschedule(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    const result = await this.appointmentsService.reschedule(
      id,
      user.salonId,
      dto.date,
      dto.time,
      dto.professionalId,
      user.id,
    );
    if (!result) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return result;
  }

  /**
   * POST /appointments/:id/convert-to-command - Converter em comanda
   */
  @Post(':id/convert-to-command')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async convertToCommand(@CurrentUser() user: any, @Param('id') id: string) {
    return this.appointmentsService.convertToCommand(id, user.salonId, user.id);
  }

  // ==================== BLOCKS/FOLGAS ====================

  /**
   * GET /appointments/blocks - Lista bloqueios
   */
  @Get('blocks')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getBlocks(@CurrentUser() user: any, @Query() filters: BlockFiltersDto) {
    // Stylists can only see their own blocks
    if (user.role === 'STYLIST') {
      filters.professionalId = user.id;
    }
    return this.appointmentsService.getBlocks(user.salonId, filters);
  }

  /**
   * GET /appointments/blocks/my - Meus bloqueios (profissional)
   */
  @Get('blocks/my')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getMyBlocks(@CurrentUser() user: any, @Query() filters: BlockFiltersDto) {
    return this.appointmentsService.getBlocks(user.salonId, {
      ...filters,
      professionalId: user.id,
    });
  }

  /**
   * GET /appointments/blocks/:id - Detalhes do bloqueio
   */
  @Get('blocks/:id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getBlockById(@CurrentUser() user: any, @Param('id') id: string) {
    const block = await this.appointmentsService.getBlockById(id, user.salonId);
    if (!block) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
    return block;
  }

  /**
   * POST /appointments/blocks - Criar bloqueio
   */
  @Post('blocks')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async createBlock(@CurrentUser() user: any, @Body() dto: CreateBlockDto) {
    // Stylists can only create blocks for themselves
    if (user.role === 'STYLIST') {
      dto.professionalId = user.id;
      dto.requiresApproval = true;
    }
    return this.appointmentsService.createBlock(user.salonId, dto as any, user.id);
  }

  /**
   * PATCH /appointments/blocks/:id - Atualizar bloqueio
   */
  @Patch('blocks/:id')
  @Roles('OWNER', 'MANAGER')
  async updateBlock(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
  ) {
    const result = await this.appointmentsService.updateBlock(id, user.salonId, dto as any);
    if (!result) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
    return result;
  }

  /**
   * DELETE /appointments/blocks/:id - Remover bloqueio
   */
  @Delete('blocks/:id')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  async deleteBlock(@CurrentUser() user: any, @Param('id') id: string) {
    // Stylists can only delete their own blocks
    if (user.role === 'STYLIST') {
      const block = await this.appointmentsService.getBlockById(id, user.salonId);
      if (block && block.professionalId !== user.id) {
        throw new NotFoundException('Bloqueio não encontrado');
      }
    }
    const result = await this.appointmentsService.deleteBlock(id, user.salonId);
    if (!result) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
    return { success: true };
  }

  /**
   * POST /appointments/blocks/:id/approve - Aprovar bloqueio
   */
  @Post('blocks/:id/approve')
  @Roles('OWNER', 'MANAGER')
  async approveBlock(@CurrentUser() user: any, @Param('id') id: string) {
    const result = await this.appointmentsService.approveBlock(id, user.salonId, user.id);
    if (!result) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
    return result;
  }

  /**
   * POST /appointments/blocks/:id/reject - Rejeitar bloqueio
   */
  @Post('blocks/:id/reject')
  @Roles('OWNER', 'MANAGER')
  async rejectBlock(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RejectBlockDto,
  ) {
    const result = await this.appointmentsService.rejectBlock(id, user.salonId, dto.reason);
    if (!result) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
    return result;
  }

  // ==================== WORKING HOURS ====================

  /**
   * GET /appointments/working-hours/:professionalId - Horários de trabalho
   */
  @Get('working-hours/:professionalId')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST')
  async getWorkingHours(@CurrentUser() user: any, @Param('professionalId') professionalId: string) {
    return this.appointmentsService.getWorkingHours(professionalId, user.salonId);
  }

  /**
   * POST /appointments/working-hours - Definir horários de trabalho
   */
  @Post('working-hours')
  @Roles('OWNER', 'MANAGER')
  async setWorkingHours(@CurrentUser() user: any, @Body() dto: SetWorkingHoursDto) {
    return this.appointmentsService.setWorkingHours(dto.professionalId, user.salonId, dto.hours);
  }

  /**
   * PATCH /appointments/working-hours/:id - Atualizar horário específico
   */
  @Patch('working-hours/:id')
  @Roles('OWNER', 'MANAGER')
  async updateWorkingHour(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateWorkingHourDto,
  ) {
    const result = await this.appointmentsService.updateWorkingHour(id, user.salonId, dto);
    if (!result) {
      throw new NotFoundException('Horário não encontrado');
    }
    return result;
  }
}

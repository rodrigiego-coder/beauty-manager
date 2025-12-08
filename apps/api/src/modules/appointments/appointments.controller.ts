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
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * GET /appointments
   * Lista todos os agendamentos
   */
  @Get()
  async findAll() {
    return this.appointmentsService.findAll();
  }

  /**
   * GET /appointments/kpis
   * Retorna KPIs do negócio
   */
  @Get('kpis')
  async getKPIs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.calculateKPIs(startDate, endDate);
  }

  /**
   * GET /appointments/date/:date
   * Lista agendamentos por data
   */
  @Get('date/:date')
  async findByDate(@Param('date') date: string) {
    return this.appointmentsService.findByDate(date);
  }

  /**
   * GET /appointments/professional/:professionalId
   * Lista agendamentos por profissional
   */
  @Get('professional/:professionalId')
  async findByProfessional(@Param('professionalId') professionalId: string) {
    return this.appointmentsService.findByProfessional(professionalId);
  }

  /**
   * GET /appointments/client/:clientId
   * Lista agendamentos por cliente
   */
  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.appointmentsService.findByClient(clientId);
  }

  /**
   * GET /appointments/:id
   * Busca agendamento por ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findById(id);

    if (!appointment) {
      throw new NotFoundException('Agendamento nao encontrado');
    }

    return appointment;
  }

  /**
   * POST /appointments
   * Cria um novo agendamento (com validação de work_schedule)
   */
  @Post()
  async create(@Body() data: CreateAppointmentDto) {
    return this.appointmentsService.create(data as any);
  }

  /**
   * PATCH /appointments/:id
   * Atualiza um agendamento
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentsService.update(id, data as any);

    if (!appointment) {
      throw new NotFoundException('Agendamento nao encontrado');
    }

    return appointment;
  }

  /**
   * DELETE /appointments/:id
   * Cancela um agendamento
   */
  @Delete(':id')
  async cancel(@Param('id') id: string) {
    const appointment = await this.appointmentsService.cancel(id);

    if (!appointment) {
      throw new NotFoundException('Agendamento nao encontrado');
    }

    return { message: 'Agendamento cancelado com sucesso' };
  }
}
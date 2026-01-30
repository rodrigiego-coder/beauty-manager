import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulesService, SalonScheduleDto, ProfessionalScheduleDto, CreateBlockDto } from './schedules.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // ==================== SALON SCHEDULES ====================

  @Get('salon')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Obter horário de funcionamento do salão' })
  async getSalonSchedule(@CurrentUser() user: JwtPayload) {
    return this.schedulesService.getSalonSchedule(user.salonId);
  }

  @Put('salon/:dayOfWeek')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar horário de um dia específico' })
  async updateSalonSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() data: SalonScheduleDto,
  ) {
    return this.schedulesService.updateSalonSchedule(
      user.salonId,
      parseInt(dayOfWeek, 10),
      data,
    );
  }

  // ==================== PROFESSIONAL SCHEDULES ====================

  @Get('professional/:id')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Obter horário de trabalho do profissional' })
  async getProfessionalSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('id') professionalId: string,
  ) {
    // STYLIST só pode ver próprio horário
    if (user.role === 'STYLIST' && user.sub !== professionalId) {
      professionalId = user.sub;
    }
    return this.schedulesService.getProfessionalSchedule(professionalId);
  }

  @Get('my-schedule')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Obter meu horário de trabalho' })
  async getMySchedule(@CurrentUser() user: JwtPayload) {
    const schedule = await this.schedulesService.getProfessionalSchedule(user.sub);

    // Se não tem horário, inicializar com padrão do salão
    if (schedule.length === 0) {
      await this.schedulesService.initializeProfessionalSchedule(user.sub, user.salonId);
      return this.schedulesService.getProfessionalSchedule(user.sub);
    }

    return schedule;
  }

  @Put('professional/:id/:dayOfWeek')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Atualizar horário de trabalho do profissional' })
  async updateProfessionalSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('id') professionalId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() data: ProfessionalScheduleDto,
  ) {
    // STYLIST só pode editar próprio horário
    if (user.role === 'STYLIST' && user.sub !== professionalId) {
      professionalId = user.sub;
    }
    return this.schedulesService.updateProfessionalSchedule(
      professionalId,
      parseInt(dayOfWeek, 10),
      data,
    );
  }

  // ==================== PROFESSIONAL BLOCKS ====================

  @Get('professional/:id/blocks')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Listar bloqueios do profissional' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getProfessionalBlocks(
    @CurrentUser() user: JwtPayload,
    @Param('id') professionalId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // STYLIST só pode ver próprios bloqueios
    if (user.role === 'STYLIST' && user.sub !== professionalId) {
      professionalId = user.sub;
    }
    return this.schedulesService.getProfessionalBlocks(professionalId, startDate, endDate);
  }

  @Get('my-blocks')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @ApiOperation({ summary: 'Listar meus bloqueios' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getMyBlocks(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.schedulesService.getProfessionalBlocks(user.sub, startDate, endDate);
  }

  @Post('professional/:id/blocks')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar bloqueio para o profissional' })
  async createProfessionalBlock(
    @CurrentUser() user: JwtPayload,
    @Param('id') professionalId: string,
    @Body() data: CreateBlockDto,
  ) {
    // STYLIST só pode criar bloqueio para si mesmo
    if (user.role === 'STYLIST' && user.sub !== professionalId) {
      professionalId = user.sub;
    }
    return this.schedulesService.createProfessionalBlock(
      professionalId,
      user.salonId,
      user.sub,
      data,
    );
  }

  @Delete('blocks/:blockId')
  @Roles('OWNER', 'MANAGER', 'STYLIST')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover bloqueio' })
  async deleteProfessionalBlock(@Param('blockId') blockId: string) {
    await this.schedulesService.deleteProfessionalBlock(blockId);
  }

  // ==================== AVAILABILITY CHECK ====================

  @Get('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidade para agendamento' })
  @ApiQuery({ name: 'salonId', required: true })
  @ApiQuery({ name: 'professionalId', required: true })
  @ApiQuery({ name: 'date', required: true, description: 'Formato: YYYY-MM-DD' })
  @ApiQuery({ name: 'startTime', required: true, description: 'Formato: HH:MM' })
  @ApiQuery({ name: 'durationMinutes', required: true })
  async checkAvailability(
    @Query('salonId') salonId: string,
    @Query('professionalId') professionalId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('durationMinutes') durationMinutes: string,
  ) {
    return this.schedulesService.checkAvailability(
      salonId,
      professionalId,
      date,
      startTime,
      parseInt(durationMinutes, 10),
    );
  }
}

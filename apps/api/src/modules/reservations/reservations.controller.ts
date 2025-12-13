import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto, UpdateReservationStatusDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reservations')
@UseGuards(AuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getReservations(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('deliveryType') deliveryType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reservationsService.getReservations(req.user.salonId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      clientId,
      deliveryType,
      startDate,
      endDate,
    });
  }

  @Get('stats')
  @Roles('OWNER', 'MANAGER')
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reservationsService.getStats(req.user.salonId, startDate, endDate);
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async getReservation(@Request() req: any, @Param('id') id: string) {
    return this.reservationsService.getReservationById(req.user.salonId, id);
  }

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async createReservation(@Request() req: any, @Body() dto: CreateReservationDto) {
    return this.reservationsService.createReservation(req.user.salonId, dto);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  async updateReservation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.updateReservation(req.user.salonId, id, dto);
  }

  @Patch(':id/status')
  @Roles('OWNER', 'MANAGER', 'RECEPTIONIST')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(req.user.salonId, id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  async deleteReservation(@Request() req: any, @Param('id') id: string) {
    await this.reservationsService.deleteReservation(req.user.salonId, id);
    return { success: true };
  }
}

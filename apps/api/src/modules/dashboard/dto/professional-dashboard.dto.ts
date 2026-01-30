import { ApiProperty } from '@nestjs/swagger';

export class ProfessionalAppointmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clientName!: string;

  @ApiProperty()
  serviceName!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  time!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  price!: number;
}

export class ProfessionalPerformanceDto {
  @ApiProperty()
  totalAppointments!: number;

  @ApiProperty()
  completedAppointments!: number;

  @ApiProperty()
  cancelledAppointments!: number;

  @ApiProperty()
  noShowAppointments!: number;

  @ApiProperty()
  completionRate!: number;
}

export class ProfessionalDashboardDto {
  @ApiProperty({ description: 'Agendamentos de hoje' })
  todayAppointments!: number;

  @ApiProperty({ description: 'Agendamentos da semana' })
  weekAppointments!: number;

  @ApiProperty({ description: 'Faturamento do mês (apenas serviços do profissional)' })
  monthRevenue!: number;

  @ApiProperty({ description: 'Comissão pendente do mês' })
  pendingCommission!: number;

  @ApiProperty({ description: 'Taxa de comissão do profissional' })
  commissionRate!: number;

  @ApiProperty({ description: 'Próximos agendamentos', type: [ProfessionalAppointmentDto] })
  upcomingAppointments!: ProfessionalAppointmentDto[];

  @ApiProperty({ description: 'Desempenho do mês', type: ProfessionalPerformanceDto })
  performance!: ProfessionalPerformanceDto;

  @ApiProperty({ description: 'Nome do profissional' })
  professionalName!: string;
}

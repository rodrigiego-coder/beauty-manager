import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, appointments, Appointment, NewAppointment } from '../../database';
import { UsersService } from '../users';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private usersService: UsersService,
  ) {}

  /**
   * Lista todos os agendamentos
   */
  async findAll(): Promise<Appointment[]> {
    return this.db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.date), desc(appointments.time));
  }

  /**
   * Busca agendamento por ID
   */
  async findById(id: string): Promise<Appointment | null> {
    const result = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Cria um novo agendamento com validação de work_schedule
   */
  async create(data: NewAppointment): Promise<Appointment> {
    // Valida work_schedule do profissional se especificado
    if (data.professionalId) {
      const professional = await this.usersService.findById(data.professionalId);

      if (!professional) {
        throw new BadRequestException('Profissional nao encontrado');
      }

      if (!professional.active) {
        throw new BadRequestException('Profissional esta inativo');
      }

      const scheduleCheck = this.usersService.isWithinWorkSchedule(
        professional,
        data.date,
        data.time,
      );

      if (!scheduleCheck.valid) {
        throw new BadRequestException(scheduleCheck.message);
      }

      // Verifica conflito de horário para o profissional
      const hasConflict = await this.checkConflict(
        data.date,
        data.time,
        data.duration,
        data.professionalId,
      );

      if (hasConflict) {
        throw new BadRequestException('Profissional ja tem agendamento neste horario');
      }
    }

    const result = await this.db
      .insert(appointments)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Verifica conflito de horário
   */
  private async checkConflict(
    date: string,
    time: string,
    duration: number,
    professionalId: string,
  ): Promise<boolean> {
    const existingAppointments = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.date, date),
          eq(appointments.professionalId, professionalId),
          eq(appointments.status, 'confirmed'),
        ),
      );

    const [newHour, newMin] = time.split(':').map(Number);
    const newStart = newHour * 60 + newMin;
    const newEnd = newStart + duration;

    for (const apt of existingAppointments) {
      const [aptHour, aptMin] = apt.time.split(':').map(Number);
      const aptStart = aptHour * 60 + aptMin;
      const aptEnd = aptStart + apt.duration;

      // Verifica sobreposição
      if (newStart < aptEnd && newEnd > aptStart) {
        return true;
      }
    }

    return false;
  }

  /**
   * Atualiza um agendamento
   */
  async update(id: string, data: Partial<NewAppointment>): Promise<Appointment | null> {
    // Se está mudando horário/profissional, valida novamente
    if (data.professionalId || data.date || data.time) {
      const existing = await this.findById(id);
      if (!existing) return null;

      const professionalId = data.professionalId || existing.professionalId;
      const date = data.date || existing.date;
      const time = data.time || existing.time;

      if (professionalId) {
        const professional = await this.usersService.findById(professionalId);

        if (professional) {
          const scheduleCheck = this.usersService.isWithinWorkSchedule(
            professional,
            date,
            time,
          );

          if (!scheduleCheck.valid) {
            throw new BadRequestException(scheduleCheck.message);
          }
        }
      }
    }

    const result = await this.db
      .update(appointments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Cancela um agendamento
   */
  async cancel(id: string): Promise<Appointment | null> {
    return this.update(id, { status: 'cancelled' });
  }

  /**
   * Lista agendamentos por data
   */
  async findByDate(date: string): Promise<Appointment[]> {
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.date, date))
      .orderBy(appointments.time);
  }

  /**
   * Lista agendamentos por profissional
   */
  async findByProfessional(professionalId: string): Promise<Appointment[]> {
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.professionalId, professionalId))
      .orderBy(desc(appointments.date), desc(appointments.time));
  }

  /**
   * Lista agendamentos por cliente
   */
  async findByClient(clientId: string): Promise<Appointment[]> {
    return this.db
      .select()
      .from(appointments)
      .where(eq(appointments.clientId, clientId))
      .orderBy(desc(appointments.date), desc(appointments.time));
  }

  /**
   * Calcula KPIs do negócio
   */
  async calculateKPIs(startDate?: string, endDate?: string): Promise<{
    ticketMedio: number;
    taxaRetorno: number;
    totalFaturamento: number;
    totalClientes: number;
    clientesRecorrentes: number;
    top3Servicos: { service: string; count: number; revenue: number }[];
  }> {
    // Busca todos os agendamentos confirmados/concluídos
    let allAppointments = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.status, 'confirmed'));

    // Filtra por período se especificado
    if (startDate && endDate) {
      allAppointments = allAppointments.filter(
        apt => apt.date >= startDate && apt.date <= endDate
      );
    }

    // Total de faturamento (em centavos -> reais)
    const totalFaturamento = allAppointments.reduce((sum, apt) => sum + apt.price, 0) / 100;

    // Clientes únicos
    const uniqueClients = new Set(allAppointments.map(apt => apt.clientId));
    const totalClientes = uniqueClients.size;

    // Ticket Médio
    const ticketMedio = totalClientes > 0 ? totalFaturamento / totalClientes : 0;

    // Clientes recorrentes (mais de 1 agendamento)
    const clientAppointmentCount: { [key: string]: number } = {};
    allAppointments.forEach(apt => {
      clientAppointmentCount[apt.clientId] = (clientAppointmentCount[apt.clientId] || 0) + 1;
    });
    const clientesRecorrentes = Object.values(clientAppointmentCount).filter(count => count > 1).length;

    // Taxa de Retorno
    const taxaRetorno = totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0;

    // Top 3 Serviços
    const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
    allAppointments.forEach(apt => {
      if (!serviceStats[apt.service]) {
        serviceStats[apt.service] = { count: 0, revenue: 0 };
      }
      serviceStats[apt.service].count++;
      serviceStats[apt.service].revenue += apt.price / 100;
    });

    const top3Servicos = Object.entries(serviceStats)
      .map(([service, stats]) => ({
        service,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    return {
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      taxaRetorno: Math.round(taxaRetorno * 100) / 100,
      totalFaturamento: Math.round(totalFaturamento * 100) / 100,
      totalClientes,
      clientesRecorrentes,
      top3Servicos,
    };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, users, User, NewUser, WorkSchedule } from '../../database';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os usuários ativos
   */
  async findAll(): Promise<User[]> {
    return this.db
      .select()
      .from(users)
      .where(eq(users.active, true));
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Busca profissionais ativos
   */
  async findProfessionals(): Promise<User[]> {
    const allUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.active, true));

    return allUsers.filter(u => u.role === 'STYLIST');
  }

  /**
   * Cria um novo usuário
   */
  async create(data: NewUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: Partial<NewUser>): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Desativa um usuário (soft delete)
   */
  async deactivate(id: string): Promise<User | null> {
    return this.update(id, { active: false });
  }

  /**
   * Atualiza o work_schedule de um profissional
   */
  async updateWorkSchedule(id: string, schedule: WorkSchedule): Promise<User | null> {
    return this.update(id, { workSchedule: schedule });
  }

  /**
   * Verifica se um horário está dentro do work_schedule do profissional
   */
  isWithinWorkSchedule(user: User, date: string, time: string): { valid: boolean; message?: string } {
    if (!user.workSchedule) {
      return { valid: true }; // Se não tem schedule definido, aceita qualquer horário
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayMap: { [key: number]: string } = {
      0: 'dom',
      1: 'seg',
      2: 'ter',
      3: 'qua',
      4: 'qui',
      5: 'sex',
      6: 'sab',
    };

    const dayKey = dayMap[dayOfWeek];
    const schedule = user.workSchedule[dayKey];

    if (!schedule) {
      return {
        valid: false,
        message: `Profissional não trabalha neste dia (${dayKey})`,
      };
    }

    // Parse do horário de trabalho (ex: "09:00-18:00")
    const [startTime, endTime] = schedule.split('-');
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const [appointmentHour, appointmentMin] = time.split(':').map(Number);

    const appointmentMinutes = appointmentHour * 60 + appointmentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (appointmentMinutes < startMinutes || appointmentMinutes >= endMinutes) {
      return {
        valid: false,
        message: `Horário fora do expediente do profissional (${schedule})`,
      };
    }

    return { valid: true };
  }

  /**
   * Calcula comissão de um profissional
   */
  calculateCommission(user: User, totalValue: number): number {
    const rate = user.commissionRate ? parseFloat(user.commissionRate) : 0.5;
    return totalValue * rate;
  }
}

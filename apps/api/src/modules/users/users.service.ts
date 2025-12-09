import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, users, User, NewUser, WorkSchedule } from '../../database';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
  ) {}

  /**
   * Lista todos os usuarios ativos
   */
  async findAll(): Promise<User[]> {
    return this.db
      .select()
      .from(users)
      .where(eq(users.active, true));
  }

  /**
   * Busca usuario por ID
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
   * Busca usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
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
   * Cria um novo usuario
   */
  async create(data: NewUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Atualiza um usuario
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
   * Atualiza o perfil do usuario logado
   */
  async updateProfile(
    id: string,
    data: { name?: string; email?: string; phone?: string },
  ): Promise<User | null> {
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Este email ja esta em uso');
      }
    }

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
   * Altera a senha do usuario
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Usuario sem senha configurada');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return { success: true, message: 'Senha alterada com sucesso' };
  }

  /**
   * Desativa um usuario (soft delete)
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
   * Verifica se um horario esta dentro do work_schedule do profissional
   */
  isWithinWorkSchedule(user: User, date: string, time: string): { valid: boolean; message?: string } {
    if (!user.workSchedule) {
      return { valid: true };
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
        message: `Profissional nao trabalha neste dia (${dayKey})`,
      };
    }

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
        message: `Horario fora do expediente do profissional (${schedule})`,
      };
    }

    return { valid: true };
  }

  /**
   * Calcula comissao de um profissional
   */
  calculateCommission(user: User, totalValue: number): number {
    const rate = user.commissionRate ? parseFloat(user.commissionRate) : 0.5;
    return totalValue * rate;
  }
}
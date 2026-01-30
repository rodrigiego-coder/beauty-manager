import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { Database, users, User, NewUser, WorkSchedule } from '../../database';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
import { SalonsService } from '../salons/salons.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: Database,
    private configService: ConfigService,
    private whatsappService: WhatsAppService,
    private salonsService: SalonsService,
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
  async create(data: NewUser & { password?: string }): Promise<User> {
    // Se veio password, faz hash
    let passwordHash: string | undefined;
    if ((data as any).password) {
      passwordHash = await bcrypt.hash((data as any).password, 10);
    }

    // Remove password do data e adiciona passwordHash
    const { password, ...userData } = data as any;

    const result = await this.db
      .insert(users)
      .values({
        ...userData,
        passwordHash: passwordHash || userData.passwordHash,
      })
      .returning();

    return result[0];
  }

  /**
   * Atualiza um usuario
   */
  async update(id: string, data: Partial<NewUser> & { password?: string }): Promise<User | null> {
    // Se veio password, faz hash
    let updateData: any = { ...data };
    
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const result = await this.db
      .update(users)
      .set({
        ...updateData,
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

  /**
   * Busca usuario por token de reset de senha
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Gera token de criação de senha e envia link via WhatsApp
   * Token expira em 48 horas
   */
  async sendPasswordCreationLink(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.findById(userId);

    if (!user) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    if (!user.phone) {
      throw new BadRequestException('Usuario nao possui telefone cadastrado');
    }

    if (!user.salonId) {
      throw new BadRequestException('Usuario nao possui salao vinculado');
    }

    // Busca nome do salão
    const salon = await this.salonsService.findById(user.salonId);
    if (!salon) {
      throw new BadRequestException('Salao nao encontrado');
    }

    // Gera token único (32 bytes = 64 caracteres hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas

    // Salva token no usuário
    await this.db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Monta link
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://app.beautymanager.com.br';
    const link = `${frontendUrl}/criar-senha?token=${token}`;

    // Monta mensagem
    const message = `Ola, ${user.name}!

Voce foi adicionado a equipe do *${salon.name}*!

Crie sua senha para acessar o sistema:
${link}

Link valido por 48 horas.`;

    // Envia via WhatsApp
    try {
      await this.whatsappService.sendMessage(user.salonId, user.phone, message);
      return { success: true, message: 'Link de criacao de senha enviado com sucesso' };
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      // Não falha se WhatsApp der erro, apenas loga
      return { success: true, message: 'Usuario criado. Link disponivel mas falha no envio WhatsApp.' };
    }
  }

  /**
   * Limpa o token de reset de senha após uso
   */
  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
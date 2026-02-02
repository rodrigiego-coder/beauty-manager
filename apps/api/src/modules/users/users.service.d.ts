import { ConfigService } from '@nestjs/config';
import { Database, User, NewUser, WorkSchedule } from '../../database';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
import { SalonsService } from '../salons/salons.service';
export declare class UsersService {
    private db;
    private configService;
    private whatsappService;
    private salonsService;
    constructor(db: Database, configService: ConfigService, whatsappService: WhatsAppService, salonsService: SalonsService);
    /**
     * Lista usuarios do salão
     */
    findAll(salonId?: string, includeInactive?: boolean): Promise<User[]>;
    /**
     * Busca usuario por ID
     */
    findById(id: string): Promise<User | null>;
    /**
     * Busca usuario por email
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * Busca profissionais ativos do salão
     */
    findProfessionals(salonId?: string): Promise<User[]>;
    /**
     * Cria um novo usuario
     */
    create(data: NewUser & {
        password?: string;
    }): Promise<User>;
    /**
     * Atualiza um usuario
     */
    update(id: string, data: Partial<NewUser> & {
        password?: string;
    }): Promise<User | null>;
    /**
     * Atualiza o perfil do usuario logado
     */
    updateProfile(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<User | null>;
    /**
     * Altera a senha do usuario
     */
    changePassword(id: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Desativa um usuario (soft delete)
     */
    deactivate(id: string): Promise<User | null>;
    /**
     * Atualiza o work_schedule de um profissional
     */
    updateWorkSchedule(id: string, schedule: WorkSchedule): Promise<User | null>;
    /**
     * Verifica se um horario esta dentro do work_schedule do profissional
     */
    isWithinWorkSchedule(user: User, date: string, time: string): {
        valid: boolean;
        message?: string;
    };
    /**
     * Calcula comissao de um profissional
     */
    calculateCommission(user: User, totalValue: number): number;
    /**
     * Busca usuario por token de reset de senha
     */
    findByPasswordResetToken(token: string): Promise<User | null>;
    /**
     * Gera token de criação de senha e envia link via WhatsApp
     * Token expira em 48 horas
     */
    sendPasswordCreationLink(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Limpa o token de reset de senha após uso
     */
    clearPasswordResetToken(userId: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map
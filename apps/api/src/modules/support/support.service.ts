import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { eq, and, gt, lt, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../../database/database.module';
import { supportSessions, salons, users, auditLogs } from '../../database/schema';
import {
  SupportTokenPayload,
  CreateSessionResponse,
  ConsumeTokenResponse,
} from './dto';

@Injectable()
export class SupportService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private jwtService: JwtService,
  ) {}

  /**
   * Cria uma sessão de suporte delegado (SUPER_ADMIN only)
   * Gera um token único que pode ser consumido uma única vez
   */
  async createSession(
    adminUserId: string,
    targetSalonId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<CreateSessionResponse> {
    // Valida que o salão existe
    const [salon] = await this.db
      .select()
      .from(salons)
      .where(eq(salons.id, targetSalonId))
      .limit(1);

    if (!salon) {
      throw new NotFoundException('Salão não encontrado');
    }

    // Gera token único de 64 caracteres (32 bytes em hex)
    const token = randomBytes(32).toString('hex');

    // TTL de 15 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Cria a sessão
    const [session] = await this.db
      .insert(supportSessions)
      .values({
        adminUserId,
        targetSalonId,
        token,
        reason,
        status: 'PENDING',
        expiresAt,
        ipAddress,
        userAgent,
      })
      .returning();

    // Registra no audit log
    await this.db.insert(auditLogs).values({
      userId: adminUserId,
      salonId: targetSalonId,
      action: 'CREATE',
      entity: 'support_sessions',
      entityId: session.id,
      newValues: {
        targetSalonId,
        reason,
        expiresAt: expiresAt.toISOString(),
      },
      ipAddress,
      userAgent,
    });

    return {
      sessionId: session.id,
      token,
      expiresAt,
      salonName: salon.name,
      salonId: salon.id,
    };
  }

  /**
   * Consome o token de suporte e retorna um JWT com actingAsSalonId
   */
  async consumeToken(
    token: string,
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ConsumeTokenResponse> {
    // Busca a sessão pelo token
    const [session] = await this.db
      .select()
      .from(supportSessions)
      .where(
        and(
          eq(supportSessions.token, token),
          eq(supportSessions.status, 'PENDING'),
          gt(supportSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!session) {
      throw new BadRequestException('Token inválido, expirado ou já utilizado');
    }

    // Verifica que é o mesmo admin que criou
    if (session.adminUserId !== adminUserId) {
      throw new ForbiddenException('Este token pertence a outro administrador');
    }

    // Busca dados do admin
    const [admin] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, adminUserId))
      .limit(1);

    if (!admin) {
      throw new NotFoundException('Usuário administrador não encontrado');
    }

    // Busca dados do salão
    const [salon] = await this.db
      .select()
      .from(salons)
      .where(eq(salons.id, session.targetSalonId))
      .limit(1);

    // Marca como consumido
    await this.db
      .update(supportSessions)
      .set({
        status: 'CONSUMED',
        consumedAt: new Date(),
      })
      .where(eq(supportSessions.id, session.id));

    // Gera JWT com actingAsSalonId
    const payload: SupportTokenPayload = {
      sub: adminUserId,
      id: adminUserId,
      email: admin.email!,
      role: 'SUPER_ADMIN',
      salonId: null,
      actingAsSalonId: session.targetSalonId,
      supportSessionId: session.id,
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
      expiresIn: '15m', // Mesmo TTL da sessão
    });

    // Registra consumo no audit log
    await this.db.insert(auditLogs).values({
      userId: adminUserId,
      salonId: session.targetSalonId,
      action: 'UPDATE',
      entity: 'support_sessions',
      entityId: session.id,
      oldValues: { status: 'PENDING' },
      newValues: { status: 'CONSUMED', consumedAt: new Date().toISOString() },
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      expiresIn: 15 * 60, // 15 minutos em segundos
      salonId: session.targetSalonId,
      salonName: salon?.name || 'Salão',
    };
  }

  /**
   * Lista sessões de suporte (para auditoria)
   */
  async listSessions(filters?: {
    adminUserId?: string;
    status?: string;
    limit?: number;
  }) {
    const conditions = [];

    if (filters?.adminUserId) {
      conditions.push(eq(supportSessions.adminUserId, filters.adminUserId));
    }

    if (filters?.status) {
      conditions.push(eq(supportSessions.status, filters.status));
    }

    const sessions = await this.db
      .select({
        session: supportSessions,
        salon: salons,
        admin: users,
      })
      .from(supportSessions)
      .leftJoin(salons, eq(supportSessions.targetSalonId, salons.id))
      .leftJoin(users, eq(supportSessions.adminUserId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(supportSessions.createdAt))
      .limit(filters?.limit || 50);

    return sessions.map((s) => ({
      id: s.session.id,
      adminUserId: s.session.adminUserId,
      adminName: s.admin?.name || 'Desconhecido',
      adminEmail: s.admin?.email || 'Desconhecido',
      targetSalonId: s.session.targetSalonId,
      salonName: s.salon?.name || 'Salão removido',
      reason: s.session.reason,
      status: s.session.status,
      expiresAt: s.session.expiresAt,
      consumedAt: s.session.consumedAt,
      ipAddress: s.session.ipAddress,
      createdAt: s.session.createdAt,
    }));
  }

  /**
   * Revoga uma sessão pendente
   */
  async revokeSession(
    sessionId: string,
    adminUserId: string,
    ipAddress?: string,
  ): Promise<void> {
    const [session] = await this.db
      .select()
      .from(supportSessions)
      .where(
        and(
          eq(supportSessions.id, sessionId),
          eq(supportSessions.status, 'PENDING'),
        ),
      )
      .limit(1);

    if (!session) {
      throw new NotFoundException('Sessão não encontrada ou já não está pendente');
    }

    // Apenas o admin que criou ou outro SUPER_ADMIN pode revogar
    await this.db
      .update(supportSessions)
      .set({ status: 'REVOKED' })
      .where(eq(supportSessions.id, sessionId));

    // Registra revogação no audit log
    await this.db.insert(auditLogs).values({
      userId: adminUserId,
      salonId: session.targetSalonId,
      action: 'UPDATE',
      entity: 'support_sessions',
      entityId: sessionId,
      oldValues: { status: 'PENDING' },
      newValues: { status: 'REVOKED' },
      ipAddress,
    });
  }

  /**
   * Expira sessões antigas automaticamente (pode ser chamado por um cron job)
   */
  async expireOldSessions(): Promise<number> {
    const result = await this.db
      .update(supportSessions)
      .set({ status: 'EXPIRED' })
      .where(
        and(
          eq(supportSessions.status, 'PENDING'),
          lt(supportSessions.expiresAt, new Date()),
        ),
      )
      .returning();

    return result.length;
  }
}

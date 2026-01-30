import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt.strategy';
import * as schema from '../../database/schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Realiza o login com validação real no banco de dados
   */
  async login(email: string, password: string) {
    // Busca o usuário pelo email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuário desativado');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Usuário sem senha configurada');
    }

    // Valida a senha com bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Gera os tokens JWT
    const tokens = await this.generateTokens(user.id, user.email!, user.role, user.salonId!);

    // Remove a senha do retorno
    const { passwordHash, ...userData } = user;

    return {
      user: userData,
      ...tokens,
      message: 'Login realizado com sucesso',
    };
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      // Verifica se o token está na blacklist
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token foi invalidado (logout realizado)');
      }

      // Verifica se o usuário ainda existe e está ativo
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.active) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      // Gera novos tokens
      const tokens = await this.generateTokens(user.id, user.email!, user.role, user.salonId!);

      return {
        ...tokens,
        message: 'Token renovado com sucesso',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  /**
   * Realiza o logout invalidando o refresh token
   */
  async logout(refreshToken: string, userId: string) {
    try {
      // Verifica se o token é válido antes de invalidar
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
      });

      // Calcula quando o token expira
      const expiresAt = new Date(payload.exp! * 1000);

      // Adiciona o token na blacklist
      await this.db.insert(schema.refreshTokenBlacklist).values({
        token: refreshToken,
        userId: userId,
        expiresAt: expiresAt,
      });

      return {
        message: 'Logout realizado com sucesso',
      };
    } catch (error) {
      // Mesmo se o token for inválido, consideramos logout bem-sucedido
      return {
        message: 'Logout realizado com sucesso',
      };
    }
  }

  /**
   * Cria senha usando token recebido via WhatsApp
   * Valida token, verifica expiração e define a senha
   */
  async createPassword(token: string, password: string) {
    // Busca usuário pelo token
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Token invalido ou ja utilizado');
    }

    // Verifica se token expirou
    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      throw new BadRequestException('Token expirado. Solicite um novo link ao administrador.');
    }

    // Verifica se usuário está ativo
    if (!user.active) {
      throw new BadRequestException('Usuario desativado');
    }

    // Define a senha
    const passwordHash = await bcrypt.hash(password, 10);

    await this.db
      .update(schema.users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    // Limpa o token após uso
    await this.usersService.clearPasswordResetToken(user.id);

    // Gera tokens para login automático
    const tokens = await this.generateTokens(user.id, user.email!, user.role, user.salonId!);

    // Remove a senha do retorno
    const { passwordHash: _, passwordResetToken: __, passwordResetExpires: ___, ...userData } = user;

    return {
      user: userData,
      ...tokens,
      message: 'Senha criada com sucesso',
    };
  }

  /**
   * Valida se um token de criação de senha é válido (sem criar a senha)
   */
  async validatePasswordToken(token: string): Promise<{ valid: boolean; userName?: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      return { valid: false };
    }

    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      return { valid: false };
    }

    if (!user.active) {
      return { valid: false };
    }

    return { valid: true, userName: user.name };
  }

  /**
   * Verifica se um token está na blacklist
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(schema.refreshTokenBlacklist)
      .where(eq(schema.refreshTokenBlacklist.token, token))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Gera access token e refresh token
   */
  private async generateTokens(userId: string, email: string, role: string, salonId: string) {
    const accessPayload: JwtPayload = {
      sub: userId,
      id: userId,
      email,
      role,
      salonId,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      id: userId,
      email,
      role,
      salonId,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
        expiresIn: '30m', // Access token: 30 minutos
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
        expiresIn: '7d', // Refresh token: 7 dias
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 30 * 60, // 30 minutos em segundos
    };
  }
}
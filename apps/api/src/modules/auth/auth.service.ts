import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  /**
   * Gera access token e refresh token
   */
  private async generateTokens(userId: string, email: string, role: string, salonId: string) {
    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      salonId,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
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
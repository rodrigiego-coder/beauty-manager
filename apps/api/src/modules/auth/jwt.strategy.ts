import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: string;
  salonId: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
    });
  }

  async validate(payload: JwtPayload) {
    // Verifica se é um access token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token inválido');
    }

    // Busca o usuário para garantir que ainda existe e está ativo
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    // Retorna os dados que serão adicionados ao request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      salonId: payload.salonId,
    };
  }
}
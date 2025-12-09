import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  id: string;
  email: string;
  role: string;
  salonId: string;
  type: 'access' | 'refresh';
  exp?: number;
  iat?: number;
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
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token invalido');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.active) {
      throw new UnauthorizedException('Usuario nao encontrado ou inativo');
    }

    return {
      sub: payload.sub,
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      salonId: payload.salonId,
    };
  }
}
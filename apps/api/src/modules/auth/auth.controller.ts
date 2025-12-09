import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginDto, RefreshTokenDto, LogoutDto } from './dto';
import { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Realiza o login do usuario
   * Rota publica - nao requer autenticacao
   * 
   * RATE LIMIT: 5 tentativas por minuto
   * Protege contra ataques de forca bruta
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * POST /auth/refresh
   * Renova o access token usando o refresh token
   * Rota publica - nao requer autenticacao (usa o refresh token)
   * 
   * RATE LIMIT: 10 por minuto
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Invalida o refresh token (adiciona na blacklist)
   * Requer autenticacao - precisa estar logado
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto, @CurrentUser() user: JwtPayload) {
    return this.authService.logout(logoutDto.refreshToken, user.sub);
  }
}
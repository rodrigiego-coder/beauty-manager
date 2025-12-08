import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
   * Realiza o login do usuário
   * Rota pública - não requer autenticação
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * POST /auth/refresh
   * Renova o access token usando o refresh token
   * Rota pública - não requer autenticação (usa o refresh token)
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Invalida o refresh token (adiciona na blacklist)
   * Requer autenticação - precisa estar logado
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto, @CurrentUser() user: JwtPayload) {
    return this.authService.logout(logoutDto.refreshToken, user.sub);
  }
}
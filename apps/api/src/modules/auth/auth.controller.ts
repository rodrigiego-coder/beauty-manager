import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginDto, RefreshTokenDto, LogoutDto, CreatePasswordDto, SignupDto } from './dto';
import { JwtPayload } from './jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * Cadastro publico de novo salao + usuario OWNER
   * Rota publica - nao requer autenticacao
   *
   * RATE LIMIT: 3 por minuto (protege contra spam)
   */
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Cadastro público de novo salão' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

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
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
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
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiBody({ type: RefreshTokenDto })
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
  @ApiOperation({ summary: 'Logout (invalidar refresh token)' })
  @ApiBody({ type: LogoutDto })
  async logout(@Body() logoutDto: LogoutDto, @CurrentUser() user: JwtPayload) {
    return this.authService.logout(logoutDto.refreshToken, user.sub);
  }

  /**
   * POST /auth/create-password
   * Cria senha usando token recebido via WhatsApp
   * Rota publica - nao requer autenticacao
   *
   * RATE LIMIT: 5 tentativas por minuto
   * Protege contra ataques de forca bruta
   */
  @Public()
  @Post('create-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Criar senha via token (primeiro acesso)' })
  @ApiBody({ type: CreatePasswordDto })
  async createPassword(@Body() dto: CreatePasswordDto) {
    return this.authService.createPassword(dto.token, dto.password);
  }

  /**
   * GET /auth/validate-token
   * Valida se um token de criacao de senha eh valido
   * Rota publica - nao requer autenticacao
   *
   * RATE LIMIT: 10 por minuto
   */
  @Public()
  @Get('validate-token')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Validar token de criacao de senha' })
  @ApiQuery({ name: 'token', description: 'Token de criacao de senha' })
  async validateToken(@Query('token') token: string) {
    return this.authService.validatePasswordToken(token);
  }
}
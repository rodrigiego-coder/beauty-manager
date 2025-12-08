import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  // Mock de resposta de login
  const mockLoginResponse = {
    user: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'owner@salao.com',
      name: 'Owner Demo',
      role: 'OWNER',
      salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      active: true,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 1800,
    message: 'Login realizado com sucesso',
  };

  // Mock de resposta de refresh
  const mockRefreshResponse = {
    accessToken: 'new-mock-access-token',
    refreshToken: 'new-mock-refresh-token',
    expiresIn: 1800,
    message: 'Token renovado com sucesso',
  };

  // Mock do AuthService
  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  // ========================================
  // TESTES BÁSICOS
  // ========================================
  describe('controller', () => {
    it('deve estar definido', () => {
      expect(controller).toBeDefined();
    });
  });

  // ========================================
  // TESTES DA ROTA POST /auth/login
  // ========================================
  describe('POST /auth/login', () => {
    it('deve retornar tokens quando credenciais são válidas', async () => {
      // Arrange
      const loginDto = { email: 'owner@salao.com', password: 'senhaforte' };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe('owner@salao.com');
    });

    it('deve chamar authService.login com email e senha corretos', async () => {
      // Arrange
      const loginDto = { email: 'owner@salao.com', password: 'senhaforte' };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      await controller.login(loginDto);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith('owner@salao.com', 'senhaforte');
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      // Arrange
      const loginDto = { email: 'naoexiste@salao.com', password: 'senha123' };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto)).rejects.toThrow('Email ou senha inválidos');
    });

    it('deve lançar UnauthorizedException quando senha está incorreta', async () => {
      // Arrange
      const loginDto = { email: 'owner@salao.com', password: 'senhaerrada' };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando usuário está inativo', async () => {
      // Arrange
      const loginDto = { email: 'inativo@salao.com', password: 'senhaforte' };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Usuário desativado'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto)).rejects.toThrow('Usuário desativado');
    });

    it('deve retornar expiresIn em segundos (1800 = 30 minutos)', async () => {
      // Arrange
      const loginDto = { email: 'owner@salao.com', password: 'senhaforte' };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result.expiresIn).toBe(1800);
    });

    it('deve retornar mensagem de sucesso', async () => {
      // Arrange
      const loginDto = { email: 'owner@salao.com', password: 'senhaforte' };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result.message).toBe('Login realizado com sucesso');
    });

    it('não deve retornar passwordHash no objeto user', async () => {
      // Arrange
      const loginDto = { email: 'owner@salao.com', password: 'senhaforte' };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  // ========================================
  // TESTES DA ROTA POST /auth/refresh
  // ========================================
  describe('POST /auth/refresh', () => {
    it('deve retornar novos tokens quando refresh token é válido', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'valid-refresh-token' };
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(result).toEqual(mockRefreshResponse);
      expect(result.accessToken).toBe('new-mock-access-token');
      expect(result.refreshToken).toBe('new-mock-refresh-token');
    });

    it('deve chamar authService.refreshToken com o token correto', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'valid-refresh-token' };
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      await controller.refresh(refreshDto);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('deve lançar UnauthorizedException quando refresh token é inválido', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'invalid-token' };
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Refresh token inválido ou expirado'),
      );

      // Act & Assert
      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.refresh(refreshDto)).rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('deve lançar UnauthorizedException quando refresh token expirou', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'expired-token' };
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Refresh token inválido ou expirado'),
      );

      // Act & Assert
      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve retornar expiresIn nos novos tokens', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'valid-refresh-token' };
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(result.expiresIn).toBe(1800);
    });

    it('deve retornar mensagem de sucesso na renovação', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'valid-refresh-token' };
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(result.message).toBe('Token renovado com sucesso');
    });

    it('deve lançar erro quando usuário foi desativado após login', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'valid-refresh-token' };
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Usuário não encontrado ou inativo'),
      );

      // Act & Assert
      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.refresh(refreshDto)).rejects.toThrow('Usuário não encontrado ou inativo');
    });
  });
});
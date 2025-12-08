import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;

  // Mock do usuário
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'owner@salao.com',
    name: 'Owner Demo',
    passwordHash: '$2b$10$hashedpassword',
    role: 'OWNER',
    salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    active: true,
  };

  // Mock do UsersService
  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  // Mock do JwtService
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar tokens quando credenciais são válidas', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('senhaforte', 10);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      mockUsersService.findByEmail.mockResolvedValue(userWithHash);

      // Act
      const result = await authService.login('owner@salao.com', 'senhaforte');

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('owner@salao.com');
      expect(result.message).toBe('Login realizado com sucesso');
    });

    it('deve lançar erro quando usuário não existe', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login('naoexiste@salao.com', 'senha123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar erro quando senha está incorreta', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('senhaforte', 10);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      mockUsersService.findByEmail.mockResolvedValue(userWithHash);

      // Act & Assert
      await expect(
        authService.login('owner@salao.com', 'senhaerrada'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar erro quando usuário está inativo', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, active: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(
        authService.login('owner@salao.com', 'senhaforte'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar erro quando usuário não tem senha configurada', async () => {
      // Arrange
      const userWithoutPassword = { ...mockUser, passwordHash: null };
      mockUsersService.findByEmail.mockResolvedValue(userWithoutPassword);

      // Act & Assert
      await expect(
        authService.login('owner@salao.com', 'senhaforte'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('não deve retornar passwordHash no objeto user', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('senhaforte', 10);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      mockUsersService.findByEmail.mockResolvedValue(userWithHash);

      // Act
      const result = await authService.login('owner@salao.com', 'senhaforte');

      // Assert
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('refreshToken', () => {
    it('deve lançar erro quando refresh token é inválido', async () => {
      // Arrange
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
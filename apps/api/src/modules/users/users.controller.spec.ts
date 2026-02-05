import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  // Mock do usuário base
  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'João Silva',
    email: 'joao@salao.com',
    phone: '11999999999',
    role: 'STYLIST',
    commissionRate: '0.50',
    workSchedule: {
      seg: '09:00-18:00',
      ter: '09:00-18:00',
      qua: '09:00-18:00',
      qui: '09:00-18:00',
      sex: '09:00-18:00',
    },
    specialties: 'Corte, Barba',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock do usuário autenticado (para @CurrentUser())
  const mockAuthUser = {
    id: '11111111-1111-1111-1111-111111111111',
    salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'joao@salao.com',
    name: 'João Silva',
    role: 'OWNER' as const,
  };

  // Mock do UsersService
  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findProfessionals: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    updateWorkSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

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
  // TESTES DA ROTA GET /users
  // ========================================
  describe('GET /users', () => {
    it('deve retornar lista de usuários ativos', async () => {
      // Arrange
      const mockUsers = [
        mockUser,
        { ...mockUser, id: '22222222-2222-2222-2222-222222222222', name: 'Maria Silva' },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await controller.findAll(mockAuthUser, undefined);

      // Assert
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(mockAuthUser.salonId, false);
    });

    it('deve retornar lista vazia quando não há usuários', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll(mockAuthUser, undefined);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ========================================
  // TESTES DA ROTA GET /users/professionals
  // ========================================
  describe('GET /users/professionals', () => {
    it('deve retornar lista de profissionais', async () => {
      // Arrange
      const mockProfessionals = [
        mockUser,
        { ...mockUser, id: '22222222-2222-2222-2222-222222222222', name: 'Carlos Barbeiro' },
      ];
      mockUsersService.findProfessionals.mockResolvedValue(mockProfessionals);

      // Act
      const result = await controller.findProfessionals(mockAuthUser);

      // Assert
      expect(result).toEqual(mockProfessionals);
      expect(result).toHaveLength(2);
      expect(mockUsersService.findProfessionals).toHaveBeenCalledWith(mockAuthUser.salonId);
    });

    it('deve retornar lista vazia quando não há profissionais', async () => {
      // Arrange
      mockUsersService.findProfessionals.mockResolvedValue([]);

      // Act
      const result = await controller.findProfessionals(mockAuthUser);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ========================================
  // TESTES DA ROTA GET /users/:id
  // ========================================
  describe('GET /users/:id', () => {
    it('deve retornar usuário quando encontrado', async () => {
      // Arrange
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findById('11111111-1111-1111-1111-111111111111');

      // Assert
      expect(result).toEqual(mockUser);
      expect(result.name).toBe('João Silva');
      expect(mockUsersService.findById).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findById('id-inexistente')).rejects.toThrow(NotFoundException);
      await expect(controller.findById('id-inexistente')).rejects.toThrow('Usuario nao encontrado');
    });
  });

  // ========================================
  // TESTES DA ROTA POST /users
  // ========================================
  describe('POST /users', () => {
    it('deve criar e retornar novo usuário', async () => {
      // Arrange
      const createUserDto = {
        salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Novo Usuário',
        email: 'novo@salao.com',
        role: 'STYLIST',
      };
      const createdUser = { ...mockUser, ...createUserDto, id: '33333333-3333-3333-3333-333333333333' };
      mockUsersService.create.mockResolvedValue(createdUser);

      // Act
      const result = await controller.create(createUserDto as any);

      // Assert - usar toMatchObject para ignorar campos extras como 'message'
      expect(result).toMatchObject(createdUser);
      expect(result.name).toBe('Novo Usuário');
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('deve chamar usersService.create com os dados corretos', async () => {
      // Arrange
      const createUserDto = {
        salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Teste',
        email: 'teste@salao.com',
        role: 'RECEPTIONIST',
      };
      mockUsersService.create.mockResolvedValue({ ...mockUser, ...createUserDto });

      // Act
      await controller.create(createUserDto as any);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // TESTES DA ROTA PATCH /users/:id
  // ========================================
  describe('PATCH /users/:id', () => {
    it('deve atualizar e retornar usuário', async () => {
      // Arrange
      const updateUserDto = { name: 'João Atualizado' };
      const updatedUser = { ...mockUser, name: 'João Atualizado' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update('11111111-1111-1111-1111-111111111111', updateUserDto as any);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('João Atualizado');
    });

    it('deve chamar usersService.update com id e dados corretos', async () => {
      // Arrange
      const updateUserDto = { phone: '11988888888' };
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

      // Act
      await controller.update('11111111-1111-1111-1111-111111111111', updateUserDto as any);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111', updateUserDto);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      const updateUserDto = { name: 'Teste' };
      mockUsersService.update.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.update('id-inexistente', updateUserDto as any)).rejects.toThrow(NotFoundException);
      await expect(controller.update('id-inexistente', updateUserDto as any)).rejects.toThrow('Usuario nao encontrado');
    });
  });

  // ========================================
  // TESTES DA ROTA PATCH /users/:id/schedule
  // ========================================
  describe('PATCH /users/:id/schedule', () => {
    it('deve atualizar horário de trabalho do profissional', async () => {
      // Arrange
      const scheduleDto = {
        seg: '08:00-17:00',
        ter: '08:00-17:00',
        qua: '08:00-17:00',
      };
      const updatedUser = { ...mockUser, workSchedule: scheduleDto };
      mockUsersService.updateWorkSchedule.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.updateSchedule('11111111-1111-1111-1111-111111111111', scheduleDto as any);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(result.workSchedule).toEqual(scheduleDto);
    });

    it('deve chamar usersService.updateWorkSchedule com dados corretos', async () => {
      // Arrange
      const scheduleDto = { seg: '10:00-19:00' };
      mockUsersService.updateWorkSchedule.mockResolvedValue({ ...mockUser, workSchedule: scheduleDto });

      // Act
      await controller.updateSchedule('11111111-1111-1111-1111-111111111111', scheduleDto as any);

      // Assert
      expect(mockUsersService.updateWorkSchedule).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111', scheduleDto);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      const scheduleDto = { seg: '09:00-18:00' };
      mockUsersService.updateWorkSchedule.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.updateSchedule('id-inexistente', scheduleDto as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ========================================
  // TESTES DA ROTA DELETE /users/:id
  // ========================================
  describe('DELETE /users/:id', () => {
    it('deve desativar usuário e retornar mensagem de sucesso', async () => {
      // Arrange
      const deactivatedUser = { ...mockUser, active: false };
      mockUsersService.deactivate.mockResolvedValue(deactivatedUser);

      // Act
      const result = await controller.deactivate('11111111-1111-1111-1111-111111111111');

      // Assert
      expect(result).toEqual({ message: 'Usuario desativado com sucesso' });
    });

    it('deve chamar usersService.deactivate com id correto', async () => {
      // Arrange
      mockUsersService.deactivate.mockResolvedValue({ ...mockUser, active: false });

      // Act
      await controller.deactivate('11111111-1111-1111-1111-111111111111');

      // Assert
      expect(mockUsersService.deactivate).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
      expect(mockUsersService.deactivate).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      mockUsersService.deactivate.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.deactivate('id-inexistente')).rejects.toThrow(NotFoundException);
      await expect(controller.deactivate('id-inexistente')).rejects.toThrow('Usuario nao encontrado');
    });
  });
});
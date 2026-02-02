"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const users_service_1 = require("./users.service");
const database_module_1 = require("../../database/database.module");
describe('UsersService', () => {
    let service;
    // Mock do usuário base
    const mockUser = {
        id: '11111111-1111-1111-1111-111111111111',
        salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'João Silva',
        email: 'joao@salao.com',
        passwordHash: '$2b$10$hashedpassword',
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
    // Mock do banco de dados com encadeamento correto
    const createMockDb = () => {
        const mockChain = {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
        };
        return mockChain;
    };
    let mockDb;
    beforeEach(async () => {
        mockDb = createMockDb();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                users_service_1.UsersService,
                {
                    provide: database_module_1.DATABASE_CONNECTION,
                    useValue: mockDb,
                },
            ],
        }).compile();
        service = module.get(users_service_1.UsersService);
    });
    // ========================================
    // TESTES DO MÉTODO findAll
    // ========================================
    describe('findAll', () => {
        it('deve retornar lista de usuários ativos', async () => {
            // Arrange
            const mockUsers = [mockUser, { ...mockUser, id: '22222222-2222-2222-2222-222222222222', name: 'Maria' }];
            mockDb.where.mockResolvedValue(mockUsers);
            // Act
            const result = await service.findAll();
            // Assert
            expect(result).toEqual(mockUsers);
            expect(result).toHaveLength(2);
        });
        it('deve retornar lista vazia quando não há usuários', async () => {
            // Arrange
            mockDb.where.mockResolvedValue([]);
            // Act
            const result = await service.findAll();
            // Assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });
    // ========================================
    // TESTES DO MÉTODO findById
    // ========================================
    describe('findById', () => {
        it('deve retornar usuário quando encontrado', async () => {
            // Arrange
            mockDb.limit.mockResolvedValue([mockUser]);
            // Act
            const result = await service.findById('11111111-1111-1111-1111-111111111111');
            // Assert
            expect(result).toEqual(mockUser);
            expect(result?.name).toBe('João Silva');
        });
        it('deve retornar null quando usuário não existe', async () => {
            // Arrange
            mockDb.limit.mockResolvedValue([]);
            // Act
            const result = await service.findById('id-inexistente');
            // Assert
            expect(result).toBeNull();
        });
    });
    // ========================================
    // TESTES DO MÉTODO findByEmail
    // ========================================
    describe('findByEmail', () => {
        it('deve retornar usuário quando email encontrado', async () => {
            // Arrange
            mockDb.limit.mockResolvedValue([mockUser]);
            // Act
            const result = await service.findByEmail('joao@salao.com');
            // Assert
            expect(result).toEqual(mockUser);
            expect(result?.email).toBe('joao@salao.com');
        });
        it('deve retornar null quando email não existe', async () => {
            // Arrange
            mockDb.limit.mockResolvedValue([]);
            // Act
            const result = await service.findByEmail('naoexiste@salao.com');
            // Assert
            expect(result).toBeNull();
        });
    });
    // ========================================
    // TESTES DO MÉTODO findProfessionals
    // ========================================
    describe('findProfessionals', () => {
        it('deve retornar apenas usuários com role STYLIST', async () => {
            // Arrange
            const allUsers = [
                mockUser, // STYLIST
                { ...mockUser, id: '2', role: 'OWNER' },
                { ...mockUser, id: '3', role: 'STYLIST', name: 'Carlos' },
                { ...mockUser, id: '4', role: 'RECEPTIONIST' },
            ];
            mockDb.where.mockResolvedValue(allUsers);
            // Act
            const result = await service.findProfessionals();
            // Assert
            expect(result).toHaveLength(2);
            expect(result.every(u => u.role === 'STYLIST')).toBe(true);
        });
        it('deve retornar lista vazia quando não há profissionais', async () => {
            // Arrange
            const allUsers = [
                { ...mockUser, role: 'OWNER' },
                { ...mockUser, id: '2', role: 'RECEPTIONIST' },
            ];
            mockDb.where.mockResolvedValue(allUsers);
            // Act
            const result = await service.findProfessionals();
            // Assert
            expect(result).toHaveLength(0);
        });
    });
    // ========================================
    // TESTES DO MÉTODO create
    // ========================================
    describe('create', () => {
        it('deve criar e retornar novo usuário', async () => {
            // Arrange
            const newUserData = {
                salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                name: 'Novo Usuário',
                email: 'novo@salao.com',
                role: 'STYLIST',
            };
            mockDb.returning.mockResolvedValue([{ ...mockUser, ...newUserData }]);
            // Act
            const result = await service.create(newUserData);
            // Assert
            expect(result).toBeDefined();
            expect(result.name).toBe('Novo Usuário');
            expect(result.email).toBe('novo@salao.com');
        });
    });
    // ========================================
    // TESTES DO MÉTODO update
    // ========================================
    describe('update', () => {
        it('deve atualizar e retornar usuário', async () => {
            // Arrange
            const updatedUser = { ...mockUser, name: 'João Atualizado' };
            mockDb.returning.mockResolvedValue([updatedUser]);
            // Act
            const result = await service.update('11111111-1111-1111-1111-111111111111', { name: 'João Atualizado' });
            // Assert
            expect(result).toBeDefined();
            expect(result?.name).toBe('João Atualizado');
        });
        it('deve retornar null quando usuário não existe', async () => {
            // Arrange
            mockDb.returning.mockResolvedValue([]);
            // Act
            const result = await service.update('id-inexistente', { name: 'Teste' });
            // Assert
            expect(result).toBeNull();
        });
    });
    // ========================================
    // TESTES DO MÉTODO deactivate
    // ========================================
    describe('deactivate', () => {
        it('deve desativar usuário (soft delete)', async () => {
            // Arrange
            const deactivatedUser = { ...mockUser, active: false };
            mockDb.returning.mockResolvedValue([deactivatedUser]);
            // Act
            const result = await service.deactivate('11111111-1111-1111-1111-111111111111');
            // Assert
            expect(result).toBeDefined();
            expect(result?.active).toBe(false);
        });
    });
    // ========================================
    // TESTES DO MÉTODO isWithinWorkSchedule
    // ========================================
    describe('isWithinWorkSchedule', () => {
        it('deve retornar valid true quando horário está dentro do expediente', () => {
            // Arrange - Usando data que cai em dia útil (segunda = seg)
            // 2025-12-15 é uma segunda-feira
            const date = '2025-12-15T12:00:00';
            const time = '10:00';
            // Act
            const result = service.isWithinWorkSchedule(mockUser, date, time);
            // Assert
            expect(result.valid).toBe(true);
        });
        it('deve retornar valid false quando profissional não trabalha no dia', () => {
            // Arrange - Domingo (dom não está no workSchedule)
            // 2025-12-14 é um domingo
            const date = '2025-12-14T12:00:00';
            const time = '10:00';
            // Act
            const result = service.isWithinWorkSchedule(mockUser, date, time);
            // Assert
            expect(result.valid).toBe(false);
            expect(result.message).toContain('nao trabalha neste dia');
        });
        it('deve retornar valid false quando horário está antes do expediente', () => {
            // Arrange - Segunda-feira, 07:00 (antes das 09:00)
            const date = '2025-12-15T12:00:00';
            const time = '07:00';
            // Act
            const result = service.isWithinWorkSchedule(mockUser, date, time);
            // Assert
            expect(result.valid).toBe(false);
            expect(result.message).toContain('fora do expediente');
        });
        it('deve retornar valid false quando horário é após expediente', () => {
            // Arrange - Segunda-feira, 19:00 (após 18:00)
            const date = '2025-12-15T12:00:00';
            const time = '19:00';
            // Act
            const result = service.isWithinWorkSchedule(mockUser, date, time);
            // Assert
            expect(result.valid).toBe(false);
            expect(result.message).toContain('fora do expediente');
        });
        it('deve retornar valid true quando usuário não tem workSchedule definido', () => {
            // Arrange
            const userWithoutSchedule = { ...mockUser, workSchedule: null };
            const date = '2025-12-15T12:00:00';
            const time = '10:00';
            // Act
            const result = service.isWithinWorkSchedule(userWithoutSchedule, date, time);
            // Assert
            expect(result.valid).toBe(true);
        });
    });
    // ========================================
    // TESTES DO MÉTODO calculateCommission
    // ========================================
    describe('calculateCommission', () => {
        it('deve calcular comissão com taxa do usuário (50%)', () => {
            // Arrange
            const totalValue = 100;
            // Act
            const result = service.calculateCommission(mockUser, totalValue);
            // Assert
            expect(result).toBe(50); // 100 * 0.50
        });
        it('deve calcular comissão com taxa personalizada (30%)', () => {
            // Arrange
            const userWith30Percent = { ...mockUser, commissionRate: '0.30' };
            const totalValue = 200;
            // Act
            const result = service.calculateCommission(userWith30Percent, totalValue);
            // Assert
            expect(result).toBe(60); // 200 * 0.30
        });
        it('deve usar taxa padrão (50%) quando não definida', () => {
            // Arrange
            const userWithoutRate = { ...mockUser, commissionRate: null };
            const totalValue = 100;
            // Act
            const result = service.calculateCommission(userWithoutRate, totalValue);
            // Assert
            expect(result).toBe(50); // 100 * 0.50 (padrão)
        });
        it('deve calcular comissão corretamente para valores decimais', () => {
            // Arrange
            const totalValue = 150.50;
            // Act
            const result = service.calculateCommission(mockUser, totalValue);
            // Assert
            expect(result).toBe(75.25); // 150.50 * 0.50
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map
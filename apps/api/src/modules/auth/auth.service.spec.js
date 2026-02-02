"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
describe('AuthService', () => {
    let authService;
    // Mock do usuário base
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
    // Mock do Database Connection
    const mockDb = {
        insert: jest.fn().mockReturnValue({
            values: jest.fn().mockResolvedValue({}),
        }),
        select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([]),
                }),
            }),
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: users_service_1.UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: 'DATABASE_CONNECTION',
                    useValue: mockDb,
                },
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
        // Limpar mocks antes de cada teste
        jest.clearAllMocks();
    });
    // ========================================
    // TESTES DO MÉTODO LOGIN
    // ========================================
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
            expect(result).toHaveProperty('expiresIn', 1800);
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('owner@salao.com');
            expect(result.message).toBe('Login realizado com sucesso');
        });
        it('deve chamar findByEmail com o email correto', async () => {
            // Arrange
            const hashedPassword = await bcrypt.hash('senhaforte', 10);
            const userWithHash = { ...mockUser, passwordHash: hashedPassword };
            mockUsersService.findByEmail.mockResolvedValue(userWithHash);
            // Act
            await authService.login('owner@salao.com', 'senhaforte');
            // Assert
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('owner@salao.com');
            expect(mockUsersService.findByEmail).toHaveBeenCalledTimes(1);
        });
        it('deve gerar tokens com os payloads corretos', async () => {
            // Arrange
            const hashedPassword = await bcrypt.hash('senhaforte', 10);
            const userWithHash = { ...mockUser, passwordHash: hashedPassword };
            mockUsersService.findByEmail.mockResolvedValue(userWithHash);
            // Act
            await authService.login('owner@salao.com', 'senhaforte');
            // Assert
            expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                salonId: mockUser.salonId,
                type: 'access',
            }), expect.objectContaining({
                expiresIn: '30m',
            }));
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(expect.objectContaining({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                salonId: mockUser.salonId,
                type: 'refresh',
            }), expect.objectContaining({
                expiresIn: '7d',
            }));
        });
        it('deve lançar UnauthorizedException quando usuário não existe', async () => {
            // Arrange
            mockUsersService.findByEmail.mockResolvedValue(null);
            // Act & Assert
            await expect(authService.login('naoexiste@salao.com', 'senha123')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException quando senha está incorreta', async () => {
            // Arrange
            const hashedPassword = await bcrypt.hash('senhaforte', 10);
            const userWithHash = { ...mockUser, passwordHash: hashedPassword };
            mockUsersService.findByEmail.mockResolvedValue(userWithHash);
            // Act & Assert
            await expect(authService.login('owner@salao.com', 'senhaerrada')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException quando usuário está inativo', async () => {
            // Arrange
            const hashedPassword = await bcrypt.hash('senhaforte', 10);
            const inactiveUser = { ...mockUser, passwordHash: hashedPassword, active: false };
            mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
            // Act & Assert
            await expect(authService.login('owner@salao.com', 'senhaforte')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException quando usuário não tem senha configurada', async () => {
            // Arrange
            const userWithoutPassword = { ...mockUser, passwordHash: null };
            mockUsersService.findByEmail.mockResolvedValue(userWithoutPassword);
            // Act & Assert
            await expect(authService.login('owner@salao.com', 'senhaforte')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('não deve retornar passwordHash no objeto user da resposta', async () => {
            // Arrange
            const hashedPassword = await bcrypt.hash('senhaforte', 10);
            const userWithHash = { ...mockUser, passwordHash: hashedPassword };
            mockUsersService.findByEmail.mockResolvedValue(userWithHash);
            // Act
            const result = await authService.login('owner@salao.com', 'senhaforte');
            // Assert
            expect(result.user).not.toHaveProperty('passwordHash');
            expect(result.user).toHaveProperty('id');
            expect(result.user).toHaveProperty('email');
            expect(result.user).toHaveProperty('name');
            expect(result.user).toHaveProperty('role');
            expect(result.user).toHaveProperty('salonId');
        });
    });
    // ========================================
    // TESTES DO MÉTODO REFRESH TOKEN
    // ========================================
    describe('refreshToken', () => {
        const validRefreshPayload = {
            sub: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
            salonId: mockUser.salonId,
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + 604800, // 7 dias
        };
        it('deve retornar novos tokens quando refresh token é válido', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue(validRefreshPayload);
            mockUsersService.findById.mockResolvedValue(mockUser);
            // Act
            const result = await authService.refreshToken('valid-refresh-token');
            // Assert
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('expiresIn', 1800);
            expect(result.message).toBe('Token renovado com sucesso');
        });
        it('deve buscar usuário pelo ID do payload', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue(validRefreshPayload);
            mockUsersService.findById.mockResolvedValue(mockUser);
            // Act
            await authService.refreshToken('valid-refresh-token');
            // Assert
            expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id);
        });
        it('deve lançar UnauthorizedException quando refresh token é inválido', async () => {
            // Arrange
            mockJwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            // Act & Assert
            await expect(authService.refreshToken('invalid-token')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException quando tipo do token não é refresh', async () => {
            // Arrange
            const accessTokenPayload = { ...validRefreshPayload, type: 'access' };
            mockJwtService.verify.mockReturnValue(accessTokenPayload);
            // Act & Assert
            await expect(authService.refreshToken('access-token-instead')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException quando usuário não existe mais', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue(validRefreshPayload);
            mockUsersService.findById.mockResolvedValue(null);
            // Act & Assert
            await expect(authService.refreshToken('valid-refresh-token')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar UnauthorizedException quando usuário foi desativado', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue(validRefreshPayload);
            const inactiveUser = { ...mockUser, active: false };
            mockUsersService.findById.mockResolvedValue(inactiveUser);
            // Act & Assert
            await expect(authService.refreshToken('valid-refresh-token')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    // ========================================
    // TESTES DO MÉTODO LOGOUT
    // ========================================
    describe('logout', () => {
        const validRefreshPayload = {
            sub: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
            salonId: mockUser.salonId,
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) + 604800,
        };
        it('deve retornar mensagem de sucesso ao fazer logout', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue(validRefreshPayload);
            // Act
            const result = await authService.logout('valid-refresh-token', mockUser.id);
            // Assert
            expect(result.message).toBe('Logout realizado com sucesso');
        });
        it('deve adicionar token na blacklist', async () => {
            // Arrange
            mockJwtService.verify.mockReturnValue(validRefreshPayload);
            // Act
            await authService.logout('valid-refresh-token', mockUser.id);
            // Assert
            expect(mockDb.insert).toHaveBeenCalled();
        });
        it('deve retornar sucesso mesmo com token inválido', async () => {
            // Arrange
            mockJwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            // Act
            const result = await authService.logout('invalid-token', mockUser.id);
            // Assert
            expect(result.message).toBe('Logout realizado com sucesso');
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map
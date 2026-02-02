"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const addons_service_1 = require("./addons.service");
describe('AddonsService', () => {
    let service;
    // IDs de teste
    const SALON_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const APPOINTMENT_ID = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const APPOINTMENT_ID_2 = 'ccccccc1-cccc-cccc-cccc-cccccccccccc';
    const QUOTA_ID = 'ddddddd1-dddd-dddd-dddd-dddddddddddd';
    const LEDGER_ID = 'eeeeeee1-eeee-eeee-eeee-eeeeeeeeeeee';
    // Período atual
    const getCurrentPeriod = () => {
        const now = new Date();
        return now.getFullYear() * 100 + (now.getMonth() + 1);
    };
    // Mock do database
    const mockDb = {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        transaction: jest.fn(),
    };
    beforeEach(async () => {
        // Reset all mocks
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                addons_service_1.AddonsService,
                {
                    provide: 'DATABASE_CONNECTION',
                    useValue: mockDb,
                },
            ],
        }).compile();
        service = module.get(addons_service_1.AddonsService);
    });
    describe('consumeWhatsAppQuota', () => {
        // ========================================
        // TESTE 1: Consumo de quota incluída
        // ========================================
        it('deve consumir 1 quota incluída e decrementar includedRemaining', async () => {
            // Arrange: Simular que não existe consumo anterior (primeira chamada)
            const mockSelectFrom = jest.fn().mockReturnThis();
            const mockWhere = jest.fn().mockReturnThis();
            const mockLimit = jest.fn();
            // Primeira query: verificar consumo existente -> vazio
            mockLimit.mockResolvedValueOnce([]);
            // Segunda query: buscar quota -> quota com saldo included
            mockLimit.mockResolvedValueOnce([
                {
                    id: QUOTA_ID,
                    salonId: SALON_ID,
                    periodYyyymm: getCurrentPeriod(),
                    whatsappIncluded: 160,
                    whatsappUsed: 0,
                    whatsappExtraPurchased: 0,
                    whatsappExtraUsed: 0,
                },
            ]);
            mockDb.select.mockReturnValue({ from: mockSelectFrom });
            mockSelectFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            // Mock da transação
            mockDb.transaction.mockImplementation(async (callback) => {
                const txMock = {
                    update: jest.fn().mockReturnValue({
                        set: jest.fn().mockReturnValue({
                            where: jest.fn().mockResolvedValue(undefined),
                        }),
                    }),
                    insert: jest.fn().mockReturnValue({
                        values: jest.fn().mockReturnValue({
                            returning: jest.fn().mockResolvedValue([{ id: LEDGER_ID }]),
                        }),
                    }),
                };
                return callback(txMock);
            });
            // Act
            const result = await service.consumeWhatsAppQuota(SALON_ID, APPOINTMENT_ID, 'APPOINTMENT_CONFIRMATION');
            // Assert
            expect(result.success).toBe(true);
            expect(result.source).toBe('INCLUDED');
            expect(result.remaining.included).toBe(159); // 160 - 1
            expect(result.remaining.extra).toBe(0);
            expect(result.remaining.total).toBe(159);
            expect(result.ledgerId).toBe(LEDGER_ID);
        });
        // ========================================
        // TESTE 2: Idempotência - mesma chamada não consome duas vezes
        // ========================================
        it('deve retornar sucesso sem consumir quando já foi consumido anteriormente (idempotência)', async () => {
            // Arrange: Simular que JÁ existe consumo para este appointment
            const mockSelectFrom = jest.fn().mockReturnThis();
            const mockWhere = jest.fn().mockReturnThis();
            const mockLimit = jest.fn();
            // Primeira query: verificar consumo existente -> JÁ EXISTE
            mockLimit.mockResolvedValueOnce([
                {
                    id: LEDGER_ID,
                    salonId: SALON_ID,
                    periodYyyymm: getCurrentPeriod(),
                    eventType: 'CONSUME',
                    refType: 'APPOINTMENT',
                    refId: APPOINTMENT_ID,
                    metadata: { source: 'INCLUDED' },
                },
            ]);
            // Segunda query: buscar quota para retornar saldos
            mockLimit.mockResolvedValueOnce([
                {
                    id: QUOTA_ID,
                    salonId: SALON_ID,
                    periodYyyymm: getCurrentPeriod(),
                    whatsappIncluded: 160,
                    whatsappUsed: 1, // Já tem 1 usado
                    whatsappExtraPurchased: 0,
                    whatsappExtraUsed: 0,
                },
            ]);
            mockDb.select.mockReturnValue({ from: mockSelectFrom });
            mockSelectFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            // Act - Chamada 1
            const result1 = await service.consumeWhatsAppQuota(SALON_ID, APPOINTMENT_ID, 'APPOINTMENT_CONFIRMATION');
            // Assert - Primeira chamada retorna sucesso com ledger existente
            expect(result1.success).toBe(true);
            expect(result1.source).toBe('INCLUDED');
            expect(result1.ledgerId).toBe(LEDGER_ID);
            expect(result1.remaining.included).toBe(159); // 160 - 1
            // Verificar que NÃO chamou transaction (não houve novo consumo)
            expect(mockDb.transaction).not.toHaveBeenCalled();
        });
        // ========================================
        // TESTE 3: Consumo de quota extra quando included está esgotada
        // ========================================
        it('deve consumir quota EXTRA quando INCLUDED está esgotada', async () => {
            // Arrange
            const mockSelectFrom = jest.fn().mockReturnThis();
            const mockWhere = jest.fn().mockReturnThis();
            const mockLimit = jest.fn();
            // Primeira query: verificar consumo existente -> vazio
            mockLimit.mockResolvedValueOnce([]);
            // Segunda query: buscar quota -> included esgotada, mas tem extra
            mockLimit.mockResolvedValueOnce([
                {
                    id: QUOTA_ID,
                    salonId: SALON_ID,
                    periodYyyymm: getCurrentPeriod(),
                    whatsappIncluded: 160,
                    whatsappUsed: 160, // Tudo usado!
                    whatsappExtraPurchased: 20,
                    whatsappExtraUsed: 5,
                },
            ]);
            mockDb.select.mockReturnValue({ from: mockSelectFrom });
            mockSelectFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            // Mock da transação
            mockDb.transaction.mockImplementation(async (callback) => {
                const txMock = {
                    update: jest.fn().mockReturnValue({
                        set: jest.fn().mockReturnValue({
                            where: jest.fn().mockResolvedValue(undefined),
                        }),
                    }),
                    insert: jest.fn().mockReturnValue({
                        values: jest.fn().mockReturnValue({
                            returning: jest.fn().mockResolvedValue([{ id: LEDGER_ID }]),
                        }),
                    }),
                };
                return callback(txMock);
            });
            // Act
            const result = await service.consumeWhatsAppQuota(SALON_ID, APPOINTMENT_ID_2, 'APPOINTMENT_CONFIRMATION');
            // Assert
            expect(result.success).toBe(true);
            expect(result.source).toBe('EXTRA'); // Usou EXTRA
            expect(result.remaining.included).toBe(0); // 160 - 160
            expect(result.remaining.extra).toBe(14); // 15 - 1
            expect(result.remaining.total).toBe(14);
        });
        // ========================================
        // TESTE 4: Erro quando quota excedida
        // ========================================
        it('deve lançar erro HTTP 402 quando quota excedida', async () => {
            // Arrange
            const mockSelectFrom = jest.fn().mockReturnThis();
            const mockWhere = jest.fn().mockReturnThis();
            const mockLimit = jest.fn();
            // Primeira query: verificar consumo existente -> vazio
            mockLimit.mockResolvedValueOnce([]);
            // Segunda query: buscar quota -> TUDO ZERADO
            mockLimit.mockResolvedValueOnce([
                {
                    id: QUOTA_ID,
                    salonId: SALON_ID,
                    periodYyyymm: getCurrentPeriod(),
                    whatsappIncluded: 160,
                    whatsappUsed: 160, // Tudo usado
                    whatsappExtraPurchased: 0, // Sem extra
                    whatsappExtraUsed: 0,
                },
            ]);
            mockDb.select.mockReturnValue({ from: mockSelectFrom });
            mockSelectFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            // Act & Assert
            try {
                await service.consumeWhatsAppQuota(SALON_ID, APPOINTMENT_ID, 'APPOINTMENT_CONFIRMATION');
                fail('Deveria ter lançado HttpException');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.HttpException);
                expect(error.getStatus()).toBe(common_1.HttpStatus.PAYMENT_REQUIRED);
                const response = error.getResponse();
                expect(response.code).toBe('QUOTA_EXCEEDED');
                expect(response.needed).toBe(1);
                expect(response.remaining).toBe(0);
                expect(response.suggestedAction).toBe('buy_credit_or_upgrade');
                expect(response.packageCode).toBe('WHATSAPP_EXTRA_20');
            }
        });
        // ========================================
        // TESTE 5: Cria registro de quota quando não existe
        // ========================================
        it('deve criar registro de quota quando não existe para o período', async () => {
            // Arrange
            const mockSelectFrom = jest.fn().mockReturnThis();
            const mockWhere = jest.fn().mockReturnThis();
            const mockLimit = jest.fn();
            const mockInsertValues = jest.fn().mockReturnThis();
            const mockReturning = jest.fn();
            // Primeira query: verificar consumo existente -> vazio
            mockLimit.mockResolvedValueOnce([]);
            // Segunda query: buscar quota -> NÃO EXISTE
            mockLimit.mockResolvedValueOnce([]);
            // Insert retorna o novo registro
            mockReturning.mockResolvedValueOnce([
                {
                    id: QUOTA_ID,
                    salonId: SALON_ID,
                    periodYyyymm: getCurrentPeriod(),
                    whatsappIncluded: 0,
                    whatsappUsed: 0,
                    whatsappExtraPurchased: 0,
                    whatsappExtraUsed: 0,
                },
            ]);
            mockDb.select.mockReturnValue({ from: mockSelectFrom });
            mockSelectFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            mockDb.insert.mockReturnValue({
                values: mockInsertValues,
            });
            mockInsertValues.mockReturnValue({
                returning: mockReturning,
            });
            // Act & Assert - deve lançar erro pois quota zerada
            try {
                await service.consumeWhatsAppQuota(SALON_ID, APPOINTMENT_ID, 'APPOINTMENT_CONFIRMATION');
                fail('Deveria ter lançado HttpException');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.HttpException);
                expect(error.getStatus()).toBe(common_1.HttpStatus.PAYMENT_REQUIRED);
            }
            // Verificar que tentou criar o registro de quota
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=addons.service.spec.js.map
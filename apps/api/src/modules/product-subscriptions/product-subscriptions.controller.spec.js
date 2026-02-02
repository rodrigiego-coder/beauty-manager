"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const product_subscriptions_controller_1 = require("./product-subscriptions.controller");
const product_subscriptions_service_1 = require("./product-subscriptions.service");
const guards_1 = require("../../common/guards");
describe('ProductSubscriptionsController', () => {
    let controller;
    // Mock do request autenticado
    const mockRequest = {
        user: {
            sub: '11111111-1111-1111-1111-111111111111',
            salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            role: 'OWNER',
        },
    };
    // Mock de subscriptions
    const mockSubscriptions = [
        {
            id: 'sub-001',
            salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            clientId: 'client-001',
            planId: 'plan-001',
            status: 'ACTIVE',
            deliveryType: 'PICKUP',
            deliveryAddress: null,
            startDate: '2025-01-01',
            nextDeliveryDate: '2025-02-01',
            lastDeliveryDate: null,
            totalDeliveries: 0,
            paymentMethod: 'PIX',
            notes: null,
            pausedAt: null,
            pauseReason: null,
            cancelledAt: null,
            cancelReason: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            plan: {
                id: 'plan-001',
                name: 'Plano Mensal',
                billingPeriod: 'MONTHLY',
            },
            client: {
                id: 'client-001',
                name: 'Cliente Teste',
                phone: '11999999999',
            },
        },
    ];
    // Mock de planos
    const mockPlans = [
        {
            id: 'plan-001',
            salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            name: 'Plano Mensal',
            description: 'Kit mensal de produtos',
            billingPeriod: 'MONTHLY',
            originalPrice: '150.00',
            discountPercent: '10',
            finalPrice: '135.00',
            isActive: true,
            items: [],
        },
    ];
    // Mock do ProductSubscriptionsService
    const mockService = {
        getPlans: jest.fn(),
        getAvailablePlans: jest.fn(),
        getSubscriptions: jest.fn(),
        getSubscriptionById: jest.fn(),
        pauseSubscription: jest.fn(),
        resumeSubscription: jest.fn(),
        cancelSubscription: jest.fn(),
    };
    // Mock Guard que sempre permite acesso
    const mockGuard = { canActivate: () => true };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [product_subscriptions_controller_1.ProductSubscriptionsController],
            providers: [
                {
                    provide: product_subscriptions_service_1.ProductSubscriptionsService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(guards_1.AuthGuard)
            .useValue(mockGuard)
            .overrideGuard(guards_1.RolesGuard)
            .useValue(mockGuard)
            .compile();
        controller = module.get(product_subscriptions_controller_1.ProductSubscriptionsController);
        jest.clearAllMocks();
    });
    describe('controller', () => {
        it('deve estar definido', () => {
            expect(controller).toBeDefined();
        });
    });
    // ========================================
    // TESTES DA ROTA GET /product-subscriptions/subscriptions/my
    // ========================================
    describe('GET /product-subscriptions/subscriptions/my', () => {
        it('deve retornar lista de assinaturas do salao', async () => {
            // Arrange
            mockService.getSubscriptions.mockResolvedValue(mockSubscriptions);
            // Act
            const result = await controller.getMySubscriptions(mockRequest);
            // Assert
            expect(result).toEqual(mockSubscriptions);
            expect(result).toHaveLength(1);
            expect(mockService.getSubscriptions).toHaveBeenCalledWith(mockRequest.user.salonId);
        });
        it('deve retornar lista vazia quando nao ha assinaturas', async () => {
            // Arrange
            mockService.getSubscriptions.mockResolvedValue([]);
            // Act
            const result = await controller.getMySubscriptions(mockRequest);
            // Assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
        it('deve conter campos esperados pelo frontend', async () => {
            // Arrange
            mockService.getSubscriptions.mockResolvedValue(mockSubscriptions);
            // Act
            const result = await controller.getMySubscriptions(mockRequest);
            // Assert - verifica campos que o frontend espera
            const subscription = result[0];
            expect(subscription).toHaveProperty('id');
            expect(subscription).toHaveProperty('planId');
            expect(subscription).toHaveProperty('status');
            expect(subscription).toHaveProperty('startDate');
            expect(subscription).toHaveProperty('nextDeliveryDate');
            expect(subscription).toHaveProperty('deliveryType');
            expect(subscription).toHaveProperty('deliveryAddress');
            expect(subscription).toHaveProperty('plan');
        });
    });
    // ========================================
    // TESTES DA ROTA GET /product-subscriptions/plans
    // ========================================
    describe('GET /product-subscriptions/plans', () => {
        it('deve retornar todos os planos quando active nao especificado', async () => {
            // Arrange
            mockService.getPlans.mockResolvedValue(mockPlans);
            // Act
            const result = await controller.getPlans(mockRequest, undefined);
            // Assert
            expect(result).toEqual(mockPlans);
            expect(mockService.getPlans).toHaveBeenCalledWith(mockRequest.user.salonId);
            expect(mockService.getAvailablePlans).not.toHaveBeenCalled();
        });
        it('deve retornar apenas planos ativos quando active=true', async () => {
            // Arrange
            mockService.getAvailablePlans.mockResolvedValue(mockPlans);
            // Act
            const result = await controller.getPlans(mockRequest, 'true');
            // Assert
            expect(result).toEqual(mockPlans);
            expect(mockService.getAvailablePlans).toHaveBeenCalledWith(mockRequest.user.salonId);
            expect(mockService.getPlans).not.toHaveBeenCalled();
        });
    });
    // ========================================
    // TESTES DAS ROTAS DE AÇÕES DE ASSINATURA
    // ========================================
    describe('POST /product-subscriptions/subscriptions/:id/pause', () => {
        it('deve pausar assinatura', async () => {
            // Arrange
            const pausedSubscription = { ...mockSubscriptions[0], status: 'PAUSED' };
            mockService.pauseSubscription.mockResolvedValue(pausedSubscription);
            // Act
            const result = await controller.pauseSubscriptionAlt('sub-001', {}, mockRequest);
            // Assert
            expect(result.status).toBe('PAUSED');
            expect(mockService.pauseSubscription).toHaveBeenCalledWith('sub-001', mockRequest.user.salonId, {});
        });
    });
    describe('POST /product-subscriptions/subscriptions/:id/resume', () => {
        it('deve retomar assinatura', async () => {
            // Arrange
            const resumedSubscription = { ...mockSubscriptions[0], status: 'ACTIVE' };
            mockService.resumeSubscription.mockResolvedValue(resumedSubscription);
            // Act
            const result = await controller.resumeSubscriptionAlt('sub-001', mockRequest);
            // Assert
            expect(result.status).toBe('ACTIVE');
            expect(mockService.resumeSubscription).toHaveBeenCalledWith('sub-001', mockRequest.user.salonId);
        });
    });
    describe('POST /product-subscriptions/subscriptions/:id/cancel', () => {
        it('deve cancelar assinatura', async () => {
            // Arrange
            const cancelledSubscription = { ...mockSubscriptions[0], status: 'CANCELLED' };
            mockService.cancelSubscription.mockResolvedValue(cancelledSubscription);
            // Act
            const result = await controller.cancelSubscriptionAlt('sub-001', {}, mockRequest);
            // Assert
            expect(result.status).toBe('CANCELLED');
            expect(mockService.cancelSubscription).toHaveBeenCalledWith('sub-001', mockRequest.user.salonId, {});
        });
    });
});
//# sourceMappingURL=product-subscriptions.controller.spec.js.map
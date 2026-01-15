import { Test, TestingModule } from '@nestjs/testing';
import { ProductSubscriptionsController } from './product-subscriptions.controller';
import { ProductSubscriptionsService } from './product-subscriptions.service';
import { AuthGuard, RolesGuard } from '../../common/guards';

describe('ProductSubscriptionsController', () => {
  let controller: ProductSubscriptionsController;

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSubscriptionsController],
      providers: [
        {
          provide: ProductSubscriptionsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ProductSubscriptionsController>(ProductSubscriptionsController);

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
      const result = await controller.getMySubscriptions(mockRequest as any);

      // Assert
      expect(result).toEqual(mockSubscriptions);
      expect(result).toHaveLength(1);
      expect(mockService.getSubscriptions).toHaveBeenCalledWith(mockRequest.user.salonId);
    });

    it('deve retornar lista vazia quando nao ha assinaturas', async () => {
      // Arrange
      mockService.getSubscriptions.mockResolvedValue([]);

      // Act
      const result = await controller.getMySubscriptions(mockRequest as any);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve conter campos esperados pelo frontend', async () => {
      // Arrange
      mockService.getSubscriptions.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await controller.getMySubscriptions(mockRequest as any);

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
      const result = await controller.getPlans(mockRequest as any, undefined);

      // Assert
      expect(result).toEqual(mockPlans);
      expect(mockService.getPlans).toHaveBeenCalledWith(mockRequest.user.salonId);
      expect(mockService.getAvailablePlans).not.toHaveBeenCalled();
    });

    it('deve retornar apenas planos ativos quando active=true', async () => {
      // Arrange
      mockService.getAvailablePlans.mockResolvedValue(mockPlans);

      // Act
      const result = await controller.getPlans(mockRequest as any, 'true');

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
      const result = await controller.pauseSubscriptionAlt('sub-001', {}, mockRequest as any);

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
      const result = await controller.resumeSubscriptionAlt('sub-001', mockRequest as any);

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
      const result = await controller.cancelSubscriptionAlt('sub-001', {}, mockRequest as any);

      // Assert
      expect(result.status).toBe('CANCELLED');
      expect(mockService.cancelSubscription).toHaveBeenCalledWith('sub-001', mockRequest.user.salonId, {});
    });
  });
});

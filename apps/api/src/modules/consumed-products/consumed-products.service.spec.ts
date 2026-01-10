import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConsumedProductsService } from './consumed-products.service';
import { ProductsService } from '../products/products.service';
import { DATABASE_CONNECTION } from '../../database/database.module';

describe('ConsumedProductsService', () => {
  let service: ConsumedProductsService;
  let productsService: jest.Mocked<ProductsService>;

  // Mock do produto base
  const mockProduct = {
    id: 1,
    salonId: 'salon-123',
    name: 'Shampoo Profissional',
    description: 'Shampoo para uso profissional',
    costPrice: '25.00',
    salePrice: '50.00',
    stockInternal: 10,
    stockRetail: 5,
    minStockInternal: 2,
    minStockRetail: 1,
    unit: 'UN',
    active: true,
    hairTypes: [],
    concerns: [],
    contraindications: null,
    ingredients: null,
    howToUse: null,
    benefits: [],
    brand: 'Marca X',
    category: 'Shampoo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock do consumo registrado
  const mockConsumedProduct = {
    id: 1,
    appointmentId: 'appointment-123',
    productId: 1,
    quantityUsed: '2',
    costAtTime: '25.00',
    createdAt: new Date(),
  };

  // Mock do banco de dados com encadeamento correto
  const createMockDb = () => {
    const mockDeleteChain = {
      where: jest.fn().mockResolvedValue(undefined),
    };

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      delete: jest.fn().mockReturnValue(mockDeleteChain),
    };
    return mockChain;
  };

  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    mockDb = createMockDb();

    const mockProductsService = {
      findById: jest.fn(),
      adjustStock: jest.fn(),
      adjustStockWithLocation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumedProductsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<ConsumedProductsService>(ConsumedProductsService);
    productsService = module.get(ProductsService);
  });

  // ========================================
  // TESTES DO MÉTODO register
  // ========================================
  describe('register', () => {
    const registerData = {
      appointmentId: 'appointment-123',
      productId: 1,
      quantityUsed: 2,
      salonId: 'salon-123',
      userId: 'user-123',
    };

    it('deve registrar consumo com sucesso', async () => {
      // Arrange
      productsService.findById.mockResolvedValue(mockProduct as any);
      productsService.adjustStockWithLocation.mockResolvedValue({ product: mockProduct, movement: {} } as any);
      mockDb.returning.mockResolvedValue([mockConsumedProduct]);

      // Act
      const result = await service.register(registerData);

      // Assert
      expect(productsService.findById).toHaveBeenCalledWith(registerData.productId);
      expect(productsService.adjustStockWithLocation).toHaveBeenCalledWith({
        productId: registerData.productId,
        salonId: registerData.salonId,
        userId: registerData.userId,
        quantity: -registerData.quantityUsed,
        locationType: 'INTERNAL',
        movementType: 'SERVICE_CONSUMPTION',
        reason: 'Consumo em serviço',
        referenceType: 'appointment',
        referenceId: registerData.appointmentId,
      });
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(mockConsumedProduct);
    });

    it('deve lançar NotFoundException quando produto não existe', async () => {
      // Arrange
      productsService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(registerData)).rejects.toThrow(NotFoundException);
      await expect(service.register(registerData)).rejects.toThrow('Produto nao encontrado');
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando produto pertence a outro salão (multi-tenant)', async () => {
      // Arrange
      const productFromAnotherSalon = { ...mockProduct, salonId: 'outro-salon-456' };
      productsService.findById.mockResolvedValue(productFromAnotherSalon as any);

      // Act & Assert
      await expect(service.register(registerData)).rejects.toThrow(NotFoundException);
      await expect(service.register(registerData)).rejects.toThrow('Produto nao encontrado');
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando produto está inativo', async () => {
      // Arrange
      const inactiveProduct = { ...mockProduct, active: false };
      productsService.findById.mockResolvedValue(inactiveProduct as any);

      // Act & Assert
      await expect(service.register(registerData)).rejects.toThrow(BadRequestException);
      await expect(service.register(registerData)).rejects.toThrow('Produto esta inativo');
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando estoque é insuficiente', async () => {
      // Arrange
      const productWithLowStock = { ...mockProduct, stockInternal: 1 };
      productsService.findById.mockResolvedValue(productWithLowStock as any);

      const dataWithHighQuantity = { ...registerData, quantityUsed: 5 };

      // Act & Assert
      await expect(service.register(dataWithHighQuantity)).rejects.toThrow(BadRequestException);
      await expect(service.register(dataWithHighQuantity)).rejects.toThrow('Estoque interno insuficiente');
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve incluir unidade do produto na mensagem de estoque insuficiente', async () => {
      // Arrange
      const productWithLowStock = { ...mockProduct, stockInternal: 1, unit: 'ML' };
      productsService.findById.mockResolvedValue(productWithLowStock as any);

      const dataWithHighQuantity = { ...registerData, quantityUsed: 5 };

      // Act & Assert
      try {
        await service.register(dataWithHighQuantity);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect((error as BadRequestException).message).toContain('1');
        expect((error as BadRequestException).message).toContain('ML');
      }
    });
  });

  // ========================================
  // TESTES DO MÉTODO remove
  // ========================================
  describe('remove', () => {
    const removeCtx = {
      salonId: 'salon-123',
      userId: 'user-123',
    };

    it('deve remover consumo e estornar estoque com sucesso', async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([mockConsumedProduct]);
      productsService.findById.mockResolvedValue(mockProduct as any);
      productsService.adjustStockWithLocation.mockResolvedValue({ product: mockProduct, movement: {} } as any);

      // Act
      const result = await service.remove(1, removeCtx);

      // Assert
      expect(result).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
      expect(productsService.findById).toHaveBeenCalledWith(mockConsumedProduct.productId);
      expect(productsService.adjustStockWithLocation).toHaveBeenCalledWith({
        productId: mockConsumedProduct.productId,
        salonId: removeCtx.salonId,
        userId: removeCtx.userId,
        quantity: parseFloat(mockConsumedProduct.quantityUsed),
        locationType: 'INTERNAL',
        movementType: 'RETURN',
        reason: 'Estorno de consumo em serviço',
      });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('deve retornar false quando consumo não existe', async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([]);

      // Act
      const result = await service.remove(999, removeCtx);

      // Assert
      expect(result).toBe(false);
      expect(productsService.findById).not.toHaveBeenCalled();
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve retornar false quando produto não existe mais', async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([mockConsumedProduct]);
      productsService.findById.mockResolvedValue(null);

      // Act
      const result = await service.remove(1, removeCtx);

      // Assert
      expect(result).toBe(false);
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve retornar false quando produto pertence a outro salão (multi-tenant)', async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([mockConsumedProduct]);
      const productFromAnotherSalon = { ...mockProduct, salonId: 'outro-salon-456' };
      productsService.findById.mockResolvedValue(productFromAnotherSalon as any);

      // Act
      const result = await service.remove(1, removeCtx);

      // Assert
      expect(result).toBe(false);
      expect(productsService.adjustStockWithLocation).not.toHaveBeenCalled();
    });

    it('deve converter quantityUsed de string para número ao chamar adjustStockWithLocation', async () => {
      // Arrange
      const consumedWithDecimal = { ...mockConsumedProduct, quantityUsed: '2.5' };
      mockDb.limit.mockResolvedValue([consumedWithDecimal]);
      productsService.findById.mockResolvedValue(mockProduct as any);
      productsService.adjustStockWithLocation.mockResolvedValue({ product: mockProduct, movement: {} } as any);

      // Act
      await service.remove(1, removeCtx);

      // Assert
      expect(productsService.adjustStockWithLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 2.5,
        }),
      );
    });
  });

  // ========================================
  // TESTES DO MÉTODO findAll
  // ========================================
  describe('findAll', () => {
    it('deve retornar lista de produtos consumidos', async () => {
      // Arrange
      const mockConsumedProducts = [
        mockConsumedProduct,
        { ...mockConsumedProduct, id: 2, productId: 2 },
      ];
      mockDb.from.mockResolvedValue(mockConsumedProducts);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockConsumedProducts);
      expect(result).toHaveLength(2);
    });
  });

  // ========================================
  // TESTES DO MÉTODO findByAppointment
  // ========================================
  describe('findByAppointment', () => {
    it('deve retornar produtos consumidos do agendamento', async () => {
      // Arrange
      mockDb.where.mockResolvedValue([mockConsumedProduct]);

      // Act
      const result = await service.findByAppointment('appointment-123');

      // Assert
      expect(result).toEqual([mockConsumedProduct]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando não há consumos', async () => {
      // Arrange
      mockDb.where.mockResolvedValue([]);

      // Act
      const result = await service.findByAppointment('appointment-sem-consumo');

      // Assert
      expect(result).toEqual([]);
    });
  });
});

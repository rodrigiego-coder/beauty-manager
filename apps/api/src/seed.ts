import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import {
  salons,
  users,
  loyaltyPrograms,
  loyaltyTiers,
  loyaltyRewards,
  plans,
  salonSubscriptions,
  clients,
  services,
  products,
  commands,
  commandItems,
  packages,
  packageServices,
  clientPackages,
  clientPackageBalances,
  clientPackageUsages,
} from './database/schema';

/**
 * Script de Seed - Popula o banco com dados iniciais
 * 
 * Execução: npm run db:seed --workspace=apps/api
 */
async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  const connectionString = process.env.DATABASE_URL || 
    'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager';

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    // ========================================
    // 1. CRIAR SALÃO DEMO
    // ========================================
    console.log('📍 Criando salão demo...');
    
    const salonId = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    
    await db.insert(salons).values({
      id: salonId,
      name: 'Salão Demo',
      email: 'contato@salao.com',
      phone: '(11) 99999-9999',
      address: 'Rua Exemplo, 123 - São Paulo/SP',
      active: true,
    }).onConflictDoNothing();

    console.log('✅ Salão criado: Salão Demo\n');

    // ========================================
    // 2. CRIAR USUÁRIO OWNER
    // ========================================
    console.log('👤 Criando usuário owner...');
    
    const passwordHash = await bcrypt.hash('senhaforte', 10);
    
    await db.insert(users).values({
      id: '11111111-1111-1111-1111-111111111111',
      salonId: salonId,
      name: 'Owner Demo',
      email: 'owner@salao.com',
      passwordHash: passwordHash,
      phone: '(11) 99999-0001',
      role: 'OWNER',
      active: true,
    }).onConflictDoNothing();

    console.log('✅ Usuário criado: owner@salao.com / senhaforte\n');

    // ========================================
    // 3. CRIAR USUÁRIO MANAGER
    // ========================================
    console.log('👤 Criando usuário manager...');
    
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    
    await db.insert(users).values({
      id: '22222222-2222-2222-2222-222222222222',
      salonId: salonId,
      name: 'Gerente Demo',
      email: 'gerente@salao.com',
      passwordHash: managerPasswordHash,
      phone: '(11) 99999-0002',
      role: 'MANAGER',
      active: true,
    }).onConflictDoNothing();

    console.log('✅ Usuário criado: gerente@salao.com / manager123\n');

    // ========================================
    // 4. CRIAR USUÁRIO STYLIST
    // ========================================
    console.log('👤 Criando usuário stylist...');
    
    const stylistPasswordHash = await bcrypt.hash('stylist123', 10);
    
    await db.insert(users).values({
      id: '33333333-3333-3333-3333-333333333333',
      salonId: salonId,
      name: 'Profissional Demo',
      email: 'profissional@salao.com',
      passwordHash: stylistPasswordHash,
      phone: '(11) 99999-0003',
      role: 'STYLIST',
      commissionRate: '0.50',
      specialties: 'Corte, Coloração, Escova',
      active: true,
    }).onConflictDoNothing();

    console.log('✅ Usuário criado: profissional@salao.com / stylist123\n');

    // ========================================
    // 5. CRIAR USUÁRIO RECEPTIONIST
    // ========================================
    console.log('👤 Criando usuário receptionist...');
    
    const receptionistPasswordHash = await bcrypt.hash('recepcao123', 10);
    
    await db.insert(users).values({
      id: '44444444-4444-4444-4444-444444444444',
      salonId: salonId,
      name: 'Recepcionista Demo',
      email: 'recepcao@salao.com',
      passwordHash: receptionistPasswordHash,
      phone: '(11) 99999-0004',
      role: 'RECEPTIONIST',
      active: true,
    }).onConflictDoNothing();

    console.log('✅ Usuário criado: recepcao@salao.com / recepcao123\n');

    // ========================================
    // 6. CRIAR PROGRAMA DE FIDELIDADE
    // ========================================
    console.log('👑 Criando programa de fidelidade...');

    const programId = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    await db.insert(loyaltyPrograms).values({
      id: programId,
      salonId: salonId,
      name: 'Programa de Fidelidade',
      isActive: true,
      pointsPerRealService: '1',
      pointsPerRealProduct: '1',
      pointsExpireDays: 365,
      minimumRedeemPoints: 100,
      welcomePoints: 50,
      birthdayPoints: 100,
      referralPoints: 200,
    }).onConflictDoNothing();

    console.log('✅ Programa de fidelidade criado\n');

    // ========================================
    // 7. CRIAR NÍVEIS DO PROGRAMA
    // ========================================
    console.log('⭐ Criando níveis de fidelidade...');

    const tiers = [
      {
        id: 'ccccccc1-cccc-cccc-cccc-cccccccccccc',
        programId: programId,
        name: 'Basic',
        code: 'BASIC',
        minPoints: 0,
        color: '#6B7280',
        icon: null,
        benefits: { discountPercent: 0, priorityBooking: false },
        pointsMultiplier: '1',
        sortOrder: 0,
      },
      {
        id: 'ccccccc2-cccc-cccc-cccc-cccccccccccc',
        programId: programId,
        name: 'Silver',
        code: 'SILVER',
        minPoints: 500,
        color: '#9CA3AF',
        icon: null,
        benefits: { discountPercent: 5, priorityBooking: false },
        pointsMultiplier: '1.2',
        sortOrder: 1,
      },
      {
        id: 'ccccccc3-cccc-cccc-cccc-cccccccccccc',
        programId: programId,
        name: 'Gold',
        code: 'GOLD',
        minPoints: 2000,
        color: '#F59E0B',
        icon: null,
        benefits: { discountPercent: 10, priorityBooking: true },
        pointsMultiplier: '1.5',
        sortOrder: 2,
      },
      {
        id: 'ccccccc4-cccc-cccc-cccc-cccccccccccc',
        programId: programId,
        name: 'VIP',
        code: 'VIP',
        minPoints: 5000,
        color: '#8B5CF6',
        icon: null,
        benefits: { discountPercent: 15, priorityBooking: true, extraBenefits: 'Atendimento prioritário, brindes exclusivos' },
        pointsMultiplier: '2',
        sortOrder: 3,
      },
    ];

    for (const tier of tiers) {
      await db.insert(loyaltyTiers).values(tier).onConflictDoNothing();
    }

    console.log('✅ 4 níveis criados: Basic, Silver, Gold, VIP\n');

    // ========================================
    // 8. CRIAR RECOMPENSAS PADRÃO
    // ========================================
    console.log('🎁 Criando recompensas de fidelidade...');

    const rewards = [
      {
        id: 'ddddddd1-dddd-dddd-dddd-dddddddddddd',
        salonId: salonId,
        programId: programId,
        name: 'Desconto de R$20',
        description: 'Desconto de R$20 em qualquer serviço ou produto',
        type: 'DISCOUNT_VALUE',
        pointsCost: 200,
        value: '20',
        minTier: null,
        maxRedemptionsPerClient: null,
        totalAvailable: null,
        validDays: 30,
        isActive: true,
      },
      {
        id: 'ddddddd2-dddd-dddd-dddd-dddddddddddd',
        salonId: salonId,
        programId: programId,
        name: '10% de desconto',
        description: 'Desconto de 10% em qualquer serviço',
        type: 'DISCOUNT_PERCENT',
        pointsCost: 300,
        value: '10',
        minTier: null,
        maxRedemptionsPerClient: null,
        totalAvailable: null,
        validDays: 30,
        isActive: true,
      },
      {
        id: 'ddddddd3-dddd-dddd-dddd-dddddddddddd',
        salonId: salonId,
        programId: programId,
        name: 'Hidratação Grátis',
        description: 'Uma sessão de hidratação capilar gratuita',
        type: 'FREE_SERVICE',
        pointsCost: 500,
        value: '80',
        minTier: 'SILVER',
        maxRedemptionsPerClient: 2,
        totalAvailable: null,
        validDays: 60,
        isActive: true,
      },
      {
        id: 'ddddddd4-dddd-dddd-dddd-dddddddddddd',
        salonId: salonId,
        programId: programId,
        name: 'Brinde Surpresa',
        description: 'Um brinde especial do salão',
        type: 'GIFT',
        pointsCost: 400,
        value: null,
        minTier: null,
        maxRedemptionsPerClient: 1,
        totalAvailable: 50,
        validDays: 30,
        isActive: true,
      },
    ];

    for (const reward of rewards) {
      await db.insert(loyaltyRewards).values(reward).onConflictDoNothing();
    }

    console.log('✅ 4 recompensas criadas\n');

    // ========================================
    // 9. CRIAR PLANO PROFESSIONAL
    // ========================================
    console.log('📋 Criando plano Professional...');

    const planId = 'eeeeeee1-eeee-eeee-eeee-eeeeeeeeeeee';

    await db.insert(plans).values({
      id: planId,
      code: 'PROFESSIONAL',
      name: 'Professional',
      description: 'Plano completo para salões profissionais',
      priceMonthly: '199.90',
      priceYearly: '1999.00',
      currency: 'BRL',
      maxUsers: 10,
      maxClients: 1000,
      maxSalons: 1,
      features: ['Agendamentos ilimitados', 'Gestão de estoque', 'Relatórios avançados', 'Programa de fidelidade', 'WhatsApp integrado'],
      hasFiscal: true,
      hasAutomation: true,
      hasReports: true,
      hasAI: true,
      trialDays: 14,
      isActive: true,
      sortOrder: 2,
    }).onConflictDoNothing();

    console.log('✅ Plano Professional criado\n');

    // ========================================
    // 10. CRIAR ASSINATURA ATIVA DO SALÃO
    // ========================================
    console.log('💳 Criando assinatura ativa...');

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    await db.insert(salonSubscriptions).values({
      id: 'ffffff01-ffff-ffff-ffff-ffffffffffff',
      salonId: salonId,
      planId: planId,
      status: 'ACTIVE',
      billingPeriod: 'MONTHLY',
      startsAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      trialEndsAt: null,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    }).onConflictDoNothing();

    console.log('✅ Assinatura Professional ativa criada\n');

    // ========================================
    // 11. CRIAR CLIENTES DEMO
    // ========================================
    console.log('👥 Criando clientes demo...');

    const clientIds = [
      '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '55555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ];

    const clientsData = [
      {
        id: clientIds[0],
        salonId: salonId,
        name: 'Maria Silva',
        phone: '(11) 98888-1111',
        email: 'maria.silva@email.com',
        birthDate: '1990-05-15',
        technicalNotes: 'Cabelo tingido, sensível a produtos com amônia',
        preferences: 'Prefere horários pela manhã',
        totalVisits: 12,
        active: true,
      },
      {
        id: clientIds[1],
        salonId: salonId,
        name: 'Ana Santos',
        phone: '(11) 98888-2222',
        email: 'ana.santos@email.com',
        birthDate: '1985-08-22',
        technicalNotes: 'Cabelo cacheado tipo 3A',
        preferences: 'Gosta de produtos veganos',
        totalVisits: 8,
        active: true,
      },
      {
        id: clientIds[2],
        salonId: salonId,
        name: 'Carla Oliveira',
        phone: '(11) 98888-3333',
        email: 'carla.oliveira@email.com',
        birthDate: '1995-01-30',
        technicalNotes: 'Cabelo liso, pontas duplas',
        preferences: 'Disponível apenas aos sábados',
        totalVisits: 5,
        active: true,
      },
      {
        id: clientIds[3],
        salonId: salonId,
        name: 'Juliana Costa',
        phone: '(11) 98888-4444',
        email: 'juliana.costa@email.com',
        birthDate: '1988-11-10',
        technicalNotes: 'Fez progressiva há 3 meses',
        preferences: 'Prefere atendimento com profissional específico',
        totalVisits: 15,
        active: true,
      },
      {
        id: clientIds[4],
        salonId: salonId,
        name: 'Fernanda Lima',
        phone: '(11) 98888-5555',
        email: 'fernanda.lima@email.com',
        birthDate: '1992-03-25',
        technicalNotes: 'Cabelo loiro platinado, requer cuidados especiais',
        preferences: 'Cliente VIP, sempre oferece gorjeta',
        totalVisits: 20,
        active: true,
      },
    ];

    for (const client of clientsData) {
      await db.insert(clients).values(client).onConflictDoNothing();
    }

    console.log('✅ 5 clientes criados\n');

    // ========================================
    // 12. CRIAR SERVIÇOS PADRÃO BEAUTY MANAGER
    // ========================================
    console.log('✂️ Criando serviços padrão Beauty Manager...');

    const servicesData = [
      {
        salonId: salonId,
        name: 'Corte',
        description: 'Corte personalizado com lavagem e finalização',
        category: 'HAIR' as const,
        durationMinutes: 60,
        basePrice: '100.00',
        commissionPercentage: '45.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Corte + Hidratação',
        description: 'Corte completo com tratamento de hidratação incluso',
        category: 'HAIR' as const,
        durationMinutes: 120,
        basePrice: '150.00',
        commissionPercentage: '45.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Coloração (raiz)',
        description: 'Retoque de coloração apenas na raiz',
        category: 'HAIR' as const,
        durationMinutes: 90,
        basePrice: '100.00',
        commissionPercentage: '40.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Coloração (cabelo todo)',
        description: 'Coloração completa de raiz às pontas',
        category: 'HAIR' as const,
        durationMinutes: 120,
        basePrice: '200.00',
        commissionPercentage: '40.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Mechas',
        description: 'Mechas e luzes com técnicas variadas (balayage, ombré, etc)',
        category: 'HAIR' as const,
        durationMinutes: 240,
        basePrice: '500.00',
        commissionPercentage: '40.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Escova',
        description: 'Escova modeladora com secador e finalização',
        category: 'HAIR' as const,
        durationMinutes: 60,
        basePrice: '70.00',
        commissionPercentage: '50.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Alisamento',
        description: 'Alisamento profissional com produtos de qualidade',
        category: 'HAIR' as const,
        durationMinutes: 150,
        basePrice: '250.00',
        commissionPercentage: '40.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Hidratação avulsa',
        description: 'Tratamento intensivo de hidratação capilar',
        category: 'HAIR' as const,
        durationMinutes: 60,
        basePrice: '150.00',
        commissionPercentage: '45.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Cronograma capilar (4 sessões)',
        description: 'Tratamento completo com 4 sessões: hidratação, nutrição e reconstrução',
        category: 'HAIR' as const,
        durationMinutes: 240,
        basePrice: '450.00',
        commissionPercentage: '40.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Camuflagem',
        description: 'Camuflagem de fios brancos para cabelo masculino',
        category: 'BARBER' as const,
        durationMinutes: 90,
        basePrice: '100.00',
        commissionPercentage: '45.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Nutrição',
        description: 'Tratamento de nutrição capilar para repor lipídios',
        category: 'HAIR' as const,
        durationMinutes: 60,
        basePrice: '120.00',
        commissionPercentage: '45.00',
        allowOnlineBooking: true,
        active: true,
      },
      {
        salonId: salonId,
        name: 'Reconstrução',
        description: 'Tratamento de reconstrução para cabelos danificados',
        category: 'HAIR' as const,
        durationMinutes: 90,
        basePrice: '180.00',
        commissionPercentage: '45.00',
        allowOnlineBooking: true,
        active: true,
      },
    ];

    for (const service of servicesData) {
      const existing = await db.select({ id: services.id })
        .from(services)
        .where(and(eq(services.salonId, salonId), eq(services.name, service.name)))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(services).values(service);
      }
    }

    console.log('✅ 12 serviços padrão criados\n');

    // ========================================
    // 13. CRIAR PRODUTOS DEMO (ESTOQUE)
    // ========================================
    console.log('📦 Criando produtos demo...');

    const productsData = [
      {
        salonId: salonId,
        name: 'Shampoo Profissional 1L',
        description: 'Shampoo para uso profissional em salão',
        costPrice: '45.00',
        salePrice: '89.90',
        stockRetail: 15,
        stockInternal: 8,
        minStockRetail: 5,
        minStockInternal: 3,
        unit: 'UN' as const,
        isRetail: true,
        isBackbar: true,
        brand: 'L\'Oréal',
        category: 'Cabelo',
        active: true,
      },
      {
        salonId: salonId,
        name: 'Condicionador Profissional 1L',
        description: 'Condicionador para uso profissional',
        costPrice: '48.00',
        salePrice: '95.00',
        stockRetail: 12,
        stockInternal: 6,
        minStockRetail: 5,
        minStockInternal: 3,
        unit: 'UN' as const,
        isRetail: true,
        isBackbar: true,
        brand: 'L\'Oréal',
        category: 'Cabelo',
        active: true,
      },
      {
        salonId: salonId,
        name: 'Máscara de Hidratação 500g',
        description: 'Máscara para tratamento intensivo',
        costPrice: '60.00',
        salePrice: '120.00',
        stockRetail: 10,
        stockInternal: 4,
        minStockRetail: 3,
        minStockInternal: 2,
        unit: 'UN' as const,
        isRetail: true,
        isBackbar: true,
        brand: 'Kerastase',
        category: 'Tratamento',
        active: true,
      },
      {
        salonId: salonId,
        name: 'Esmalte Vermelho Clássico',
        description: 'Esmalte de longa duração',
        costPrice: '8.00',
        salePrice: '18.00',
        stockRetail: 25,
        stockInternal: 10,
        minStockRetail: 10,
        minStockInternal: 5,
        unit: 'UN' as const,
        isRetail: true,
        isBackbar: true,
        brand: 'Risqué',
        category: 'Unhas',
        active: true,
      },
      {
        salonId: salonId,
        name: 'Óleo Finalizador 100ml',
        description: 'Óleo para finalização e brilho',
        costPrice: '35.00',
        salePrice: '75.00',
        stockRetail: 18,
        stockInternal: 5,
        minStockRetail: 5,
        minStockInternal: 2,
        unit: 'UN' as const,
        isRetail: true,
        isBackbar: false,
        brand: 'Moroccanoil',
        category: 'Finalização',
        active: true,
      },
    ];

    for (const product of productsData) {
      const existing = await db.select({ id: products.id })
        .from(products)
        .where(and(eq(products.salonId, salonId), eq(products.name, product.name)))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(products).values(product);
      }
    }

    console.log('✅ 5 produtos criados\n');

    // ========================================
    // 14. CRIAR COMANDAS DE EXEMPLO (ÚLTIMOS 30 DIAS)
    // ========================================
    console.log('🧾 Criando comandas de exemplo...');

    const stylistId = '33333333-3333-3333-3333-333333333333';
    const receptionistId = '44444444-4444-4444-4444-444444444444';

    const commandsData = [
      {
        id: 'c0000001-0001-0001-0001-000000000001',
        salonId: salonId,
        clientId: clientIds[0],
        cardNumber: 'CMD-001',
        code: 'CMD20250101001',
        status: 'CASHIER_CLOSED',
        openedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        openedById: receptionistId,
        serviceClosedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        serviceClosedById: stylistId,
        cashierClosedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        cashierClosedById: receptionistId,
        totalGross: '330.00',
        totalDiscounts: '0.00',
        totalNet: '330.00',
      },
      {
        id: 'c0000001-0001-0001-0001-000000000002',
        salonId: salonId,
        clientId: clientIds[1],
        cardNumber: 'CMD-002',
        code: 'CMD20250102001',
        status: 'CASHIER_CLOSED',
        openedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        openedById: receptionistId,
        serviceClosedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        serviceClosedById: stylistId,
        cashierClosedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        cashierClosedById: receptionistId,
        totalGross: '140.00',
        totalDiscounts: '0.00',
        totalNet: '140.00',
      },
      {
        id: 'c0000001-0001-0001-0001-000000000003',
        salonId: salonId,
        clientId: clientIds[2],
        cardNumber: 'CMD-003',
        code: 'CMD20250103001',
        status: 'CASHIER_CLOSED',
        openedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        openedById: receptionistId,
        serviceClosedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        serviceClosedById: stylistId,
        cashierClosedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        cashierClosedById: receptionistId,
        totalGross: '80.00',
        totalDiscounts: '0.00',
        totalNet: '80.00',
      },
      {
        id: 'c0000001-0001-0001-0001-000000000004',
        salonId: salonId,
        clientId: clientIds[3],
        cardNumber: 'CMD-004',
        code: 'CMD20250104001',
        status: 'CASHIER_CLOSED',
        openedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        openedById: receptionistId,
        serviceClosedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        serviceClosedById: stylistId,
        cashierClosedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        cashierClosedById: receptionistId,
        totalGross: '170.00',
        totalDiscounts: '17.00',
        totalNet: '153.00',
      },
      {
        id: 'c0000001-0001-0001-0001-000000000005',
        salonId: salonId,
        clientId: clientIds[4],
        cardNumber: 'CMD-005',
        code: 'CMD20250105001',
        status: 'OPEN',
        openedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        openedById: receptionistId,
        totalGross: '0.00',
        totalDiscounts: '0.00',
        totalNet: '0.00',
      },
    ];

    for (const command of commandsData) {
      await db.insert(commands).values(command).onConflictDoNothing();
    }

    console.log('✅ 5 comandas criadas\n');

    // ========================================
    // 15. CRIAR ITENS DAS COMANDAS
    // ========================================
    console.log('📝 Criando itens das comandas...');

    const commandItemsData = [
      // Comanda 1 - Maria Silva: Coloração + Corte + Hidratação
      {
        id: 'c1a00001-0001-0001-0001-000000000001',
        commandId: 'c0000001-0001-0001-0001-000000000001',
        type: 'SERVICE',
        description: 'Coloração Completa',
        quantity: '1',
        unitPrice: '250.00',
        discount: '0',
        totalPrice: '250.00',
        performerId: stylistId,
        addedById: receptionistId,
      },
      {
        id: 'c1a00001-0001-0001-0001-000000000002',
        commandId: 'c0000001-0001-0001-0001-000000000001',
        type: 'SERVICE',
        description: 'Corte Feminino',
        quantity: '1',
        unitPrice: '80.00',
        discount: '0',
        totalPrice: '80.00',
        performerId: stylistId,
        addedById: receptionistId,
      },
      // Comanda 2 - Ana Santos: Corte + Escova
      {
        id: 'c1a00001-0001-0001-0001-000000000003',
        commandId: 'c0000001-0001-0001-0001-000000000002',
        type: 'SERVICE',
        description: 'Corte Feminino',
        quantity: '1',
        unitPrice: '80.00',
        discount: '0',
        totalPrice: '80.00',
        performerId: stylistId,
        addedById: receptionistId,
      },
      {
        id: 'c1a00001-0001-0001-0001-000000000004',
        commandId: 'c0000001-0001-0001-0001-000000000002',
        type: 'SERVICE',
        description: 'Escova Modeladora',
        quantity: '1',
        unitPrice: '60.00',
        discount: '0',
        totalPrice: '60.00',
        performerId: stylistId,
        addedById: receptionistId,
      },
      // Comanda 3 - Carla Oliveira: Corte
      {
        id: 'c1a00001-0001-0001-0001-000000000005',
        commandId: 'c0000001-0001-0001-0001-000000000003',
        type: 'SERVICE',
        description: 'Corte Feminino',
        quantity: '1',
        unitPrice: '80.00',
        discount: '0',
        totalPrice: '80.00',
        performerId: stylistId,
        addedById: receptionistId,
      },
      // Comanda 4 - Juliana Costa: Corte + Hidratação (com desconto)
      {
        id: 'c1a00001-0001-0001-0001-000000000006',
        commandId: 'c0000001-0001-0001-0001-000000000004',
        type: 'SERVICE',
        description: 'Corte Feminino',
        quantity: '1',
        unitPrice: '80.00',
        discount: '8.00',
        totalPrice: '72.00',
      performerId: stylistId,
        addedById: receptionistId,
      },
      {
        id: 'c1a00001-0001-0001-0001-000000000007',
        commandId: 'c0000001-0001-0001-0001-000000000004',
        type: 'SERVICE',
        description: 'Hidratação Profunda',
        quantity: '1',
        unitPrice: '90.00',
        discount: '9.00',
        totalPrice: '81.00',
        performerId: stylistId,
        addedById: receptionistId,
      },
    ];

    for (const item of commandItemsData) {
      await db.insert(commandItems).values(item).onConflictDoNothing();
    }

    console.log('✅ 7 itens de comanda criados\n');

    // ========================================
    // 16. CRIAR PACOTES DE SESSÕES
    // ========================================
    console.log('🎁 Criando pacotes de sessões...');

    // Buscar IDs dos serviços para vincular aos pacotes
    const hidratacaoService = await db.select({ id: services.id })
      .from(services)
      .where(and(eq(services.salonId, salonId), eq(services.name, 'Hidratação avulsa')))
      .limit(1);

    const nutricaoService = await db.select({ id: services.id })
      .from(services)
      .where(and(eq(services.salonId, salonId), eq(services.name, 'Nutrição')))
      .limit(1);

    const reconstrucaoService = await db.select({ id: services.id })
      .from(services)
      .where(and(eq(services.salonId, salonId), eq(services.name, 'Reconstrução')))
      .limit(1);

    const escovaService = await db.select({ id: services.id })
      .from(services)
      .where(and(eq(services.salonId, salonId), eq(services.name, 'Escova')))
      .limit(1);

    if (hidratacaoService.length > 0 && nutricaoService.length > 0 && reconstrucaoService.length > 0 && escovaService.length > 0) {
      const hidratacaoId = hidratacaoService[0].id;
      const nutricaoId = nutricaoService[0].id;
      const reconstrucaoId = reconstrucaoService[0].id;
      const escovaId = escovaService[0].id;

      // Pacote 1: Cronograma Capilar
      const cronogramaPackageId = 1001;
      await db.insert(packages).values({
        id: cronogramaPackageId,
        salonId: salonId,
        name: 'Cronograma Capilar',
        description: 'Pacote completo com hidratação, nutrição e reconstrução',
        price: '450.00',
        totalSessions: 4,
        expirationDays: 90,
        servicesIncluded: {
          services: [
            { name: 'Hidratação avulsa', quantity: 2 },
            { name: 'Nutrição', quantity: 1 },
            { name: 'Reconstrução', quantity: 1 },
          ]
        },
        active: true,
      }).onConflictDoNothing();

      // Serviços do Pacote Cronograma Capilar
      await db.insert(packageServices).values([
        { salonId, packageId: cronogramaPackageId, serviceId: hidratacaoId, sessionsIncluded: 2 },
        { salonId, packageId: cronogramaPackageId, serviceId: nutricaoId, sessionsIncluded: 1 },
        { salonId, packageId: cronogramaPackageId, serviceId: reconstrucaoId, sessionsIncluded: 1 },
      ]).onConflictDoNothing();

      // Pacote 2: Combo Escova
      const escovaPackageId = 1002;
      await db.insert(packages).values({
        id: escovaPackageId,
        salonId: salonId,
        name: 'Combo Escova',
        description: 'Pacote com 4 sessões de escova',
        price: '250.00',
        totalSessions: 4,
        expirationDays: 60,
        servicesIncluded: {
          services: [
            { name: 'Escova', quantity: 4 },
          ]
        },
        active: true,
      }).onConflictDoNothing();

      // Serviços do Pacote Combo Escova
      await db.insert(packageServices).values([
        { salonId, packageId: escovaPackageId, serviceId: escovaId, sessionsIncluded: 4 },
      ]).onConflictDoNothing();

      console.log('✅ 2 pacotes criados: Cronograma Capilar (R$450), Combo Escova (R$250)\n');

      // ========================================
      // 17. VINCULAR PACOTE À CLIENTE MARIA SILVA
      // ========================================
      console.log('🔗 Vinculando pacote à cliente Maria Silva...');

      const mariaId = clientIds[0]; // Maria Silva
      const clientPackageId = 1;

      // Calcular data de expiração (90 dias a partir de hoje)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90);

      // Criar pacote do cliente
      await db.insert(clientPackages).values({
        id: clientPackageId,
        clientId: mariaId,
        packageId: cronogramaPackageId,
        remainingSessions: 3, // 2 hidratação + 1 nutrição + 0 reconstrução = 3 restantes
        expirationDate: expirationDate.toISOString().split('T')[0],
        active: true,
      }).onConflictDoNothing();

      // Criar saldos por serviço
      await db.insert(clientPackageBalances).values([
        {
          salonId,
          clientPackageId,
          serviceId: hidratacaoId,
          totalSessions: 2,
          remainingSessions: 2, // Ainda não usou hidratação
        },
        {
          salonId,
          clientPackageId,
          serviceId: nutricaoId,
          totalSessions: 1,
          remainingSessions: 1, // Ainda não usou nutrição
        },
        {
          salonId,
          clientPackageId,
          serviceId: reconstrucaoId,
          totalSessions: 1,
          remainingSessions: 0, // Já usou a reconstrução
        },
      ]).onConflictDoNothing();

      // Criar registro de uso da reconstrução (já consumida)
      await db.insert(clientPackageUsages).values({
        salonId,
        clientPackageId,
        serviceId: reconstrucaoId,
        status: 'CONSUMED',
        consumedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        notes: 'Primeira sessão do pacote - Reconstrução',
      }).onConflictDoNothing();

      console.log('✅ Pacote Cronograma Capilar vinculado à Maria Silva\n');
      console.log('   - Hidratação: 2/2 restantes');
      console.log('   - Nutrição: 1/1 restante');
      console.log('   - Reconstrução: 0/1 (já usou)\n');
    } else {
      console.log('⚠️ Serviços não encontrados, pacotes não criados\n');
    }

    // ========================================
    // RESUMO
    // ========================================
    console.log('========================================');
    console.log('🎉 SEED CONCLUÍDO COM SUCESSO!');
    console.log('========================================\n');
    console.log('📋 Usuários criados:');
    console.log('   - owner@salao.com / senhaforte (OWNER)');
    console.log('   - gerente@salao.com / manager123 (MANAGER)');
    console.log('   - profissional@salao.com / stylist123 (STYLIST)');
    console.log('   - recepcao@salao.com / recepcao123 (RECEPTIONIST)');
    console.log('');
    console.log('💳 Assinatura:');
    console.log('   - Plano: Professional (R$199,90/mês)');
    console.log('   - Status: ACTIVE');
    console.log('');
    console.log('👥 Clientes demo:');
    console.log('   - Maria Silva, Ana Santos, Carla Oliveira, Juliana Costa, Fernanda Lima');
    console.log('');
    console.log('✂️ Serviços Padrão (12):');
    console.log('   - Corte (R$100), Corte + Hidratação (R$150)');
    console.log('   - Coloração raiz (R$100), Coloração completa (R$200), Mechas (R$500)');
    console.log('   - Escova (R$70), Alisamento (R$250), Hidratação (R$150)');
    console.log('   - Cronograma capilar 4 sessões (R$450), Camuflagem (R$100)');
    console.log('   - Nutrição (R$120), Reconstrução (R$180)');
    console.log('');
    console.log('🎁 Pacotes de Sessões:');
    console.log('   - Cronograma Capilar (R$450, 90 dias): 2x Hidratação + 1x Nutrição + 1x Reconstrução');
    console.log('   - Combo Escova (R$250, 60 dias): 4x Escova');
    console.log('   - Maria Silva tem pacote ativo com 3 sessões restantes');
    console.log('');
    console.log('📦 Produtos (estoque):');
    console.log('   - Shampoo, Condicionador, Máscara, Esmalte, Óleo Finalizador');
    console.log('');
    console.log('🧾 Comandas:');
    console.log('   - 4 fechadas (últimos 30 dias) + 1 aberta');
    console.log('');
    console.log('👑 Programa de Fidelidade:');
    console.log('   - 4 níveis: Basic, Silver (500pts), Gold (2000pts), VIP (5000pts)');
    console.log('   - 4 recompensas: Desconto R$20, 10% off, Hidratação, Brinde');
    console.log('   - Pontos de boas-vindas: 50 pts');
    console.log('   - Pontos de aniversário: 100 pts');
    console.log('   - Pontos por indicação: 200 pts');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar seed
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
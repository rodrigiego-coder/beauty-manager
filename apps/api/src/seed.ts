import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { salons, users, loyaltyPrograms, loyaltyTiers, loyaltyRewards } from './database/schema';

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
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { salons, users } from './database/schema';

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
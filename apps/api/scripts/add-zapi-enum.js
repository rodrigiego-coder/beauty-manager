const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    console.log('Adicionando ZAPI ao enum whatsapp_provider...');
    await pool.query(`ALTER TYPE whatsapp_provider ADD VALUE IF NOT EXISTS 'ZAPI'`);
    console.log('ZAPI adicionado com sucesso!');

    // Agora cria a configuração do salão
    console.log('\nCriando configuração de automação para o salão...');
    await pool.query(`
      INSERT INTO automation_settings (salon_id, whatsapp_enabled, whatsapp_provider)
      VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, 'ZAPI')
      ON CONFLICT (salon_id) DO UPDATE SET whatsapp_enabled = true, whatsapp_provider = 'ZAPI'
    `);
    console.log('Configuração criada!');
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

main();

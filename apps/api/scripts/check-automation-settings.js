const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    const result = await pool.query(`
      SELECT
        s.name,
        s.slug,
        aut.whatsapp_enabled,
        aut.whatsapp_provider,
        aut.whatsapp_api_key,
        aut.whatsapp_phone_number_id
      FROM salons s
      LEFT JOIN automation_settings aut ON aut.salon_id = s.id
      LIMIT 3
    `);

    console.log('=== CONFIGURAÇÕES DE AUTOMAÇÃO ===\n');
    result.rows.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} (${s.slug || 'sem slug'})`);
      console.log(`   whatsapp_enabled: ${s.whatsapp_enabled}`);
      console.log(`   whatsapp_provider: ${s.whatsapp_provider || 'NULL'}`);
      console.log(`   whatsapp_api_key: ${s.whatsapp_api_key ? s.whatsapp_api_key.substring(0, 10) + '...' : 'NULL'}`);
      console.log(`   whatsapp_phone_number_id: ${s.whatsapp_phone_number_id || 'NULL'}`);
      console.log('');
    });

    // Verifica se o salão demo tem api_key configurada
    if (result.rows.length > 0) {
      const salon = result.rows[0];
      if (salon.whatsapp_enabled && !salon.whatsapp_api_key) {
        console.log('⚠️ PROBLEMA ENCONTRADO:');
        console.log('   O salão tem whatsapp_enabled=true mas whatsapp_api_key=NULL');
        console.log('   O sendMessage() retorna erro "Credenciais do WhatsApp não configuradas."');
        console.log('   E o fallback só funciona para erro "não está habilitado"');
        console.log('\n   SOLUÇÃO: Atualizar o fallback OU configurar uma api_key dummy');
      }
    }

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

check();

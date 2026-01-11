const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    // Check salon
    const salonResult = await pool.query(`
      SELECT id, name, slug FROM salons WHERE slug = 'salao-camila-sanches'
    `);
    console.log('=== SALAO ===');
    console.log(salonResult.rows[0]);

    if (salonResult.rows[0]) {
      const salonId = salonResult.rows[0].id;

      // Check automation settings
      const settingsResult = await pool.query(`
        SELECT
          whatsapp_enabled,
          whatsapp_provider,
          whatsapp_api_key
        FROM automation_settings
        WHERE salon_id = $1
      `, [salonId]);

      console.log('\n=== AUTOMATION SETTINGS ===');
      if (settingsResult.rows.length === 0) {
        console.log('NENHUMA CONFIGURACAO ENCONTRADA!');
        console.log('Criando configuracao padrao com Z-API...');

        await pool.query(`
          INSERT INTO automation_settings (salon_id, whatsapp_enabled, whatsapp_provider)
          VALUES ($1, true, 'ZAPI'::whatsapp_provider)
          ON CONFLICT (salon_id) DO UPDATE SET whatsapp_enabled = true, whatsapp_provider = 'ZAPI'::whatsapp_provider
        `, [salonId]);

        console.log('Configuracao criada com sucesso!');
      } else {
        console.log(settingsResult.rows[0]);
        if (!settingsResult.rows[0].whatsapp_enabled) {
          console.log('\nWhatsApp DESABILITADO! Habilitando...');
          await pool.query(`
            UPDATE automation_settings
            SET whatsapp_enabled = true, whatsapp_provider = 'ZAPI'::whatsapp_provider
            WHERE salon_id = $1
          `, [salonId]);
          console.log('WhatsApp habilitado!');
        }
      }
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

main();

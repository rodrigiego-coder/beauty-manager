const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    // Verifica agendamentos do telefone
    const result = await pool.query(`
      SELECT id, status, confirmation_status, confirmed_at, client_name, date, time, service
      FROM appointments
      WHERE client_phone LIKE '%18997797282%'
      ORDER BY created_at DESC
      LIMIT 3
    `);

    console.log('=== AGENDAMENTOS DO TELEFONE 18997797282 ===\n');

    if (result.rows.length === 0) {
      console.log('Nenhum agendamento encontrado.');
    } else {
      result.rows.forEach((r, i) => {
        console.log(`${i + 1}. ${r.client_name} - ${r.service}`);
        console.log(`   Data: ${r.date} ${r.time}`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Confirmacao: ${r.confirmation_status}`);
        console.log(`   Confirmado em: ${r.confirmed_at || 'N/A'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

check();

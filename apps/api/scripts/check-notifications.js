const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    const result = await pool.query(`
      SELECT
        id,
        notification_type,
        recipient_phone,
        status,
        scheduled_for,
        created_at
      FROM appointment_notifications
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('=== NOTIFICACOES AGENDADAS ===\n');

    if (result.rows.length === 0) {
      console.log('Nenhuma notificacao encontrada.');
    } else {
      result.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.notification_type}`);
        console.log(`   Telefone: ${row.recipient_phone}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Agendada para: ${row.scheduled_for}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

main();

const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    // Verifica agendamentos do telefone
    const result = await pool.query(`
      SELECT
        a.id,
        a.status,
        a.confirmation_status,
        a.confirmed_at,
        a.client_name,
        a.date,
        a.time,
        a.service
      FROM appointments a
      WHERE a.client_phone LIKE '%18997797282%'
      ORDER BY a.created_at DESC
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

    // Verifica notificações enviadas
    const notifications = await pool.query(`
      SELECT
        an.id,
        an.notification_type,
        an.status,
        an.scheduled_for,
        an.sent_at,
        an.provider_message_id,
        an.client_response,
        an.client_responded_at
      FROM appointment_notifications an
      JOIN appointments a ON an.appointment_id = a.id
      WHERE a.client_phone LIKE '%18997797282%'
      ORDER BY an.created_at DESC
      LIMIT 10
    `);

    console.log('\n=== NOTIFICACOES ENVIADAS ===\n');

    if (notifications.rows.length === 0) {
      console.log('Nenhuma notificacao encontrada.');
    } else {
      notifications.rows.forEach((n, i) => {
        console.log(`${i + 1}. Tipo: ${n.notification_type}`);
        console.log(`   Status: ${n.status}`);
        console.log(`   Agendado para: ${n.scheduled_for}`);
        console.log(`   Enviado em: ${n.sent_at || 'N/A'}`);
        console.log(`   Provider ID: ${n.provider_message_id || 'N/A'}`);
        console.log(`   Resposta cliente: ${n.client_response || 'N/A'}`);
        console.log(`   Resposta em: ${n.client_responded_at || 'N/A'}`);
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

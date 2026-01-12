const { Pool } = require('pg');

async function diagnose() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    console.log('=== DIAGNÓSTICO DE NOTIFICAÇÕES ===\n');

    // 1. Verifica agendamentos recentes
    const appointments = await pool.query(`
      SELECT id, client_name, client_phone, status, confirmation_status, source, created_at
      FROM appointments
      WHERE source = 'ONLINE'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('1. AGENDAMENTOS ONLINE RECENTES:');
    if (appointments.rows.length === 0) {
      console.log('   Nenhum agendamento online encontrado.\n');
    } else {
      appointments.rows.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.client_name} (${a.client_phone})`);
        console.log(`      Status: ${a.status} | Confirmação: ${a.confirmation_status}`);
        console.log(`      Criado em: ${a.created_at}`);
        console.log(`      ID: ${a.id}\n`);
      });
    }

    // 2. Verifica notificações desses agendamentos
    if (appointments.rows.length > 0) {
      const appointmentIds = appointments.rows.map(a => `'${a.id}'`).join(',');
      const notifications = await pool.query(`
        SELECT
          an.id, an.appointment_id, an.notification_type, an.status,
          an.scheduled_for, an.sent_at, an.last_error, an.attempts
        FROM appointment_notifications an
        WHERE an.appointment_id IN (${appointmentIds})
        ORDER BY an.created_at DESC
      `);

      console.log('2. NOTIFICAÇÕES DOS AGENDAMENTOS:');
      if (notifications.rows.length === 0) {
        console.log('   ⚠️ NENHUMA NOTIFICAÇÃO CRIADA - Esse é o problema!\n');
      } else {
        notifications.rows.forEach((n, i) => {
          console.log(`   ${i + 1}. ${n.notification_type}`);
          console.log(`      Status: ${n.status}`);
          console.log(`      Agendado para: ${n.scheduled_for}`);
          console.log(`      Enviado em: ${n.sent_at || 'N/A'}`);
          console.log(`      Tentativas: ${n.attempts}`);
          console.log(`      Erro: ${n.last_error || 'N/A'}\n`);
        });
      }
    }

    // 3. Verifica configurações de automação do salão
    const automationSettings = await pool.query(`
      SELECT s.name, s.slug, aut.whatsapp_enabled, aut.whatsapp_provider
      FROM salons s
      LEFT JOIN automation_settings aut ON aut.salon_id = s.id
      LIMIT 5
    `);

    console.log('3. CONFIGURAÇÕES DE AUTOMAÇÃO DOS SALÕES:');
    automationSettings.rows.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (${s.slug || 'sem slug'})`);
      console.log(`      WhatsApp Habilitado: ${s.whatsapp_enabled ?? 'N/A'}`);
      console.log(`      Provider: ${s.whatsapp_provider || 'N/A'}\n`);
    });

    // 4. Verifica notificações pendentes globais
    const pendingNotifications = await pool.query(`
      SELECT COUNT(*) as total, status
      FROM appointment_notifications
      GROUP BY status
    `);

    console.log('4. TOTAL DE NOTIFICAÇÕES POR STATUS:');
    pendingNotifications.rows.forEach(r => {
      console.log(`   ${r.status}: ${r.total}`);
    });

    // 5. Verifica se há erros recentes
    const errors = await pool.query(`
      SELECT notification_type, last_error, COUNT(*) as total
      FROM appointment_notifications
      WHERE last_error IS NOT NULL
      GROUP BY notification_type, last_error
      LIMIT 5
    `);

    console.log('\n5. ERROS RECENTES:');
    if (errors.rows.length === 0) {
      console.log('   Nenhum erro registrado.');
    } else {
      errors.rows.forEach(e => {
        console.log(`   ${e.notification_type}: "${e.last_error}" (${e.total}x)`);
      });
    }

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

diagnose();

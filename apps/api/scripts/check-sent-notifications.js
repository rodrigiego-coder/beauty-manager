const { Pool } = require('pg');

async function check() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    console.log('=== NOTIFICAÇÕES ENVIADAS (ÚLTIMAS 10) ===\n');

    const result = await pool.query(`
      SELECT
        an.id,
        an.notification_type,
        an.recipient_phone,
        an.recipient_name,
        an.status,
        an.scheduled_for,
        an.sent_at,
        an.provider_message_id,
        an.last_error,
        an.attempts,
        an.template_variables
      FROM appointment_notifications an
      WHERE an.status = 'SENT'
      ORDER BY an.sent_at DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('Nenhuma notificação enviada encontrada.');
    } else {
      result.rows.forEach((n, i) => {
        console.log(`${i + 1}. ${n.notification_type}`);
        console.log(`   Para: ${n.recipient_name} (${n.recipient_phone})`);
        console.log(`   Status: ${n.status}`);
        console.log(`   Enviado em: ${n.sent_at}`);
        console.log(`   Provider Message ID: ${n.provider_message_id || 'N/A'}`);
        console.log(`   Erro: ${n.last_error || 'Nenhum'}`);
        console.log(`   Variáveis: ${JSON.stringify(n.template_variables)}`);
        console.log('');
      });
    }

    // Verifica audit logs de WhatsApp
    console.log('\n=== AUDIT LOGS DE WHATSAPP ===\n');

    const auditLogs = await pool.query(`
      SELECT
        al.action,
        al.entity,
        al.entity_id,
        al.metadata,
        al.timestamp
      FROM audit_logs al
      WHERE al.action IN ('WHATSAPP_SENT', 'WHATSAPP_FAILED')
      ORDER BY al.timestamp DESC
      LIMIT 10
    `);

    if (auditLogs.rows.length === 0) {
      console.log('Nenhum log de WhatsApp encontrado.');
    } else {
      auditLogs.rows.forEach((log, i) => {
        console.log(`${i + 1}. ${log.action} - ${log.entity} (${log.entity_id})`);
        console.log(`   Timestamp: ${log.timestamp}`);
        console.log(`   Metadata: ${JSON.stringify(log.metadata)}`);
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

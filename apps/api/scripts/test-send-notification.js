const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    // Busca uma notificação pendente
    const result = await pool.query(`
      SELECT * FROM appointment_notifications
      WHERE status = 'PENDING'
      ORDER BY scheduled_for ASC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('Nenhuma notificação pendente encontrada.');
      return;
    }

    const notification = result.rows[0];
    console.log('Notificação encontrada:');
    console.log('  ID:', notification.id);
    console.log('  Tipo:', notification.notification_type);
    console.log('  Telefone:', notification.recipient_phone);
    console.log('  Agendada para:', notification.scheduled_for);
    console.log('  Status:', notification.status);

    // Tenta enviar via Z-API diretamente
    console.log('\nEnviando via Z-API...');

    const ZAPI_INSTANCE_ID = '3ED0B5528D9891D80423BA5D48A872F2';
    const ZAPI_TOKEN = '92E099EFE1DA1A9F9F2B5521';
    const ZAPI_CLIENT_TOKEN = 'F8f2da73ab5d049ce916c60ece100d6c5S';

    const vars = notification.template_variables || {};
    const message = `Olá ${vars.nome || 'Cliente'}! 👋

Seu agendamento foi registrado:

📅 *${vars.data || 'Data'}* às *${vars.horario || 'Horário'}*
✂️ ${vars.servico || 'Serviço'}
💇 ${vars.profissional || 'Profissional'}

Por favor, confirme sua presença:
👉 Responda *SIM* para confirmar
👉 Responda *NÃO* para cancelar

Obrigado! 💜`;

    const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_CLIENT_TOKEN,
      },
      body: JSON.stringify({
        phone: notification.recipient_phone,
        message: message,
      }),
    });

    const responseText = await response.text();
    console.log('Resposta Z-API:', responseText);

    if (response.ok) {
      // Atualiza status para SENT
      await pool.query(`
        UPDATE appointment_notifications
        SET status = 'SENT', sent_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [notification.id]);
      console.log('\nNotificação marcada como SENT!');
    } else {
      console.log('\nErro ao enviar:', response.status);
    }

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

main();

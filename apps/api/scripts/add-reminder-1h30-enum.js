// Script para adicionar o novo valor de enum ao banco
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    console.log('Adicionando APPOINTMENT_REMINDER_1H30 ao enum...');

    // Verifica se o valor já existe
    const checkResult = await pool.query(`
      SELECT 1 FROM pg_enum
      WHERE enumlabel = 'APPOINTMENT_REMINDER_1H30'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_notification_type')
    `);

    if (checkResult.rows.length > 0) {
      console.log('Valor APPOINTMENT_REMINDER_1H30 já existe no enum.');
    } else {
      await pool.query(`ALTER TYPE appointment_notification_type ADD VALUE 'APPOINTMENT_REMINDER_1H30'`);
      console.log('Valor APPOINTMENT_REMINDER_1H30 adicionado com sucesso!');
    }
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

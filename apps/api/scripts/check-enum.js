const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager'
  });

  try {
    const result = await pool.query(`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'whatsapp_provider')
    `);
    console.log('Valores do enum whatsapp_provider:');
    result.rows.forEach(row => console.log(' -', row.enumlabel));
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

main();

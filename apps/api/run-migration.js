const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager';

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');

    const sqlPath = path.join(__dirname, 'drizzle', '0002_loyalty_program.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    // Continue even if some parts fail (enums might already exist)
    if (error.message.includes('already exists')) {
      console.log('Some objects already exist, continuing...');
    }
  } finally {
    await client.end();
  }
}

runMigration();

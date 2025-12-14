const { Client } = require('pg');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager';

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');
    console.log('Running payment methods migration...\n');

    // Criar tipos se não existirem
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."fee_mode" AS ENUM('PERCENT', 'FIXED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Enum fee_mode verificado');

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."fee_type" AS ENUM('DISCOUNT', 'FEE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Enum fee_type verificado');

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_destination_type" AS ENUM('BANK', 'CARD_MACHINE', 'CASH_DRAWER', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Enum payment_destination_type verificado');

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_method_type" AS ENUM('CASH', 'PIX', 'CARD_CREDIT', 'CARD_DEBIT', 'TRANSFER', 'VOUCHER', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Enum payment_method_type verificado');

    // Criar tabela payment_methods se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
        "name" varchar(100) NOT NULL,
        "type" varchar(30) NOT NULL,
        "fee_type" varchar(20),
        "fee_mode" varchar(20),
        "fee_value" numeric(10, 2) DEFAULT '0',
        "sort_order" integer DEFAULT 0,
        "active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✓ Tabela payment_methods verificada');

    // Criar tabela payment_destinations se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS "payment_destinations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
        "name" varchar(100) NOT NULL,
        "type" varchar(30) NOT NULL,
        "bank_name" varchar(100),
        "last_digits" varchar(10),
        "description" text,
        "fee_type" varchar(20),
        "fee_mode" varchar(20),
        "fee_value" numeric(10, 2) DEFAULT '0',
        "sort_order" integer DEFAULT 0,
        "active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✓ Tabela payment_destinations verificada');

    // Adicionar colunas em command_payments se não existirem
    const alterCommands = [
      { sql: `ALTER TABLE "command_payments" ALTER COLUMN "method" DROP NOT NULL`, desc: 'method DROP NOT NULL' },
      { sql: `ALTER TABLE "command_payments" ADD COLUMN IF NOT EXISTS "payment_method_id" uuid REFERENCES "payment_methods"("id")`, desc: 'payment_method_id' },
      { sql: `ALTER TABLE "command_payments" ADD COLUMN IF NOT EXISTS "payment_destination_id" uuid REFERENCES "payment_destinations"("id")`, desc: 'payment_destination_id' },
      { sql: `ALTER TABLE "command_payments" ADD COLUMN IF NOT EXISTS "gross_amount" numeric(10, 2)`, desc: 'gross_amount' },
      { sql: `ALTER TABLE "command_payments" ADD COLUMN IF NOT EXISTS "fee_amount" numeric(10, 2) DEFAULT '0'`, desc: 'fee_amount' },
      { sql: `ALTER TABLE "command_payments" ADD COLUMN IF NOT EXISTS "net_amount" numeric(10, 2)`, desc: 'net_amount' },
    ];

    for (const { sql, desc } of alterCommands) {
      try {
        await client.query(sql);
        console.log(`✓ Coluna ${desc} OK`);
      } catch (err) {
        if (err.code === '42701' || err.code === '42P07' || err.message.includes('already exists')) {
          console.log(`⚠ ${desc} já existe, pulando...`);
        } else {
          console.error(`❌ Erro em ${desc}:`, err.message);
        }
      }
    }

    // Migrar dados existentes (preencher gross/net com amount se null)
    const result = await client.query(`
      UPDATE "command_payments"
      SET
        "gross_amount" = "amount",
        "net_amount" = "amount",
        "fee_amount" = 0
      WHERE "gross_amount" IS NULL;
    `);
    console.log(`✓ Dados existentes migrados (${result.rowCount} registros atualizados)`);

    // Criar índices para performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_methods_salon" ON "payment_methods" ("salon_id");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_methods_active" ON "payment_methods" ("salon_id", "active");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_destinations_salon" ON "payment_destinations" ("salon_id");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_destinations_active" ON "payment_destinations" ("salon_id", "active");
    `);
    console.log('✓ Índices criados');

    console.log('\n✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration();

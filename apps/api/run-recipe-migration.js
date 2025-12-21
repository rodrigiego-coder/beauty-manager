const { Client } = require('pg');

const DATABASE_URL = 'postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager';

async function runMigration() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Create variant_code enum
    console.log('\n1. Creating variant_code enum...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."variant_code" AS ENUM('DEFAULT', 'SHORT', 'MEDIUM', 'LONG', 'EXTRA_LONG', 'CUSTOM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('   ✓ variant_code enum created');

    // 2. Create recipe_status enum if not exists
    console.log('\n2. Creating recipe_status enum...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."recipe_status" AS ENUM('ACTIVE', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('   ✓ recipe_status enum created');

    // 3. Create inventory_locations table
    console.log('\n3. Creating inventory_locations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "inventory_locations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
        "code" varchar(20) NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ inventory_locations table created');

    // 4. Create service_recipes table
    console.log('\n4. Creating service_recipes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "service_recipes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
        "service_id" integer NOT NULL REFERENCES "services"("id"),
        "version" integer DEFAULT 1 NOT NULL,
        "status" "recipe_status" DEFAULT 'ACTIVE' NOT NULL,
        "effective_from" date DEFAULT now() NOT NULL,
        "notes" text,
        "estimated_cost" numeric(10, 2),
        "target_margin_percent" numeric(5, 2) DEFAULT '60',
        "created_by_id" uuid REFERENCES "users"("id"),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ service_recipes table created');

    // 5. Create service_recipe_lines table
    console.log('\n5. Creating service_recipe_lines table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "service_recipe_lines" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "recipe_id" uuid NOT NULL REFERENCES "service_recipes"("id") ON DELETE CASCADE,
        "product_id" integer NOT NULL REFERENCES "products"("id"),
        "product_group_id" uuid,
        "quantity_standard" numeric(10, 3) NOT NULL,
        "quantity_buffer" numeric(10, 3) DEFAULT '0' NOT NULL,
        "unit" varchar(10) NOT NULL,
        "is_required" boolean DEFAULT true NOT NULL,
        "notes" text,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ service_recipe_lines table created');

    // 6. Create recipe_variants table
    console.log('\n6. Creating recipe_variants table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "recipe_variants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "recipe_id" uuid NOT NULL REFERENCES "service_recipes"("id") ON DELETE CASCADE,
        "code" "variant_code" NOT NULL,
        "name" varchar(50) NOT NULL,
        "multiplier" numeric(3, 2) DEFAULT '1' NOT NULL,
        "is_default" boolean DEFAULT false NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ recipe_variants table created');

    // 7. Create product_groups table
    console.log('\n7. Creating product_groups table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "product_groups" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
        "name" varchar(100) NOT NULL,
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ product_groups table created');

    // 8. Create product_group_items table
    console.log('\n8. Creating product_group_items table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "product_group_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "group_id" uuid NOT NULL REFERENCES "product_groups"("id") ON DELETE CASCADE,
        "product_id" integer NOT NULL REFERENCES "products"("id"),
        "priority" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ product_group_items table created');

    // 9. Create command_consumption_snapshots table
    console.log('\n9. Creating command_consumption_snapshots table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "command_consumption_snapshots" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
        "command_id" uuid NOT NULL REFERENCES "commands"("id"),
        "command_item_id" uuid NOT NULL REFERENCES "command_items"("id"),
        "service_id" integer NOT NULL REFERENCES "services"("id"),
        "recipe_id" uuid REFERENCES "service_recipes"("id"),
        "recipe_version" integer,
        "variant_code" "variant_code" DEFAULT 'DEFAULT',
        "variant_multiplier" numeric(3, 2) DEFAULT '1',
        "product_id" integer NOT NULL REFERENCES "products"("id"),
        "product_name" varchar(255) NOT NULL,
        "quantity_standard" numeric(10, 3) NOT NULL,
        "quantity_buffer" numeric(10, 3) NOT NULL,
        "quantity_applied" numeric(10, 3) NOT NULL,
        "unit" varchar(10) NOT NULL,
        "cost_at_time" numeric(10, 2) NOT NULL,
        "total_cost" numeric(10, 2) NOT NULL,
        "stock_movement_id" uuid REFERENCES "stock_movements"("id"),
        "posted_at" timestamp,
        "cancelled_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ command_consumption_snapshots table created');

    // 10. Add variant_id to command_items
    console.log('\n10. Adding variant_id to command_items...');
    await client.query(`
      ALTER TABLE "command_items"
        ADD COLUMN IF NOT EXISTS "variant_id" uuid REFERENCES "recipe_variants"("id");
    `);
    console.log('   ✓ variant_id column added to command_items');

    // 11. Add product_group_id FK to service_recipe_lines
    console.log('\n11. Adding FK constraint for product_group_id...');
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "service_recipe_lines"
          ADD CONSTRAINT "service_recipe_lines_product_group_id_fkey"
          FOREIGN KEY ("product_group_id") REFERENCES "product_groups"("id");
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('   ✓ FK constraint added');

    // 12. Create indexes
    console.log('\n12. Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "recipe_variants_recipe_id_idx" ON "recipe_variants"("recipe_id");
      CREATE INDEX IF NOT EXISTS "product_groups_salon_id_idx" ON "product_groups"("salon_id");
      CREATE INDEX IF NOT EXISTS "product_group_items_group_id_idx" ON "product_group_items"("group_id");
      CREATE INDEX IF NOT EXISTS "product_group_items_product_id_idx" ON "product_group_items"("product_id");
      CREATE INDEX IF NOT EXISTS "command_items_variant_id_idx" ON "command_items"("variant_id");
      CREATE INDEX IF NOT EXISTS "service_recipes_salon_id_idx" ON "service_recipes"("salon_id");
      CREATE INDEX IF NOT EXISTS "service_recipes_service_id_idx" ON "service_recipes"("service_id");
      CREATE INDEX IF NOT EXISTS "service_recipe_lines_recipe_id_idx" ON "service_recipe_lines"("recipe_id");
      CREATE INDEX IF NOT EXISTS "command_consumption_snapshots_command_id_idx" ON "command_consumption_snapshots"("command_id");
    `);
    console.log('   ✓ Indexes created');

    console.log('\n========================================');
    console.log('Migration completed successfully!');
    console.log('========================================');

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

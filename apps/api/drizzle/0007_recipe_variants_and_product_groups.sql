-- Migration: Recipe Variants and Product Groups
-- Description: Adds versioned recipes system with variants (SHORT/MEDIUM/LONG) and product substitution groups

-- =====================================================
-- 1. CREATE ENUM: variant_code
-- =====================================================
DO $$ BEGIN
  CREATE TYPE "public"."variant_code" AS ENUM('DEFAULT', 'SHORT', 'MEDIUM', 'LONG', 'EXTRA_LONG', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. ALTER TABLE: service_recipes (add pricing fields)
-- =====================================================
ALTER TABLE "service_recipes"
  ADD COLUMN IF NOT EXISTS "estimated_cost" numeric(10, 2),
  ADD COLUMN IF NOT EXISTS "target_margin_percent" numeric(5, 2) DEFAULT '60';

-- =====================================================
-- 3. ALTER TABLE: service_recipe_lines (add product group reference)
-- =====================================================
ALTER TABLE "service_recipe_lines"
  ADD COLUMN IF NOT EXISTS "product_group_id" uuid;

-- =====================================================
-- 4. ALTER TABLE: command_consumption_snapshots (add variant and product fields)
-- =====================================================
ALTER TABLE "command_consumption_snapshots"
  ADD COLUMN IF NOT EXISTS "variant_code" "variant_code" DEFAULT 'DEFAULT',
  ADD COLUMN IF NOT EXISTS "variant_multiplier" numeric(3, 2) DEFAULT '1',
  ADD COLUMN IF NOT EXISTS "product_name" varchar(255),
  ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp;

-- Update existing rows to have a default product_name if null
UPDATE "command_consumption_snapshots"
SET "product_name" = 'Produto'
WHERE "product_name" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "command_consumption_snapshots"
  ALTER COLUMN "product_name" SET NOT NULL;

-- =====================================================
-- 5. CREATE TABLE: recipe_variants
-- =====================================================
CREATE TABLE IF NOT EXISTS "recipe_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "recipe_id" uuid NOT NULL,
  "code" "variant_code" NOT NULL,
  "name" varchar(50) NOT NULL,
  "multiplier" numeric(3, 2) DEFAULT '1' NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "recipe_variants_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "service_recipes"("id") ON DELETE CASCADE
);

-- =====================================================
-- 6. CREATE TABLE: product_groups
-- =====================================================
CREATE TABLE IF NOT EXISTS "product_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "product_groups_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salons"("id")
);

-- =====================================================
-- 7. CREATE TABLE: product_group_items
-- =====================================================
CREATE TABLE IF NOT EXISTS "product_group_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid NOT NULL,
  "product_id" integer NOT NULL,
  "priority" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "product_group_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "product_groups"("id") ON DELETE CASCADE,
  CONSTRAINT "product_group_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

-- =====================================================
-- 8. ALTER TABLE: command_items (add variant reference)
-- =====================================================
ALTER TABLE "command_items"
  ADD COLUMN IF NOT EXISTS "variant_id" uuid;

-- Add foreign key constraint
DO $$ BEGIN
  ALTER TABLE "command_items"
    ADD CONSTRAINT "command_items_variant_id_fkey"
    FOREIGN KEY ("variant_id") REFERENCES "recipe_variants"("id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 9. ADD FOREIGN KEY: service_recipe_lines.product_group_id
-- =====================================================
DO $$ BEGIN
  ALTER TABLE "service_recipe_lines"
    ADD CONSTRAINT "service_recipe_lines_product_group_id_fkey"
    FOREIGN KEY ("product_group_id") REFERENCES "product_groups"("id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 10. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS "recipe_variants_recipe_id_idx" ON "recipe_variants"("recipe_id");
CREATE INDEX IF NOT EXISTS "product_groups_salon_id_idx" ON "product_groups"("salon_id");
CREATE INDEX IF NOT EXISTS "product_group_items_group_id_idx" ON "product_group_items"("group_id");
CREATE INDEX IF NOT EXISTS "product_group_items_product_id_idx" ON "product_group_items"("product_id");
CREATE INDEX IF NOT EXISTS "command_items_variant_id_idx" ON "command_items"("variant_id");

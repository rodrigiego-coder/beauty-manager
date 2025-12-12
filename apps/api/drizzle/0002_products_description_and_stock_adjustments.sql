-- Migration: Add description to products and create stock_adjustments table
-- Date: 2025-12-10

-- Add description column to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" text;

-- Create enum for stock adjustment type
DO $$ BEGIN
    CREATE TYPE "stock_adjustment_type" AS ENUM('IN', 'OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create stock_adjustments table
CREATE TABLE IF NOT EXISTS "stock_adjustments" (
    "id" serial PRIMARY KEY NOT NULL,
    "product_id" integer NOT NULL,
    "salon_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "type" "stock_adjustment_type" NOT NULL,
    "quantity" integer NOT NULL,
    "previous_stock" integer NOT NULL,
    "new_stock" integer NOT NULL,
    "reason" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys if they don't exist
DO $$ BEGIN
    ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "salons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "stock_adjustments_product_id_idx" ON "stock_adjustments" ("product_id");
CREATE INDEX IF NOT EXISTS "stock_adjustments_salon_id_idx" ON "stock_adjustments" ("salon_id");
CREATE INDEX IF NOT EXISTS "products_salon_id_idx" ON "products" ("salon_id");

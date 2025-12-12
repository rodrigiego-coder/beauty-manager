-- Migration: Add Cash Registers System
-- Date: 2025-12-10

-- Create cash_registers table
CREATE TABLE IF NOT EXISTS "cash_registers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
    "status" varchar(20) DEFAULT 'OPEN' NOT NULL,
    "opening_balance" decimal(10, 2) DEFAULT '0' NOT NULL,
    "closing_balance" decimal(10, 2),
    "expected_balance" decimal(10, 2),
    "difference" decimal(10, 2),
    "total_sales" decimal(10, 2) DEFAULT '0' NOT NULL,
    "total_cash" decimal(10, 2) DEFAULT '0' NOT NULL,
    "total_card" decimal(10, 2) DEFAULT '0' NOT NULL,
    "total_pix" decimal(10, 2) DEFAULT '0' NOT NULL,
    "total_withdrawals" decimal(10, 2) DEFAULT '0' NOT NULL,
    "total_deposits" decimal(10, 2) DEFAULT '0' NOT NULL,
    "opened_at" timestamp DEFAULT now() NOT NULL,
    "opened_by_id" uuid NOT NULL REFERENCES "users"("id"),
    "closed_at" timestamp,
    "closed_by_id" uuid REFERENCES "users"("id"),
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create cash_movements table (sangrias e suprimentos)
CREATE TABLE IF NOT EXISTS "cash_movements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "cash_register_id" uuid NOT NULL REFERENCES "cash_registers"("id"),
    "type" varchar(20) NOT NULL,
    "amount" decimal(10, 2) NOT NULL,
    "reason" text NOT NULL,
    "performed_by_id" uuid NOT NULL REFERENCES "users"("id"),
    "performed_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_cash_registers_salon_status" ON "cash_registers" ("salon_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cash_registers_opened_at" ON "cash_registers" ("opened_at");
CREATE INDEX IF NOT EXISTS "idx_cash_movements_register" ON "cash_movements" ("cash_register_id");

-- Migration: Loyalty Program & Gamification Module
-- Created at: 2025-12-11

-- Create enums
DO $$ BEGIN
  CREATE TYPE "loyalty_transaction_type" AS ENUM ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'BONUS', 'REFERRAL', 'BIRTHDAY', 'WELCOME');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "reward_type" AS ENUM ('DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "redemption_status" AS ENUM ('PENDING', 'USED', 'EXPIRED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "marketing_event_type" AS ENUM ('POINTS_EARNED', 'POINTS_REDEEMED', 'TIER_UPGRADED', 'REWARD_CLAIMED', 'REFERRAL_SIGNUP', 'REFERRAL_CONVERTED', 'CAMPAIGN_CLICK', 'CAMPAIGN_CONVERSION');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create loyalty_programs table
CREATE TABLE IF NOT EXISTS "loyalty_programs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" uuid NOT NULL UNIQUE REFERENCES "salons"("id"),
  "name" varchar(100) DEFAULT 'Programa de Fidelidade' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "points_per_real_service" decimal(5, 2) DEFAULT '1' NOT NULL,
  "points_per_real_product" decimal(5, 2) DEFAULT '1' NOT NULL,
  "points_expire_days" integer,
  "minimum_redeem_points" integer DEFAULT 100 NOT NULL,
  "welcome_points" integer DEFAULT 0 NOT NULL,
  "birthday_points" integer DEFAULT 0 NOT NULL,
  "referral_points" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create loyalty_tiers table
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "program_id" uuid NOT NULL REFERENCES "loyalty_programs"("id"),
  "name" varchar(50) NOT NULL,
  "code" varchar(20) NOT NULL,
  "min_points" integer DEFAULT 0 NOT NULL,
  "color" varchar(20) DEFAULT '#6B7280' NOT NULL,
  "icon" varchar(50),
  "benefits" json DEFAULT '{}',
  "points_multiplier" decimal(3, 2) DEFAULT '1' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create loyalty_rewards table
CREATE TABLE IF NOT EXISTS "loyalty_rewards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
  "program_id" uuid NOT NULL REFERENCES "loyalty_programs"("id"),
  "name" varchar(100) NOT NULL,
  "description" text,
  "type" varchar(30) NOT NULL,
  "points_cost" integer NOT NULL,
  "value" decimal(10, 2),
  "product_id" integer REFERENCES "products"("id"),
  "service_id" integer REFERENCES "services"("id"),
  "min_tier" varchar(20),
  "max_redemptions_per_client" integer,
  "total_available" integer,
  "valid_days" integer DEFAULT 30 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "image_url" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create client_loyalty_accounts table
CREATE TABLE IF NOT EXISTS "client_loyalty_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
  "client_id" uuid NOT NULL UNIQUE REFERENCES "clients"("id"),
  "program_id" uuid NOT NULL REFERENCES "loyalty_programs"("id"),
  "current_points" integer DEFAULT 0 NOT NULL,
  "total_points_earned" integer DEFAULT 0 NOT NULL,
  "total_points_redeemed" integer DEFAULT 0 NOT NULL,
  "current_tier_id" uuid REFERENCES "loyalty_tiers"("id"),
  "tier_achieved_at" timestamp,
  "next_tier_progress" integer DEFAULT 0 NOT NULL,
  "referral_code" varchar(20) NOT NULL UNIQUE,
  "referred_by_id" uuid REFERENCES "clients"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL REFERENCES "client_loyalty_accounts"("id"),
  "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
  "type" varchar(20) NOT NULL,
  "points" integer NOT NULL,
  "balance" integer NOT NULL,
  "description" varchar(255) NOT NULL,
  "command_id" uuid REFERENCES "commands"("id"),
  "appointment_id" uuid REFERENCES "appointments"("id"),
  "reward_id" uuid REFERENCES "loyalty_rewards"("id"),
  "expires_at" timestamp,
  "created_by_id" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create loyalty_redemptions table
CREATE TABLE IF NOT EXISTS "loyalty_redemptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL REFERENCES "client_loyalty_accounts"("id"),
  "reward_id" uuid NOT NULL REFERENCES "loyalty_rewards"("id"),
  "transaction_id" uuid NOT NULL REFERENCES "loyalty_transactions"("id"),
  "points_spent" integer NOT NULL,
  "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
  "code" varchar(20) NOT NULL UNIQUE,
  "used_at" timestamp,
  "used_in_command_id" uuid REFERENCES "commands"("id"),
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create marketing_events table
CREATE TABLE IF NOT EXISTS "marketing_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" uuid NOT NULL REFERENCES "salons"("id"),
  "client_id" uuid REFERENCES "clients"("id"),
  "type" varchar(30) NOT NULL,
  "context" json DEFAULT '{}',
  "value" decimal(10, 2),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_loyalty_tiers_program" ON "loyalty_tiers"("program_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_rewards_program" ON "loyalty_rewards"("program_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_rewards_salon" ON "loyalty_rewards"("salon_id");
CREATE INDEX IF NOT EXISTS "idx_client_loyalty_accounts_client" ON "client_loyalty_accounts"("client_id");
CREATE INDEX IF NOT EXISTS "idx_client_loyalty_accounts_salon" ON "client_loyalty_accounts"("salon_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_account" ON "loyalty_transactions"("account_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_salon" ON "loyalty_transactions"("salon_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_redemptions_account" ON "loyalty_redemptions"("account_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_redemptions_status" ON "loyalty_redemptions"("status");
CREATE INDEX IF NOT EXISTS "idx_marketing_events_salon" ON "marketing_events"("salon_id");
CREATE INDEX IF NOT EXISTS "idx_marketing_events_type" ON "marketing_events"("type");
CREATE INDEX IF NOT EXISTS "idx_marketing_events_created" ON "marketing_events"("created_at");

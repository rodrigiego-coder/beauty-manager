-- Fix subscription_status enum: rename TRIAL to TRIALING and add new values
-- First, update existing data
UPDATE "subscriptions" SET "status" = 'ACTIVE' WHERE "status" = 'TRIAL';

-- Add new enum values if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TRIALING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')) THEN
    ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'TRIALING';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PAST_DUE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')) THEN
    ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'PAST_DUE';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUSPENDED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')) THEN
    ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'SUSPENDED';
  END IF;
END $$;

-- Add SUPER_ADMIN to user_role enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
  END IF;
END $$;

-- Create billing_period enum if not exists
DO $$ BEGIN
  CREATE TYPE "billing_period" AS ENUM('MONTHLY', 'YEARLY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create invoice_status enum if not exists
DO $$ BEGIN
  CREATE TYPE "invoice_status" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_method enum if not exists
DO $$ BEGIN
  CREATE TYPE "payment_method" AS ENUM('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_status enum if not exists
DO $$ BEGIN
  CREATE TYPE "payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create subscription_event_type enum if not exists
DO $$ BEGIN
  CREATE TYPE "subscription_event_type" AS ENUM('CREATED', 'ACTIVATED', 'PLAN_CHANGED', 'STATUS_CHANGED', 'INVOICE_CREATED', 'PAYMENT_RECEIVED', 'SUSPENDED', 'REACTIVATED', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create plans table if not exists
CREATE TABLE IF NOT EXISTS "plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(50) NOT NULL UNIQUE,
  "name" varchar(100) NOT NULL,
  "description" text,
  "price_monthly" decimal(10, 2) NOT NULL,
  "price_yearly" decimal(10, 2),
  "features" jsonb DEFAULT '{}',
  "max_appointments" integer,
  "max_team_members" integer,
  "max_products" integer,
  "is_active" boolean DEFAULT true NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create salon_subscriptions table if not exists
CREATE TABLE IF NOT EXISTS "salon_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" integer NOT NULL REFERENCES "salons"("id") ON DELETE CASCADE,
  "plan_id" uuid NOT NULL REFERENCES "plans"("id"),
  "status" "subscription_status" DEFAULT 'TRIALING' NOT NULL,
  "billing_period" "billing_period" DEFAULT 'MONTHLY' NOT NULL,
  "current_period_start" timestamp NOT NULL,
  "current_period_end" timestamp NOT NULL,
  "trial_ends_at" timestamp,
  "cancel_at_period_end" boolean DEFAULT false NOT NULL,
  "canceled_at" timestamp,
  "mercado_pago_subscription_id" varchar(255),
  "mercado_pago_customer_id" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("salon_id")
);

-- Create subscription_invoices table if not exists
CREATE TABLE IF NOT EXISTS "subscription_invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "subscription_id" uuid NOT NULL REFERENCES "salon_subscriptions"("id") ON DELETE CASCADE,
  "salon_id" integer NOT NULL REFERENCES "salons"("id") ON DELETE CASCADE,
  "invoice_number" varchar(50) NOT NULL UNIQUE,
  "reference_period_start" timestamp NOT NULL,
  "reference_period_end" timestamp NOT NULL,
  "due_date" timestamp NOT NULL,
  "total_amount" decimal(10, 2) NOT NULL,
  "status" "invoice_status" DEFAULT 'PENDING' NOT NULL,
  "paid_at" timestamp,
  "mercado_pago_payment_id" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create invoice_payments table if not exists
CREATE TABLE IF NOT EXISTS "invoice_payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" uuid NOT NULL REFERENCES "subscription_invoices"("id") ON DELETE CASCADE,
  "amount" decimal(10, 2) NOT NULL,
  "payment_method" "payment_method" NOT NULL,
  "status" "payment_status" DEFAULT 'PENDING' NOT NULL,
  "mercado_pago_payment_id" varchar(255),
  "transaction_id" varchar(255),
  "pix_qr_code" text,
  "pix_qr_code_base64" text,
  "paid_at" timestamp,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create subscription_events table if not exists
CREATE TABLE IF NOT EXISTS "subscription_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "subscription_id" uuid NOT NULL REFERENCES "salon_subscriptions"("id") ON DELETE CASCADE,
  "type" "subscription_event_type" NOT NULL,
  "previous_value" varchar(255),
  "new_value" varchar(255),
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_salon_subscriptions_salon_id" ON "salon_subscriptions"("salon_id");
CREATE INDEX IF NOT EXISTS "idx_salon_subscriptions_status" ON "salon_subscriptions"("status");
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_subscription_id" ON "subscription_invoices"("subscription_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_salon_id" ON "subscription_invoices"("salon_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_status" ON "subscription_invoices"("status");
CREATE INDEX IF NOT EXISTS "idx_invoice_payments_invoice_id" ON "invoice_payments"("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_events_subscription_id" ON "subscription_events"("subscription_id");

-- Migration: Online Booking Additional Fields
-- Adds missing columns to online_booking_settings table

-- =============================================
-- Step 1: Create new enums
-- =============================================
DO $$ BEGIN
    CREATE TYPE operation_mode AS ENUM ('SECRETARY_ONLY', 'SECRETARY_AND_ONLINE', 'SECRETARY_WITH_LINK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_applies_to AS ENUM ('ALL', 'NEW_CLIENTS', 'SPECIFIC_SERVICES', 'SELECTED_CLIENTS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Step 2: Add new columns to online_booking_settings
-- =============================================

-- Modo de operacao
ALTER TABLE online_booking_settings
ADD COLUMN IF NOT EXISTS operation_mode operation_mode DEFAULT 'SECRETARY_ONLY';

-- Intervalo entre slots
ALTER TABLE online_booking_settings
ADD COLUMN IF NOT EXISTS slot_interval_minutes INTEGER DEFAULT 30;

-- Permitir agendamento no mesmo dia
ALTER TABLE online_booking_settings
ADD COLUMN IF NOT EXISTS allow_same_day_booking BOOLEAN DEFAULT true;

-- Politica de cancelamento (texto)
ALTER TABLE online_booking_settings
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;

-- A quem o deposito se aplica
ALTER TABLE online_booking_settings
ADD COLUMN IF NOT EXISTS deposit_applies_to deposit_applies_to DEFAULT 'ALL';

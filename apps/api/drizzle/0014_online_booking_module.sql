-- Migration: Online Booking Module
-- Creates all necessary tables and columns for the online booking feature

-- =============================================
-- Step 1: Add slug column to salons table
-- =============================================
ALTER TABLE salons ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons (slug) WHERE slug IS NOT NULL;

-- =============================================
-- Step 2: Create enums for online booking
-- =============================================
DO $$ BEGIN
    CREATE TYPE hold_status AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'RELEASED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_type AS ENUM ('PHONE_VERIFICATION', 'BOOKING_CONFIRMATION', 'CANCEL_BOOKING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FORFEITED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_rule_type AS ENUM ('BLOCKED', 'VIP_ONLY', 'DEPOSIT_REQUIRED', 'RESTRICTED_SERVICES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Step 3: Create online_booking_settings table
-- =============================================
CREATE TABLE IF NOT EXISTS online_booking_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,

    -- Configuracoes de tempo
    min_advance_hours INTEGER NOT NULL DEFAULT 2,
    max_advance_days INTEGER NOT NULL DEFAULT 30,
    hold_duration_minutes INTEGER NOT NULL DEFAULT 10,
    cancellation_hours INTEGER NOT NULL DEFAULT 24,
    allow_rescheduling BOOLEAN NOT NULL DEFAULT true,
    max_reschedules INTEGER NOT NULL DEFAULT 2,

    -- Verificacao
    require_phone_verification BOOLEAN NOT NULL DEFAULT true,

    -- Deposito/Taxa
    require_deposit BOOLEAN NOT NULL DEFAULT false,
    deposit_type VARCHAR(20) DEFAULT 'FIXED',
    deposit_value DECIMAL(10,2) DEFAULT 0,
    deposit_min_services DECIMAL(10,2) DEFAULT 100,

    -- Novos clientes
    allow_new_clients BOOLEAN NOT NULL DEFAULT true,
    new_client_requires_approval BOOLEAN NOT NULL DEFAULT false,
    new_client_deposit_required BOOLEAN NOT NULL DEFAULT false,

    -- Limites
    max_daily_bookings INTEGER,
    max_weekly_bookings_per_client INTEGER DEFAULT 3,

    -- Mensagens
    welcome_message TEXT,
    confirmation_message TEXT,
    cancellation_message TEXT,

    -- Termos
    terms_url TEXT,
    require_terms_acceptance BOOLEAN DEFAULT false,

    -- WhatsApp
    send_whatsapp_confirmation BOOLEAN DEFAULT true,
    send_whatsapp_reminder BOOLEAN DEFAULT true,
    reminder_hours_before INTEGER DEFAULT 24,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 4: Create appointment_holds table
-- =============================================
CREATE TABLE IF NOT EXISTS appointment_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,

    date VARCHAR(10) NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,

    client_phone VARCHAR(20) NOT NULL,
    client_name VARCHAR(255),
    client_id UUID REFERENCES clients(id),

    status hold_status NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP NOT NULL,

    session_id VARCHAR(100),
    client_ip VARCHAR(45),

    appointment_id UUID,
    converted_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 5: Create otp_codes table
-- =============================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

    type otp_type NOT NULL,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,

    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,

    hold_id UUID,
    appointment_id UUID,
    client_ip VARCHAR(45),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 6: Create client_booking_rules table
-- =============================================
CREATE TABLE IF NOT EXISTS client_booking_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

    client_phone VARCHAR(20),
    client_id UUID REFERENCES clients(id),

    rule_type booking_rule_type NOT NULL,
    reason TEXT,
    restricted_service_ids JSONB,

    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP,

    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 7: Create appointment_deposits table
-- =============================================
CREATE TABLE IF NOT EXISTS appointment_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    appointment_id UUID,
    client_id UUID REFERENCES clients(id),

    amount DECIMAL(10,2) NOT NULL,
    status deposit_status NOT NULL DEFAULT 'PENDING',

    pix_code TEXT,
    pix_qr_code TEXT,
    pix_expires_at TIMESTAMP,

    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    forfeited_at TIMESTAMP,

    refund_reason TEXT,
    forfeit_reason TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 8: Add online booking fields to appointments
-- =============================================
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hold_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS verified_phone BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_access_token UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_access_token_expires_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booked_online_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rescheduled_from_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rescheduled_to_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;

-- =============================================
-- Step 9: Create indexes
-- =============================================

-- Indexes on appointment_holds
CREATE INDEX IF NOT EXISTS idx_appointment_holds_availability
ON appointment_holds (salon_id, professional_id, date, start_time, end_time)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_appointment_holds_expires_at
ON appointment_holds (expires_at)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_appointment_holds_session
ON appointment_holds (session_id)
WHERE session_id IS NOT NULL AND status = 'ACTIVE';

-- Indexes on otp_codes
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_type
ON otp_codes (phone, type)
WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at
ON otp_codes (expires_at)
WHERE used_at IS NULL;

-- Indexes on client_booking_rules
CREATE INDEX IF NOT EXISTS idx_client_booking_rules_phone
ON client_booking_rules (salon_id, client_phone)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_client_booking_rules_client_id
ON client_booking_rules (salon_id, client_id)
WHERE is_active = true AND client_id IS NOT NULL;

-- Indexes on appointment_deposits
CREATE INDEX IF NOT EXISTS idx_appointment_deposits_pending
ON appointment_deposits (salon_id, status)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_appointment_deposits_appointment
ON appointment_deposits (appointment_id)
WHERE appointment_id IS NOT NULL;

-- Index on online_booking_settings
CREATE INDEX IF NOT EXISTS idx_online_booking_settings_enabled
ON online_booking_settings (salon_id)
WHERE enabled = true;

-- Indexes on appointments for online booking
CREATE INDEX IF NOT EXISTS idx_appointments_hold_id
ON appointments (hold_id)
WHERE hold_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_client_access_token
ON appointments (client_access_token)
WHERE client_access_token IS NOT NULL;

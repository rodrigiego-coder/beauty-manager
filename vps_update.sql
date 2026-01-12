-- ==============================================
-- BEAUTY MANAGER - ATUALIZAÇÃO DE BANCO VPS
-- Versão consolidada para Online Booking
-- ==============================================

-- =============================================
-- PARTE 1: ENUMS
-- =============================================

DO $$ BEGIN
    CREATE TYPE hold_status AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'RELEASED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_type AS ENUM ('PHONE_VERIFICATION', 'BOOKING_CONFIRMATION', 'CANCEL_BOOKING');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FORFEITED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_rule_type AS ENUM ('BLOCKED', 'VIP_ONLY', 'DEPOSIT_REQUIRED', 'RESTRICTED_SERVICES');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE operation_mode AS ENUM ('SECRETARY_ONLY', 'SECRETARY_AND_ONLINE', 'SECRETARY_WITH_LINK');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_applies_to AS ENUM ('ALL', 'NEW_CLIENTS', 'SPECIFIC_SERVICES', 'SELECTED_CLIENTS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('PENDING', 'SCHEDULED', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_notification_type AS ENUM (
        'APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_1H',
        'APPOINTMENT_REMINDER_1H30', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED',
        'APPOINTMENT_COMPLETED', 'TRIAGE_COMPLETED', 'TRIAGE_REMINDER', 'CUSTOM'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_type_enum AS ENUM ('NONE', 'FIXED', 'PERCENTAGE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PARTE 2: COLUNA SLUG NA TABELA SALONS
-- =============================================
ALTER TABLE salons ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons (slug) WHERE slug IS NOT NULL;

-- =============================================
-- PARTE 3: TABELA ONLINE_BOOKING_SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS online_booking_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    operation_mode operation_mode DEFAULT 'SECRETARY_ONLY',

    -- Configuracoes de tempo
    min_advance_hours INTEGER NOT NULL DEFAULT 2,
    max_advance_days INTEGER NOT NULL DEFAULT 30,
    slot_interval_minutes INTEGER DEFAULT 30,
    allow_same_day_booking BOOLEAN DEFAULT true,
    hold_duration_minutes INTEGER NOT NULL DEFAULT 10,
    cancellation_hours INTEGER NOT NULL DEFAULT 24,
    cancellation_policy TEXT,
    allow_rescheduling BOOLEAN NOT NULL DEFAULT true,
    max_reschedules INTEGER NOT NULL DEFAULT 2,

    -- Verificacao
    require_phone_verification BOOLEAN NOT NULL DEFAULT true,

    -- Deposito/Taxa
    require_deposit BOOLEAN NOT NULL DEFAULT false,
    deposit_type VARCHAR(20) DEFAULT 'NONE',
    deposit_value DECIMAL(10,2) DEFAULT 0,
    deposit_min_services DECIMAL(10,2) DEFAULT 100,
    deposit_applies_to deposit_applies_to DEFAULT 'ALL',

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
-- PARTE 4: TABELA APPOINTMENT_HOLDS
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
-- PARTE 5: TABELA OTP_CODES
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
-- PARTE 6: TABELA CLIENT_BOOKING_RULES
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
-- PARTE 7: TABELA APPOINTMENT_DEPOSITS
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
-- PARTE 8: TABELA APPOINTMENT_NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS appointment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),

    recipient_phone VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(255),

    notification_type appointment_notification_type NOT NULL,
    template_key VARCHAR(100),
    template_variables JSONB,
    custom_message TEXT,

    scheduled_for TIMESTAMP NOT NULL,

    status notification_status NOT NULL DEFAULT 'PENDING',
    provider_message_id VARCHAR(255),

    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_attempt_at TIMESTAMP,
    last_error TEXT,

    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,

    client_response VARCHAR(50),
    client_responded_at TIMESTAMP,

    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    dedupe_key VARCHAR(255) UNIQUE,
    processing_started_at TIMESTAMP,
    processing_worker_id VARCHAR(100)
);

-- =============================================
-- PARTE 9: TABELA AI_CONVERSATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),

    client_phone VARCHAR(20) NOT NULL,
    client_name VARCHAR(255),

    status VARCHAR(20) NOT NULL DEFAULT 'AI_ACTIVE',

    human_agent_id UUID REFERENCES users(id),
    human_takeover_at TIMESTAMP,
    ai_resumed_at TIMESTAMP,

    last_message_at TIMESTAMP,
    messages_count INTEGER DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- PARTE 10: TABELA AI_MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,

    role VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,

    intent VARCHAR(50),
    confidence DECIMAL(3,2),

    metadata JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- PARTE 11: COLUNAS EXTRAS NA TABELA APPOINTMENTS
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
-- PARTE 12: ÍNDICES
-- =============================================

-- Indexes on appointment_holds
CREATE INDEX IF NOT EXISTS idx_appointment_holds_availability
ON appointment_holds (salon_id, professional_id, date, start_time, end_time)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_appointment_holds_expires_at
ON appointment_holds (expires_at)
WHERE status = 'ACTIVE';

-- Indexes on otp_codes
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_type
ON otp_codes (phone, type)
WHERE used_at IS NULL;

-- Indexes on client_booking_rules
CREATE INDEX IF NOT EXISTS idx_client_booking_rules_phone
ON client_booking_rules (salon_id, client_phone)
WHERE is_active = true;

-- Indexes on appointment_deposits
CREATE INDEX IF NOT EXISTS idx_appointment_deposits_pending
ON appointment_deposits (salon_id, status)
WHERE status = 'PENDING';

-- Indexes on appointment_notifications
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_pending
ON appointment_notifications (status, scheduled_for)
WHERE status IN ('PENDING', 'SCHEDULED');

CREATE INDEX IF NOT EXISTS idx_appointment_notifications_dedupe
ON appointment_notifications (dedupe_key)
WHERE dedupe_key IS NOT NULL;

-- Indexes on ai_conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_salon_phone
ON ai_conversations (salon_id, client_phone);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_status
ON ai_conversations (salon_id, status)
WHERE status = 'AI_ACTIVE';

-- =============================================
-- PARTE 13: CRIAR SETTINGS PARA SALÕES EXISTENTES
-- =============================================
INSERT INTO online_booking_settings (salon_id, enabled)
SELECT id, false FROM salons
WHERE NOT EXISTS (
    SELECT 1 FROM online_booking_settings WHERE salon_id = salons.id
)
ON CONFLICT DO NOTHING;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
SELECT 'Atualização concluída com sucesso!' as resultado;

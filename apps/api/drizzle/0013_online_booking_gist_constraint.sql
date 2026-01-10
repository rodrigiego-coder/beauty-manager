-- Migration: Add indexes for online booking module
-- Note: Time overlap validation is done in application layer for flexibility

-- Step 1: Install btree_gist extension (useful for future constraints)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Step 2: Create indexes on appointment_holds table
-- Primary lookup index for checking availability
CREATE INDEX IF NOT EXISTS idx_appointment_holds_availability
ON appointment_holds (salon_id, professional_id, date, start_time, end_time)
WHERE status = 'ACTIVE';

-- Index for expiration cleanup job
CREATE INDEX IF NOT EXISTS idx_appointment_holds_expires_at
ON appointment_holds (expires_at)
WHERE status = 'ACTIVE';

-- Index for session tracking
CREATE INDEX IF NOT EXISTS idx_appointment_holds_session
ON appointment_holds (session_id)
WHERE session_id IS NOT NULL AND status = 'ACTIVE';

-- Step 3: Create indexes on OTP codes table
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_type
ON otp_codes (phone, type)
WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at
ON otp_codes (expires_at)
WHERE used_at IS NULL;

-- Step 4: Create indexes on client_booking_rules
CREATE INDEX IF NOT EXISTS idx_client_booking_rules_phone
ON client_booking_rules (salon_id, client_phone)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_client_booking_rules_client_id
ON client_booking_rules (salon_id, client_id)
WHERE is_active = true AND client_id IS NOT NULL;

-- Step 5: Create indexes on appointment_deposits
CREATE INDEX IF NOT EXISTS idx_appointment_deposits_pending
ON appointment_deposits (salon_id, status)
WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_appointment_deposits_appointment
ON appointment_deposits (appointment_id)
WHERE appointment_id IS NOT NULL;

-- Step 6: Create index on online_booking_settings
CREATE INDEX IF NOT EXISTS idx_online_booking_settings_enabled
ON online_booking_settings (salon_id)
WHERE enabled = true;

-- Step 7: Create indexes on appointments for online booking fields
CREATE INDEX IF NOT EXISTS idx_appointments_hold_id
ON appointments (hold_id)
WHERE hold_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_client_access_token
ON appointments (client_access_token)
WHERE client_access_token IS NOT NULL;

-- Note: Time slot overlap prevention is handled in the service layer
-- using SELECT FOR UPDATE with proper locking to prevent race conditions

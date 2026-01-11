-- Migration: Add NONE option to deposit_type
-- Updates default value and existing records

-- Update default value for new records
ALTER TABLE online_booking_settings
ALTER COLUMN deposit_type SET DEFAULT 'NONE';

-- Update existing records that have FIXED with deposit_value = 0 to NONE
UPDATE online_booking_settings
SET deposit_type = 'NONE'
WHERE deposit_type = 'FIXED'
  AND (deposit_value = '0' OR deposit_value IS NULL OR deposit_value = '0.00')
  AND require_deposit = false;

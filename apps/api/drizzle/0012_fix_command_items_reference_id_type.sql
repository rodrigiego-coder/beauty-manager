-- Migration: Fix command_items.reference_id column type
-- Problem: Column was defined as UUID but stores integer IDs (service/product IDs)
-- Solution: Change from UUID to VARCHAR(50)

-- Step 1: Drop any existing data that might have invalid UUID format
-- (This shouldn't affect real data since we're converting from UUID to varchar)

-- Step 2: Alter the column type from UUID to VARCHAR
ALTER TABLE "command_items"
  ALTER COLUMN "reference_id" TYPE VARCHAR(50)
  USING "reference_id"::text;

-- Note: This migration is safe because:
-- 1. UUID values can be converted to VARCHAR without loss
-- 2. The column allows NULL, so empty values are fine
-- 3. Integer strings like "9" will now be accepted

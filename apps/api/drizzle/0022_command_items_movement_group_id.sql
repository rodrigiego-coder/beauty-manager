-- Migration: Add movement_group_id to command_items (KIT stock reversal support)
-- Date: 2026-02-07

ALTER TABLE command_items ADD COLUMN IF NOT EXISTS movement_group_id UUID;

-- Index for quick lookup during cancel/remove operations
CREATE INDEX IF NOT EXISTS idx_command_items_movement_group
  ON command_items (movement_group_id) WHERE movement_group_id IS NOT NULL;

-- ========================================
-- ROLLBACK (comentado, usar se necessário)
-- ========================================
-- DROP INDEX IF EXISTS idx_command_items_movement_group;
-- ALTER TABLE command_items DROP COLUMN IF EXISTS movement_group_id;

-- Migration: KIT products support + movement_group_id
-- Date: 2026-02-07

-- 1) Product kind enum + column
DO $$ BEGIN
  CREATE TYPE product_kind AS ENUM ('SIMPLE', 'KIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS kind product_kind NOT NULL DEFAULT 'SIMPLE';

-- 2) movement_group_id on stock_movements (groups atomic kit deductions)
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS movement_group_id UUID;
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_group
  ON stock_movements (movement_group_id) WHERE movement_group_id IS NOT NULL;

-- 3) kit_components table
CREATE TABLE IF NOT EXISTS kit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  kit_product_id INTEGER NOT NULL REFERENCES products(id),
  component_product_id INTEGER NOT NULL REFERENCES products(id),
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_kit_component UNIQUE (kit_product_id, component_product_id),
  CONSTRAINT chk_kit_not_self CHECK (kit_product_id != component_product_id)
);

CREATE INDEX IF NOT EXISTS idx_kit_components_kit ON kit_components (kit_product_id);

-- ========================================
-- ROLLBACK (comentado, usar se necessário)
-- ========================================
-- DROP TABLE IF EXISTS kit_components;
-- DROP INDEX IF EXISTS idx_stock_movements_movement_group;
-- ALTER TABLE stock_movements DROP COLUMN IF EXISTS movement_group_id;
-- ALTER TABLE products DROP COLUMN IF EXISTS kind;
-- DROP TYPE IF EXISTS product_kind;

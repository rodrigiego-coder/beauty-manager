-- Migration: PACOTE 1 - Estoque Moderno (Dual Stock + Stock Movements)
-- Data: 2025-12-20

-- 1) Criar enum para localização de estoque
DO $$ BEGIN
  CREATE TYPE stock_location_type AS ENUM ('RETAIL', 'INTERNAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Criar enum para tipo de movimento
DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM (
    'SALE',
    'SERVICE_CONSUMPTION',
    'PURCHASE',
    'TRANSFER',
    'ADJUSTMENT',
    'RETURN',
    'CANCELED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3) Adicionar novas colunas em products (estoques separados)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_retail INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_internal INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_retail INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_internal INTEGER NOT NULL DEFAULT 0;

-- 4) Migrar dados do estoque antigo para o novo (RETAIL por padrão)
UPDATE products SET stock_retail = current_stock WHERE current_stock IS NOT NULL;
UPDATE products SET min_stock_retail = min_stock WHERE min_stock IS NOT NULL;

-- 5) Criar tabela de movimentos de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL REFERENCES products(id),
  salon_id UUID NOT NULL REFERENCES salons(id),
  location_type stock_location_type NOT NULL,
  delta INTEGER NOT NULL,
  movement_type movement_type NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  transfer_group_id UUID,
  reason TEXT,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6) Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_salon_id ON stock_movements(salon_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location_type ON stock_movements(location_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- 7) OPCIONAL: Remover colunas antigas (comentado para segurança)
-- ALTER TABLE products DROP COLUMN IF EXISTS current_stock;
-- ALTER TABLE products DROP COLUMN IF EXISTS min_stock;

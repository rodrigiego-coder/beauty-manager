-- Migration: Product Retail/Backbar Flags
-- PACOTE 2-A: Flags para identificar produtos vendáveis (retail) e de consumo interno (backbar)
-- Data: 2025-12-20

-- Adicionar flags de tipo de produto
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_retail BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_backbar BOOLEAN NOT NULL DEFAULT false;

-- Index para filtrar produtos vendáveis
CREATE INDEX IF NOT EXISTS idx_products_is_retail ON products(is_retail) WHERE is_retail = true;

-- Comentários
COMMENT ON COLUMN products.is_retail IS 'Produto disponível para venda ao cliente';
COMMENT ON COLUMN products.is_backbar IS 'Produto disponível para consumo interno em serviços';

-- ========================================
-- ROLLBACK (comentado, usar se necessário)
-- ========================================
-- DROP INDEX IF EXISTS idx_products_is_retail;
-- ALTER TABLE products DROP COLUMN IF EXISTS is_backbar;
-- ALTER TABLE products DROP COLUMN IF EXISTS is_retail;

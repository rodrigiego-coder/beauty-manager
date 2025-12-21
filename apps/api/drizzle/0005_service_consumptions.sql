-- Migration: Service Consumptions (BOM - Bill of Materials)
-- PACOTE 3: Consumo automático de produtos por serviço
-- Data: 2025-12-20

-- ========================================
-- TABELA: service_consumptions
-- Define quais produtos são consumidos automaticamente ao executar um serviço
-- ========================================

CREATE TABLE IF NOT EXISTS service_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(5) NOT NULL DEFAULT 'UN',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  -- Restrição de unicidade: um produto só pode aparecer uma vez por serviço no salão
  CONSTRAINT uq_service_consumptions_salon_service_product
    UNIQUE (salon_id, service_id, product_id)
);

-- Índice para buscar consumos de um serviço
CREATE INDEX IF NOT EXISTS idx_service_consumptions_salon_service
  ON service_consumptions(salon_id, service_id);

-- Índice para buscar consumos por produto (útil para relatórios)
CREATE INDEX IF NOT EXISTS idx_service_consumptions_product
  ON service_consumptions(product_id);

-- Comentários
COMMENT ON TABLE service_consumptions IS 'Define os produtos consumidos automaticamente ao executar um serviço (BOM)';
COMMENT ON COLUMN service_consumptions.quantity IS 'Quantidade consumida por 1 unidade do serviço';
COMMENT ON COLUMN service_consumptions.unit IS 'Unidade de medida: UN, ML, G, KG, L';

-- ========================================
-- ROLLBACK (comentado, usar se necessário)
-- ========================================
-- DROP INDEX IF EXISTS idx_service_consumptions_product;
-- DROP INDEX IF EXISTS idx_service_consumptions_salon_service;
-- DROP TABLE IF EXISTS service_consumptions;

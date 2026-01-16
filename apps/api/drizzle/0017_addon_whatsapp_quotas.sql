-- Migration: Add-on WhatsApp e Sistema de Quotas
-- Criado em: 2025-01-16
-- Objetivo: Estrutura para add-ons WhatsApp com quotas mensais e auditoria (ledger)

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE addon_status AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE quota_event_type AS ENUM ('CONSUME', 'PURCHASE', 'GRANT', 'ADJUST', 'REFUND');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABELA: addon_catalog
-- Catálogo de add-ons disponíveis
-- ============================================

CREATE TABLE IF NOT EXISTS addon_catalog (
  code VARCHAR(50) PRIMARY KEY,
  family VARCHAR(30) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  quota_type VARCHAR(50) NOT NULL,
  quota_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE addon_catalog IS 'Catálogo de add-ons disponíveis (ex: WhatsApp BASIC/PRO)';
COMMENT ON COLUMN addon_catalog.code IS 'Código único do add-on (ex: WHATSAPP_BASIC_120)';
COMMENT ON COLUMN addon_catalog.family IS 'Família do add-on (ex: WHATSAPP)';
COMMENT ON COLUMN addon_catalog.tier IS 'Nível do add-on (ex: BASIC, PRO)';
COMMENT ON COLUMN addon_catalog.quota_type IS 'Tipo de quota que este add-on fornece (ex: WHATSAPP_APPOINTMENT)';
COMMENT ON COLUMN addon_catalog.quota_amount IS 'Quantidade de quota mensal incluída';
COMMENT ON COLUMN addon_catalog.price_cents IS 'Preço em centavos (ex: 2990 = R$29,90)';

-- ============================================
-- TABELA: credit_packages
-- Pacotes de créditos extras para compra avulsa
-- ============================================

CREATE TABLE IF NOT EXISTS credit_packages (
  code VARCHAR(50) PRIMARY KEY,
  quota_type VARCHAR(50) NOT NULL,
  qty INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE credit_packages IS 'Pacotes de créditos extras para compra avulsa';
COMMENT ON COLUMN credit_packages.code IS 'Código único do pacote (ex: WHATSAPP_EXTRA_20)';
COMMENT ON COLUMN credit_packages.qty IS 'Quantidade de quotas no pacote';
COMMENT ON COLUMN credit_packages.price_cents IS 'Preço em centavos';

-- ============================================
-- TABELA: salon_addons
-- Add-ons ativos por salão
-- ============================================

CREATE TABLE IF NOT EXISTS salon_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  addon_code VARCHAR(50) NOT NULL REFERENCES addon_catalog(code),
  status addon_status NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salon_addons_salon ON salon_addons(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_addons_code_active ON salon_addons(addon_code, status) WHERE status = 'ACTIVE';

COMMENT ON TABLE salon_addons IS 'Add-ons contratados por cada salão';
COMMENT ON COLUMN salon_addons.status IS 'Status atual do add-on (ACTIVE, SUSPENDED, CANCELED)';

-- ============================================
-- TABELA: salon_quotas
-- Quotas mensais por salão
-- ============================================

CREATE TABLE IF NOT EXISTS salon_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  period_yyyymm INTEGER NOT NULL,
  whatsapp_included INTEGER NOT NULL DEFAULT 0,
  whatsapp_used INTEGER NOT NULL DEFAULT 0,
  whatsapp_extra_purchased INTEGER NOT NULL DEFAULT 0,
  whatsapp_extra_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_salon_period UNIQUE (salon_id, period_yyyymm)
);

CREATE INDEX IF NOT EXISTS idx_salon_quotas_period ON salon_quotas(salon_id, period_yyyymm);

COMMENT ON TABLE salon_quotas IS 'Quotas mensais de WhatsApp por salão';
COMMENT ON COLUMN salon_quotas.period_yyyymm IS 'Período no formato YYYYMM (ex: 202601)';
COMMENT ON COLUMN salon_quotas.whatsapp_included IS 'Total de quotas incluídas no plano do mês';
COMMENT ON COLUMN salon_quotas.whatsapp_used IS 'Total de quotas do plano já consumidas';
COMMENT ON COLUMN salon_quotas.whatsapp_extra_purchased IS 'Total de quotas extras compradas';
COMMENT ON COLUMN salon_quotas.whatsapp_extra_used IS 'Total de quotas extras já consumidas';

-- ============================================
-- TABELA: quota_ledger
-- Auditoria de eventos de quota
-- ============================================

CREATE TABLE IF NOT EXISTS quota_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  period_yyyymm INTEGER NOT NULL,
  event_type quota_event_type NOT NULL,
  quota_type VARCHAR(50) NOT NULL,
  qty INTEGER NOT NULL,
  ref_type VARCHAR(30),
  ref_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quota_ledger_salon_period ON quota_ledger(salon_id, period_yyyymm);
CREATE INDEX IF NOT EXISTS idx_quota_ledger_ref ON quota_ledger(ref_type, ref_id) WHERE ref_id IS NOT NULL;

COMMENT ON TABLE quota_ledger IS 'Ledger de auditoria para todas as operações de quota';
COMMENT ON COLUMN quota_ledger.event_type IS 'Tipo de evento (CONSUME, PURCHASE, GRANT, ADJUST, REFUND)';
COMMENT ON COLUMN quota_ledger.qty IS 'Quantidade (positivo = crédito, negativo = débito)';
COMMENT ON COLUMN quota_ledger.ref_type IS 'Tipo de referência (APPOINTMENT, MANUAL, INVOICE)';
COMMENT ON COLUMN quota_ledger.ref_id IS 'ID da referência';
COMMENT ON COLUMN quota_ledger.metadata IS 'Metadados adicionais em JSON';

-- Migration: Segurança, Idempotência e Auditoria Forense
-- Criado em: 2025-12-22
-- Pilares: 1) Token Hash + Segurança, 2) DedupeKeys + SKIP LOCKED, 3) Audit Logs

-- ============================================
-- PILAR 1: SEGURANÇA DO TOKEN PÚBLICO
-- ============================================

-- Status de triagem com estados adicionais
DO $$ BEGIN
  ALTER TYPE risk_level ADD VALUE IF NOT EXISTS 'NONE';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Adicionar colunas de segurança em triage_responses
ALTER TABLE triage_responses
  ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS access_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_access_ip VARCHAR(45),
  ADD COLUMN IF NOT EXISTS last_access_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS invalidated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS invalidated_reason VARCHAR(100);

-- Migrar tokens existentes para hash (SHA-256)
-- NOTA: Isso só funciona para novos tokens, tokens antigos serão invalidados
UPDATE triage_responses
SET token_hash = encode(sha256(access_token::bytea), 'hex')
WHERE access_token IS NOT NULL AND token_hash IS NULL;

-- Índice para busca por hash (substituir busca por token)
CREATE UNIQUE INDEX IF NOT EXISTS idx_triage_token_hash
  ON triage_responses(token_hash) WHERE token_hash IS NOT NULL;

-- Índice para expiração (otimizar job de limpeza)
CREATE INDEX IF NOT EXISTS idx_triage_expires_pending
  ON triage_responses(expires_at)
  WHERE status = 'PENDING' AND used_at IS NULL;

-- ============================================
-- PILAR 2: IDEMPOTÊNCIA E CONCORRÊNCIA
-- ============================================

-- Adicionar dedupeKey em appointment_notifications
ALTER TABLE appointment_notifications
  ADD COLUMN IF NOT EXISTS dedupe_key VARCHAR(255);

-- Unique index para idempotência (ignora CANCELLED)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedupe
  ON appointment_notifications(dedupe_key)
  WHERE status != 'CANCELLED' AND dedupe_key IS NOT NULL;

-- Adicionar dedupeKey em command_consumption_snapshots
ALTER TABLE command_consumption_snapshots
  ADD COLUMN IF NOT EXISTS dedupe_key VARCHAR(255);

-- Unique index para evitar dupla baixa de estoque
CREATE UNIQUE INDEX IF NOT EXISTS idx_consumption_dedupe
  ON command_consumption_snapshots(dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- Adicionar processing_started_at para SKIP LOCKED (lock otimista)
ALTER TABLE appointment_notifications
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS processing_worker_id VARCHAR(50);

-- Índice para processamento ordenado
CREATE INDEX IF NOT EXISTS idx_notifications_pending_scheduled
  ON appointment_notifications(scheduled_for, created_at)
  WHERE status = 'PENDING';

-- ============================================
-- PILAR 3: AUDITORIA FORENSE
-- ============================================

-- Estender enum de ações de auditoria existente
DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'PUBLIC_ACCESS';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'TOKEN_VALIDATED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'WHATSAPP_SENT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'WHATSAPP_FAILED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'CRITICAL_OVERRIDE';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'STOCK_CONSUMED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Adicionar colunas extras na tabela audit_logs existente
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS user_role VARCHAR(50),
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Índices adicionais para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(salon_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Tabela de overrides de triagem (para rastreabilidade de exceções)
CREATE TABLE IF NOT EXISTS triage_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triage_id UUID NOT NULL REFERENCES triage_responses(id),
  appointment_id UUID NOT NULL REFERENCES appointments(id),

  -- Quem autorizou
  user_id UUID NOT NULL REFERENCES users(id),
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,

  -- Justificativa obrigatória (mínimo 20 caracteres)
  reason TEXT NOT NULL CHECK (LENGTH(reason) >= 20),

  -- Rastreabilidade
  ip_address VARCHAR(45),

  overridden_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para buscar overrides por agendamento
CREATE INDEX IF NOT EXISTS idx_triage_overrides_appointment ON triage_overrides(appointment_id);

-- Tabela para pendências de estoque (quando estoque insuficiente)
CREATE TABLE IF NOT EXISTS stock_adjustments_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  command_id UUID REFERENCES commands(id),
  command_item_id UUID REFERENCES command_items(id),
  product_id INTEGER REFERENCES products(id) NOT NULL,

  quantity_needed DECIMAL(10, 3) NOT NULL,
  quantity_available DECIMAL(10, 3),

  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  resolved_at TIMESTAMP,
  resolved_by_id UUID REFERENCES users(id),
  resolution_note TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para pendências por status
CREATE INDEX IF NOT EXISTS idx_stock_pending_status
  ON stock_adjustments_pending(salon_id, status)
  WHERE status = 'PENDING';

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN triage_responses.token_hash IS 'SHA-256 do token de acesso (NUNCA armazenar token puro)';
COMMENT ON COLUMN triage_responses.used_at IS 'Momento em que o token foi usado (marca como inválido)';
COMMENT ON COLUMN triage_responses.access_attempts IS 'Contador de tentativas de acesso para rate limiting';

COMMENT ON COLUMN appointment_notifications.dedupe_key IS 'Chave de idempotência no formato appointmentId:notificationType';
COMMENT ON COLUMN appointment_notifications.processing_started_at IS 'Timestamp do início do processamento (SKIP LOCKED)';
COMMENT ON COLUMN appointment_notifications.processing_worker_id IS 'ID do worker que está processando (para debug)';

COMMENT ON COLUMN command_consumption_snapshots.dedupe_key IS 'Chave de idempotência no formato commandItemId:productId:recipeVersion:variantCode';

COMMENT ON TABLE audit_logs IS 'Log de auditoria forense para todas as operações críticas do sistema';
COMMENT ON TABLE triage_overrides IS 'Registro de exceções quando profissional ignora alertas de triagem';
COMMENT ON TABLE stock_adjustments_pending IS 'Pendências de estoque quando quantidade insuficiente';

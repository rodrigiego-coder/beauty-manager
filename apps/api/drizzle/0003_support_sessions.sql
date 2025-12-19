-- Migration: Create support_sessions table
-- Sprint 5: Console SUPER_ADMIN + Suporte Delegado
-- Data: 2025-12-18

-- Tabela de Sessões de Suporte Delegado
-- Permite que SUPER_ADMIN acesse temporariamente um salão para suporte técnico
CREATE TABLE IF NOT EXISTS support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  target_salon_id UUID NOT NULL REFERENCES salons(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index para busca rápida por token (consumo de sessão)
CREATE INDEX IF NOT EXISTS idx_support_sessions_token ON support_sessions(token);

-- Index para busca por status e expiração (limpeza de tokens expirados)
CREATE INDEX IF NOT EXISTS idx_support_sessions_status_expires ON support_sessions(status, expires_at);

-- Index para auditoria por admin
CREATE INDEX IF NOT EXISTS idx_support_sessions_admin ON support_sessions(admin_user_id);

-- Index para auditoria por salão
CREATE INDEX IF NOT EXISTS idx_support_sessions_salon ON support_sessions(target_salon_id);

-- Comentários para documentação
COMMENT ON TABLE support_sessions IS 'Sessões de suporte delegado para SUPER_ADMIN acessar salões';
COMMENT ON COLUMN support_sessions.admin_user_id IS 'ID do usuário SUPER_ADMIN que criou a sessão';
COMMENT ON COLUMN support_sessions.target_salon_id IS 'ID do salão que será acessado';
COMMENT ON COLUMN support_sessions.token IS 'Token único de 64 caracteres para consumo da sessão';
COMMENT ON COLUMN support_sessions.reason IS 'Motivo do acesso (obrigatório para compliance)';
COMMENT ON COLUMN support_sessions.status IS 'Status: PENDING, CONSUMED, EXPIRED, REVOKED';
COMMENT ON COLUMN support_sessions.expires_at IS 'Data/hora de expiração (TTL de 15 minutos)';
COMMENT ON COLUMN support_sessions.consumed_at IS 'Data/hora em que o token foi consumido';

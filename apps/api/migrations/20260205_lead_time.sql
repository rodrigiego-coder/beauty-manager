-- =====================================================
-- Migration: Lead Time por Profissional
-- Adiciona campos para aviso prévio mínimo de agendamentos
-- Data: 2026-02-05
-- =====================================================

-- Adiciona campo para habilitar/desabilitar lead time
ALTER TABLE users ADD COLUMN IF NOT EXISTS lead_time_enabled BOOLEAN DEFAULT false;

-- Adiciona campo para minutos de antecedência (0-480, ou seja, até 8h)
ALTER TABLE users ADD COLUMN IF NOT EXISTS lead_time_minutes INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN users.lead_time_enabled IS 'Se true, aplica aviso prévio mínimo para agendamentos (profissional fora do salão)';
COMMENT ON COLUMN users.lead_time_minutes IS 'Minutos de antecedência mínima para agendamentos (0-480)';

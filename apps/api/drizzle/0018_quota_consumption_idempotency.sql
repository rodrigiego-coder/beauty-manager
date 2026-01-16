-- Migration: Constraint de idempotência para consumo de quota
-- Criado em: 2026-01-16
-- Objetivo: Garantir que cada appointment só consuma quota uma vez por período

-- ============================================
-- CONSTRAINT: Idempotência de consumo
-- ============================================

-- Criar índice único parcial para garantir idempotência
-- Um appointment só pode ter um CONSUME por período
-- Isso permite múltiplos GRANTs, ADJUSTs, etc., mas apenas um CONSUME por appointment

CREATE UNIQUE INDEX IF NOT EXISTS idx_quota_ledger_consume_idempotent
ON quota_ledger (salon_id, period_yyyymm, ref_type, ref_id)
WHERE event_type = 'CONSUME' AND ref_type = 'APPOINTMENT' AND ref_id IS NOT NULL;

COMMENT ON INDEX idx_quota_ledger_consume_idempotent IS
'Garante que um appointment só consome quota uma vez por período (idempotência)';

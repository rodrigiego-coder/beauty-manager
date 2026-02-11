-- Migration: Add business_date field to commands table
-- Date: 2026-02-11
-- Purpose: Agrupar faturamento pelo dia de ABERTURA (não fechamento)
-- opened_at é timestamp without time zone armazenado em UTC
-- Expressão correta: DATE((opened_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo')

-- 1. Adicionar coluna (nullable para legado)
ALTER TABLE commands ADD COLUMN IF NOT EXISTS business_date DATE;

-- 2. Preencher registros existentes com data SP derivada de opened_at
UPDATE commands
SET business_date = DATE((opened_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo')
WHERE business_date IS NULL;

-- 3. Índice para queries de dashboard/reports
CREATE INDEX IF NOT EXISTS idx_commands_business_date
ON commands (salon_id, business_date);

-- ========================================
-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_commands_business_date;
-- ALTER TABLE commands DROP COLUMN IF EXISTS business_date;
-- ========================================

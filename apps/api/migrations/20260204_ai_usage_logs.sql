-- =====================================================
-- Migration: AI Usage Logs
-- Tabela para monitoramento de custos do Gemini
-- Data: 2026-02-04
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,

  -- Modelo e tipo de requisição
  model VARCHAR(50) NOT NULL,
  request_type VARCHAR(20) NOT NULL, -- 'text' | 'audio'

  -- Tokens utilizados
  input_tokens INTEGER DEFAULT 0 NOT NULL,
  output_tokens INTEGER DEFAULT 0 NOT NULL,
  total_tokens INTEGER DEFAULT 0 NOT NULL,

  -- Custo calculado (USD)
  cost_usd DECIMAL(12, 8) DEFAULT 0 NOT NULL,

  -- Métricas de performance
  latency_ms INTEGER,

  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índices para consultas de relatório
CREATE INDEX IF NOT EXISTS ai_usage_logs_salon_idx ON ai_usage_logs(salon_id);
CREATE INDEX IF NOT EXISTS ai_usage_logs_created_at_idx ON ai_usage_logs(created_at);

-- Comentário da tabela
COMMENT ON TABLE ai_usage_logs IS 'Logs de uso da IA Gemini para relatório de custos - Rodrigo pode ver o gasto real em centavos';

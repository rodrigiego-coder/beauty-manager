-- ==============================================
-- MIGRAÇÃO: Adicionar campo waze_url na tabela salons
-- ==============================================

-- Adiciona coluna waze_url para link do Waze
ALTER TABLE salons ADD COLUMN IF NOT EXISTS waze_url TEXT;

-- Atualiza o salão demo com o link do Waze
UPDATE salons
SET waze_url = 'https://waze.com/ul?ll=-22.6641832,-50.4373021&navigate=yes'
WHERE slug = 'salao-camila-sanches';

-- ==============================================
-- FIM DA MIGRAÇÃO
-- ==============================================

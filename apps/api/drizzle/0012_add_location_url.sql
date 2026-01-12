-- ==============================================
-- MIGRAÇÃO: Adicionar campo location_url na tabela salons
-- ==============================================

-- Adiciona coluna location_url para link do Google Maps
ALTER TABLE salons ADD COLUMN IF NOT EXISTS location_url TEXT;

-- Atualiza o salão demo com endereço e localização
UPDATE salons
SET
  address = 'Rua São Pedro, 820 / Vila Carvalho - Assis/SP',
  location_url = 'https://maps.google.com/maps?q=-22.6641832%2C-50.4373021&z=17&hl=pt-BR'
WHERE slug = 'salao-camila-sanches';

-- ==============================================
-- FIM DA MIGRAÇÃO
-- ==============================================

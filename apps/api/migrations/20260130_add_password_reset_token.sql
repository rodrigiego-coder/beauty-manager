-- Migration: Adicionar campos de token de criação/reset de senha na tabela users
-- Data: 2026-01-30
-- Descrição: Adiciona passwordResetToken e passwordResetExpires para permitir
--            envio de link de criação de senha via WhatsApp

-- Adiciona coluna para o token de reset de senha (único)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(64) UNIQUE;

-- Adiciona coluna para expiração do token
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Cria índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
ON users(password_reset_token)
WHERE password_reset_token IS NOT NULL;

-- Comentários nas colunas
COMMENT ON COLUMN users.password_reset_token IS 'Token único para criação/reset de senha (64 caracteres hex)';
COMMENT ON COLUMN users.password_reset_expires IS 'Data/hora de expiração do token (48 horas após criação)';

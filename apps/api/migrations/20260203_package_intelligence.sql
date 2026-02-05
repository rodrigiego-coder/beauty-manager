-- Migration: Package Intelligence para Alexia
-- Data: 2026-02-03
-- Descrição: Adiciona campos para inteligência de pacotes na Alexia

-- ============================================
-- 1. NOVOS TIPOS DE NOTIFICAÇÃO
-- ============================================
-- Nota: Os novos valores foram adicionados ao enum no schema.ts
-- O Drizzle ORM não suporta ALTER TYPE, então os valores precisam ser adicionados manualmente

-- Adiciona novos valores ao enum appointment_notification_type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PACKAGE_SESSION_COMPLETED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_notification_type')) THEN
        ALTER TYPE appointment_notification_type ADD VALUE 'PACKAGE_SESSION_COMPLETED';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PACKAGE_PENDING_SESSIONS' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_notification_type')) THEN
        ALTER TYPE appointment_notification_type ADD VALUE 'PACKAGE_PENDING_SESSIONS';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PACKAGE_EXPIRATION_WARNING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_notification_type')) THEN
        ALTER TYPE appointment_notification_type ADD VALUE 'PACKAGE_EXPIRATION_WARNING';
    END IF;
END$$;

-- ============================================
-- 2. NOVAS COLUNAS EM client_packages
-- ============================================

-- Adiciona coluna para telefone do cliente (cache para notificações)
ALTER TABLE client_packages
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Adiciona coluna para timestamp do último alerta de sessões pendentes
ALTER TABLE client_packages
ADD COLUMN IF NOT EXISTS last_pending_alert_at TIMESTAMP;

-- Adiciona coluna para contagem de alertas enviados
ALTER TABLE client_packages
ADD COLUMN IF NOT EXISTS pending_alert_count INTEGER DEFAULT 0;

-- Índice para busca de pacotes para alertas
CREATE INDEX IF NOT EXISTS idx_client_packages_pending_alerts
ON client_packages(last_pending_alert_at, active, expiration_date)
WHERE active = true;

-- Comentários nas colunas
COMMENT ON COLUMN client_packages.client_phone IS 'Telefone do cliente para notificações de pacote (cache)';
COMMENT ON COLUMN client_packages.last_pending_alert_at IS 'Timestamp do último alerta de sessões pendentes enviado';
COMMENT ON COLUMN client_packages.pending_alert_count IS 'Contagem de alertas de sessões pendentes enviados';

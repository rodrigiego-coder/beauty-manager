-- Migration: Adicionar tipos de notificação para triagem
-- Criado em: 2025-12-21

-- Adicionar novos valores ao enum appointment_notification_type
ALTER TYPE appointment_notification_type ADD VALUE IF NOT EXISTS 'TRIAGE_COMPLETED';
ALTER TYPE appointment_notification_type ADD VALUE IF NOT EXISTS 'TRIAGE_REMINDER';

-- Comentário
COMMENT ON TYPE appointment_notification_type IS 'Tipos de notificação de agendamento incluindo triagem';

-- Migration: Appointment Notifications (Outbox pattern para notificações WhatsApp)
-- Criado em: 2025-12-21

-- Enum para tipo de notificação de agendamento
DO $$ BEGIN
  CREATE TYPE "appointment_notification_type" AS ENUM (
    'APPOINTMENT_CONFIRMATION',
    'APPOINTMENT_REMINDER_24H',
    'APPOINTMENT_REMINDER_1H',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_RESCHEDULED',
    'APPOINTMENT_COMPLETED',
    'CUSTOM'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status da notificação
DO $$ BEGIN
  CREATE TYPE "notification_status" AS ENUM (
    'PENDING',
    'SCHEDULED',
    'SENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de notificações de agendamento
CREATE TABLE IF NOT EXISTS "appointment_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "salon_id" uuid NOT NULL REFERENCES "salons"("id"),

  -- Referência ao agendamento
  "appointment_id" uuid REFERENCES "appointments"("id"),

  -- Destinatário
  "recipient_phone" varchar(20) NOT NULL,
  "recipient_name" varchar(255),

  -- Tipo e conteúdo
  "notification_type" "appointment_notification_type" NOT NULL,
  "template_key" varchar(100),
  "template_variables" json,
  "custom_message" text,

  -- Agendamento
  "scheduled_for" timestamp NOT NULL,

  -- Status e rastreamento
  "status" "notification_status" DEFAULT 'PENDING' NOT NULL,
  "provider_message_id" varchar(255),

  -- Tentativas e erros
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 3 NOT NULL,
  "last_attempt_at" timestamp,
  "last_error" text,

  -- Entrega
  "sent_at" timestamp,
  "delivered_at" timestamp,
  "read_at" timestamp,

  -- Resposta do cliente
  "client_response" varchar(50),
  "client_responded_at" timestamp,

  -- Auditoria
  "created_by_id" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "processed_at" timestamp
);

-- Índices para performance do worker
CREATE INDEX IF NOT EXISTS "idx_appointment_notifications_pending"
  ON "appointment_notifications"("salon_id", "status", "scheduled_for")
  WHERE status IN ('PENDING', 'SCHEDULED');

CREATE INDEX IF NOT EXISTS "idx_appointment_notifications_appointment"
  ON "appointment_notifications"("appointment_id");

CREATE INDEX IF NOT EXISTS "idx_appointment_notifications_status"
  ON "appointment_notifications"("status", "scheduled_for");

-- Comentários
COMMENT ON TABLE "appointment_notifications" IS 'Outbox pattern para notificações WhatsApp de agendamentos';
COMMENT ON COLUMN "appointment_notifications"."scheduled_for" IS 'Data/hora em que a mensagem deve ser enviada';
COMMENT ON COLUMN "appointment_notifications"."template_variables" IS 'Variáveis para substituição no template: {nome, data, horario, servico, profissional}';
COMMENT ON COLUMN "appointment_notifications"."client_response" IS 'Resposta do cliente: SIM, NAO, CONFIRMAR, CANCELAR';

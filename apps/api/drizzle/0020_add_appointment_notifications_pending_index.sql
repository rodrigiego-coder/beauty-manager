-- ALFA.2: Índice parcial para fila de appointment_notifications
-- Melhora performance do SELECT com SKIP LOCKED no processor
-- Rollback: DROP INDEX IF EXISTS public.idx_appointment_notifications_pending;

CREATE INDEX IF NOT EXISTS idx_appointment_notifications_pending
ON public.appointment_notifications (scheduled_for, created_at)
WHERE status IN ('PENDING', 'SCHEDULED');

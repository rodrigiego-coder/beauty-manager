-- ==============================================================================
-- MIGRAÇÃO: Anti-Overbooking com EXCLUDE Constraint (Nível de Banco)
-- ==============================================================================
-- PROBLEMA: Race conditions podem permitir dois agendamentos no mesmo horário
-- SOLUÇÃO: Constraint EXCLUDE que bloqueia fisicamente sobreposições
-- ==============================================================================

-- 1. Habilita extensão btree_gist (necessária para EXCLUDE com tipos diferentes)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Adiciona coluna computada para o slot de tempo (TSRANGE)
-- Só adiciona se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'appointments' AND column_name = 'time_slot'
    ) THEN
        ALTER TABLE appointments ADD COLUMN time_slot tsrange;
    END IF;
END $$;

-- 3. Popula time_slot para registros existentes
-- Converte date (YYYY-MM-DD) + time (HH:MM) + duration (minutos) para TSRANGE
UPDATE appointments
SET time_slot = tsrange(
    (date || ' ' || time)::timestamp,
    (date || ' ' || time)::timestamp + (duration || ' minutes')::interval,
    '[)'  -- Inclui início, exclui fim (permite agendamentos consecutivos)
)
WHERE time_slot IS NULL
  AND date IS NOT NULL
  AND time IS NOT NULL
  AND duration IS NOT NULL
  AND status NOT IN ('CANCELLED', 'NO_SHOW');

-- 4. Cria função trigger para manter time_slot atualizado automaticamente
CREATE OR REPLACE FUNCTION update_appointment_time_slot()
RETURNS TRIGGER AS $$
BEGIN
    -- Só calcula se tiver os dados necessários
    IF NEW.date IS NOT NULL AND NEW.time IS NOT NULL AND NEW.duration IS NOT NULL THEN
        NEW.time_slot := tsrange(
            (NEW.date || ' ' || NEW.time)::timestamp,
            (NEW.date || ' ' || NEW.time)::timestamp + (NEW.duration || ' minutes')::interval,
            '[)'
        );
    ELSE
        NEW.time_slot := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Remove trigger antigo se existir e cria novo
DROP TRIGGER IF EXISTS trg_update_time_slot ON appointments;

CREATE TRIGGER trg_update_time_slot
    BEFORE INSERT OR UPDATE OF date, time, duration
    ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_time_slot();

-- 6. Cria índice para performance das consultas de sobreposição
DROP INDEX IF EXISTS idx_appointments_time_slot;
CREATE INDEX idx_appointments_time_slot ON appointments USING gist (time_slot);

-- 7. Remove constraint antiga se existir (para idempotência)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_no_overlap;

-- 8. Cria EXCLUDE CONSTRAINT que impede sobreposição
-- REGRA: Mesmo professional_id + time_slot que se sobrepõe = BLOQUEADO
-- Exclui agendamentos cancelados/no-show da verificação
ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap
    EXCLUDE USING gist (
        professional_id WITH =,
        time_slot WITH &&
    )
    WHERE (status NOT IN ('CANCELLED', 'NO_SHOW') AND time_slot IS NOT NULL);

-- 9. Cria função auxiliar para verificar conflitos (útil para aplicação)
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_professional_id UUID,
    p_date VARCHAR(10),
    p_time VARCHAR(5),
    p_duration INTEGER,
    p_exclude_id UUID DEFAULT NULL
) RETURNS TABLE (
    conflicting_id UUID,
    conflicting_date VARCHAR,
    conflicting_time VARCHAR,
    conflicting_service VARCHAR
) AS $$
DECLARE
    v_new_slot tsrange;
BEGIN
    -- Calcula o slot do novo agendamento
    v_new_slot := tsrange(
        (p_date || ' ' || p_time)::timestamp,
        (p_date || ' ' || p_time)::timestamp + (p_duration || ' minutes')::interval,
        '[)'
    );

    -- Retorna agendamentos que conflitam
    RETURN QUERY
    SELECT
        a.id,
        a.date,
        a.time,
        a.service
    FROM appointments a
    WHERE a.professional_id = p_professional_id
      AND a.time_slot && v_new_slot
      AND a.status NOT IN ('CANCELLED', 'NO_SHOW')
      AND (p_exclude_id IS NULL OR a.id != p_exclude_id);
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- ==============================================================================
COMMENT ON COLUMN appointments.time_slot IS 'Slot de tempo calculado automaticamente (TSRANGE) para constraint anti-overbooking';
COMMENT ON CONSTRAINT appointments_no_overlap ON appointments IS 'Impede agendamentos sobrepostos para o mesmo profissional (nível de banco)';
COMMENT ON FUNCTION check_appointment_conflict IS 'Verifica se há conflitos antes de inserir (uso opcional pela aplicação)';

-- ==============================================================================
-- FIM DA MIGRAÇÃO
-- ==============================================================================

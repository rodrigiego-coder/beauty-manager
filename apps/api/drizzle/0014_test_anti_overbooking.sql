-- ==============================================================================
-- TESTE DE STRESS: Anti-Overbooking Constraint
-- ==============================================================================
-- Este script tenta inserir 10 agendamentos simultâneos no mesmo horário
-- RESULTADO ESPERADO: Apenas 1 deve persistir, os outros 9 devem falhar
-- ==============================================================================

-- 1. Busca IDs necessários para o teste
DO $$
DECLARE
    v_salon_id UUID;
    v_professional_id UUID;
    v_service_id INTEGER;
    v_success_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_test_date VARCHAR(10) := '2099-12-31';  -- Data futura para teste
    v_test_time VARCHAR(5) := '14:00';
    i INTEGER;
BEGIN
    -- Busca o salão demo
    SELECT id INTO v_salon_id FROM salons WHERE slug = 'salao-camila-sanches' LIMIT 1;

    IF v_salon_id IS NULL THEN
        RAISE NOTICE 'ERRO: Salão não encontrado. Teste abortado.';
        RETURN;
    END IF;

    -- Busca um profissional do salão
    SELECT id INTO v_professional_id FROM users WHERE salon_id = v_salon_id AND role = 'PROFESSIONAL' LIMIT 1;

    IF v_professional_id IS NULL THEN
        -- Tenta qualquer usuário do salão
        SELECT id INTO v_professional_id FROM users WHERE salon_id = v_salon_id LIMIT 1;
    END IF;

    IF v_professional_id IS NULL THEN
        RAISE NOTICE 'ERRO: Profissional não encontrado. Teste abortado.';
        RETURN;
    END IF;

    -- Busca um serviço
    SELECT id INTO v_service_id FROM services WHERE salon_id = v_salon_id AND active = true LIMIT 1;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTE DE STRESS ANTI-OVERBOOKING';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Salon ID: %', v_salon_id;
    RAISE NOTICE 'Professional ID: %', v_professional_id;
    RAISE NOTICE 'Data teste: % às %', v_test_date, v_test_time;
    RAISE NOTICE '----------------------------------------';

    -- Limpa agendamentos de teste anteriores
    DELETE FROM appointments WHERE date = v_test_date AND notes = 'TESTE_STRESS_OVERBOOKING';
    RAISE NOTICE 'Limpeza de testes anteriores concluída.';

    -- Tenta inserir 10 agendamentos no MESMO horário
    FOR i IN 1..10 LOOP
        BEGIN
            INSERT INTO appointments (
                salon_id,
                professional_id,
                service_id,
                service,
                client_name,
                client_phone,
                date,
                time,
                start_time,
                end_time,
                duration,
                status,
                notes
            ) VALUES (
                v_salon_id,
                v_professional_id,
                v_service_id,
                'Serviço Teste ' || i,
                'Cliente Teste ' || i,
                '1199999000' || i,
                v_test_date,
                v_test_time,
                v_test_time,
                '15:00',
                60,
                'SCHEDULED',
                'TESTE_STRESS_OVERBOOKING'
            );

            v_success_count := v_success_count + 1;
            RAISE NOTICE 'INSERT % : SUCESSO', i;

        EXCEPTION WHEN exclusion_violation THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE 'INSERT % : BLOQUEADO (exclusion_violation) ✓', i;
        WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE 'INSERT % : ERRO - %', i, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'RESULTADO:';
    RAISE NOTICE '  Sucessos: % (esperado: 1)', v_success_count;
    RAISE NOTICE '  Bloqueados: % (esperado: 9)', v_error_count;
    RAISE NOTICE '----------------------------------------';

    IF v_success_count = 1 AND v_error_count = 9 THEN
        RAISE NOTICE '✅ TESTE PASSOU! Constraint funcionando corretamente.';
    ELSE
        RAISE NOTICE '❌ TESTE FALHOU! Constraint pode não estar ativa.';
    END IF;

    -- Limpa o registro de teste
    DELETE FROM appointments WHERE date = v_test_date AND notes = 'TESTE_STRESS_OVERBOOKING';
    RAISE NOTICE 'Limpeza final concluída.';
    RAISE NOTICE '========================================';

END $$;

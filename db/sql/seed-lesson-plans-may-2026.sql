-- Seed dos 3 planos pedagógicos de Maio/2026 (Adulto, Kids 1, Kids 2).
-- Idempotente: se já existir plano draft/published para o (account_id, plan_kind, '2026-05-01'),
-- o bloco emite NOTICE e ignora — não duplica nem sobrescreve.
--
-- Como rodar: SQL Editor do Supabase → New query → colar todo este ficheiro → Run.
-- Os planos ficam em estado `draft`. Publicar pela UI em /pedagogico/planos/[id].
--
-- Antes de rodar: editar v_account_id se for outra conta.

DO $$
DECLARE
  v_account_id uuid := '9e147254-434a-490d-b77b-941709434d3e';
  v_month date := '2026-05-01';
  v_plan_id uuid;
  v_rev_id uuid;
BEGIN
  -----------------------------------------------------------------------
  -- 1) Adulto · Maio/2026
  -----------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM public.lesson_plans
    WHERE account_id = v_account_id
      AND plan_kind  = 'adult'
      AND reference_month = v_month
      AND status <> 'archived'
  ) THEN
    INSERT INTO public.lesson_plans (account_id, plan_kind, reference_month, title, status)
    VALUES (v_account_id, 'adult', v_month, 'Adulto · Maio/2026', 'draft')
    RETURNING id INTO v_plan_id;

    INSERT INTO public.lesson_plan_revisions (lesson_plan_id, revision_number, content_json)
    VALUES (
      v_plan_id,
      1,
      jsonb_build_object(
        'summary',
        'Mês de finalização do ciclo de controle de adversários, com foco em estabilização de "100 quilos", controle da montada e transição para finalização. Inclui 4 quedas, 4 sequências de drills e revisão das aulas anteriores.',
        'topics',
        jsonb_build_array(
          jsonb_build_object(
            'id', 'adult-controle',
            'title', 'Controle de adversários',
            'kind', 'techniques',
            'summary', 'Encerrar o ciclo de controle do adversário no solo, fixando a estabilização da posição "100 quilos".',
            'items', jsonb_build_array(
              jsonb_build_object('id', 'adult-controle-i1', 'text', 'Finalização do ciclo de controle de adversários'),
              jsonb_build_object('id', 'adult-controle-i2', 'text', 'Estabilização na posição "100 quilos"')
            )
          ),
          jsonb_build_object(
            'id', 'adult-montada',
            'title', 'Montada e finalização',
            'kind', 'techniques',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'adult-montada-i1', 'text', 'Controle da montada'),
              jsonb_build_object('id', 'adult-montada-i2', 'text', 'Transição da montada para finalização')
            )
          ),
          jsonb_build_object(
            'id', 'adult-quedas',
            'title', 'Quedas',
            'kind', 'techniques',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'adult-quedas-i1', 'text', '4 quedas para o mês')
            )
          ),
          jsonb_build_object(
            'id', 'adult-drills',
            'title', 'Drills',
            'kind', 'drills',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'adult-drills-i1', 'text', '4 sequências de drills')
            )
          ),
          jsonb_build_object(
            'id', 'adult-revisao',
            'title', 'Revisão',
            'kind', 'section',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'adult-revisao-i1', 'text', 'Revisão das aulas anteriores')
            )
          )
        )
      )
    )
    RETURNING id INTO v_rev_id;

    UPDATE public.lesson_plans SET current_revision_id = v_rev_id WHERE id = v_plan_id;
    RAISE NOTICE 'Adulto · Maio/2026 criado: %', v_plan_id;
  ELSE
    RAISE NOTICE 'Adulto · Maio/2026 já existe; nada a fazer.';
  END IF;

  -----------------------------------------------------------------------
  -- 2) Kids 1 · Maio/2026
  -----------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM public.lesson_plans
    WHERE account_id = v_account_id
      AND plan_kind  = 'kids_1'
      AND reference_month = v_month
      AND status <> 'archived'
  ) THEN
    INSERT INTO public.lesson_plans (account_id, plan_kind, reference_month, title, status)
    VALUES (v_account_id, 'kids_1', v_month, 'Kids 1 · Maio/2026', 'draft')
    RETURNING id INTO v_plan_id;

    INSERT INTO public.lesson_plan_revisions (lesson_plan_id, revision_number, content_json)
    VALUES (
      v_plan_id,
      1,
      jsonb_build_object(
        'summary',
        'Aulas com aquecimento interativo e lúdico, uma brincadeira nova por semana e exploração das posições "100 quilos", joelho na barriga e montada em todas as aulas. Duas finalizações do mês: armlock pela montada e Nami Juji Jime. Inclui generalidades a estudar (história e cultura do BJJ).',
        'topics',
        jsonb_build_array(
          jsonb_build_object(
            'id', 'k1-aquec',
            'title', 'Aquecimento',
            'kind', 'section',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k1-aquec-i1', 'text', 'Aquecimento interativo e lúdico em todas as aulas')
            )
          ),
          jsonb_build_object(
            'id', 'k1-brinc',
            'title', 'Brincadeiras',
            'kind', 'section',
            'summary', 'Uma brincadeira nova por semana — total de 4 no mês.',
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k1-brinc-i1', 'text', '4 brincadeiras (uma por semana)')
            )
          ),
          jsonb_build_object(
            'id', 'k1-pos',
            'title', 'Posições centrais (em todas as aulas)',
            'kind', 'techniques',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k1-pos-i1', 'text', '"100 quilos"'),
              jsonb_build_object('id', 'k1-pos-i2', 'text', 'Joelho na barriga'),
              jsonb_build_object('id', 'k1-pos-i3', 'text', 'Montada')
            )
          ),
          jsonb_build_object(
            'id', 'k1-fin',
            'title', 'Finalizações',
            'kind', 'techniques',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k1-fin-i1', 'text', 'Armlock pela montada'),
              jsonb_build_object('id', 'k1-fin-i2', 'text', 'Nami Juji Jime — estrangulamento da montada com pegada na gola, polegar para dentro')
            )
          ),
          jsonb_build_object(
            'id', 'k1-gen',
            'title', 'Generalidades a estudar',
            'kind', 'general',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k1-gen-i1', 'text', 'Ano de fundação da academia'),
              jsonb_build_object('id', 'k1-gen-i2', 'text', 'Cores das faixas'),
              jsonb_build_object('id', 'k1-gen-i3', 'text', 'Quem fundou a academia'),
              jsonb_build_object('id', 'k1-gen-i4', 'text', 'Idade da academia'),
              jsonb_build_object('id', 'k1-gen-i5', 'text', 'Contagem em japonês')
            )
          )
        )
      )
    )
    RETURNING id INTO v_rev_id;

    UPDATE public.lesson_plans SET current_revision_id = v_rev_id WHERE id = v_plan_id;
    RAISE NOTICE 'Kids 1 · Maio/2026 criado: %', v_plan_id;
  ELSE
    RAISE NOTICE 'Kids 1 · Maio/2026 já existe; nada a fazer.';
  END IF;

  -----------------------------------------------------------------------
  -- 3) Kids 2 · Maio/2026
  -----------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM public.lesson_plans
    WHERE account_id = v_account_id
      AND plan_kind  = 'kids_2'
      AND reference_month = v_month
      AND status <> 'archived'
  ) THEN
    INSERT INTO public.lesson_plans (account_id, plan_kind, reference_month, title, status)
    VALUES (v_account_id, 'kids_2', v_month, 'Kids 2 · Maio/2026', 'draft')
    RETURNING id INTO v_plan_id;

    INSERT INTO public.lesson_plan_revisions (lesson_plan_id, revision_number, content_json)
    VALUES (
      v_plan_id,
      1,
      jsonb_build_object(
        'summary',
        'Mês com aquecimento de intensidade média, drills de passagem de guarda, foco na meia-guarda (4 raspagens e 2 finalizações) e 4 quedas.',
        'topics',
        jsonb_build_array(
          jsonb_build_object(
            'id', 'k2-aquec',
            'title', 'Aquecimento',
            'kind', 'section',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k2-aquec-i1', 'text', 'Aquecimento de intensidade média')
            )
          ),
          jsonb_build_object(
            'id', 'k2-pass',
            'title', 'Passagem de guarda',
            'kind', 'drills',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k2-pass-i1', 'text', 'Drills de passagem de guarda'),
              jsonb_build_object('id', 'k2-pass-i2', 'text', 'Pontinho 2x')
            )
          ),
          jsonb_build_object(
            'id', 'k2-mg',
            'title', 'Meia-guarda',
            'kind', 'techniques',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k2-mg-i1', 'text', '4 raspagens'),
              jsonb_build_object('id', 'k2-mg-i2', 'text', '2 finalizações')
            )
          ),
          jsonb_build_object(
            'id', 'k2-quedas',
            'title', 'Quedas',
            'kind', 'techniques',
            'summary', NULL,
            'items', jsonb_build_array(
              jsonb_build_object('id', 'k2-quedas-i1', 'text', '4 quedas')
            )
          )
        )
      )
    )
    RETURNING id INTO v_rev_id;

    UPDATE public.lesson_plans SET current_revision_id = v_rev_id WHERE id = v_plan_id;
    RAISE NOTICE 'Kids 2 · Maio/2026 criado: %', v_plan_id;
  ELSE
    RAISE NOTICE 'Kids 2 · Maio/2026 já existe; nada a fazer.';
  END IF;
END $$;

-- Verificação rápida (deve listar 3 linhas com current_revision_id preenchido):
-- SELECT plan_kind, reference_month, title, status, current_revision_id IS NOT NULL AS has_rev
-- FROM public.lesson_plans
-- WHERE account_id = '9e147254-434a-490d-b77b-941709434d3e'
--   AND reference_month = '2026-05-01'
-- ORDER BY plan_kind;

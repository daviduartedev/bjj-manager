-- =====================================================
-- Migração: remover "Juvenil" como plano comercial (kids_2 → Kids 2, R$ 100)
-- e mover vínculos abertos de kids_2 para kids_1 com preço base R$ 100.
-- Idempotente: segunda execução não duplica vínculos nem altera nome já normalizado.
-- Data civil de fecho/abertura: America/Sao_Paulo (alinhado à app).
-- =====================================================

-- Nomes e preços por defeito do antigo pacote (sem sobrescrever preços já diferentes de 12000 em kids_2)
UPDATE public.plans
SET
  name = 'Kids 1',
  updated_at = now()
WHERE
  kind = 'kids_1'
  AND name IN ('Kid 1', 'Kids 1');

UPDATE public.plans
SET
  name = 'Kids 2',
  updated_at = now()
WHERE
  kind = 'kids_2';

UPDATE public.plans
SET
  price_cents = 10000,
  updated_at = now()
WHERE
  kind = 'kids_2'
  AND price_cents = 12000;

-- Vínculos abertos em kids_2 → kids_1; custom_price limpo (valor efectivo = plano Kids 1)
DO $$
DECLARE
  r RECORD;
  v_kids1 uuid;
  v_today date := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  FOR r IN
    SELECT
      sp.id AS sp_id,
      sp.student_id,
      sp.due_day,
      s.account_id
    FROM
      public.student_plans sp
      INNER JOIN public.plans p ON p.id = sp.plan_id
      AND p.kind = 'kids_2'
      INNER JOIN public.students s ON s.id = sp.student_id
    WHERE
      sp.ended_at IS NULL
  LOOP
    SELECT
      id INTO v_kids1
    FROM
      public.plans
    WHERE
      account_id = r.account_id
      AND kind = 'kids_1'
    LIMIT
      1;

    IF v_kids1 IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.student_plans
    SET
      ended_at = v_today,
      updated_at = now()
    WHERE
      id = r.sp_id;

    INSERT INTO public.student_plans (
      student_id,
      plan_id,
      due_day,
      started_at,
      custom_price_cents
    )
    VALUES
      (r.student_id, v_kids1, r.due_day, v_today, NULL);
  END LOOP;
END
$$;

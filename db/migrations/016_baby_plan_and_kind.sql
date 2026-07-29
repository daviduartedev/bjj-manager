-- =====================================================
-- Migração: turma/plano Baby (idade 4–8, R$ 100/mês)
-- =====================================================

DO $$ BEGIN
  ALTER TYPE public.plan_kind ADD VALUE IF NOT EXISTS 'baby';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.student_kind ADD VALUE IF NOT EXISTS 'baby';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Plano Baby por conta existente (idempotente)
INSERT INTO
  public.plans (account_id, kind, name, price_cents, active)
SELECT
  a.id,
  'baby',
  'Baby',
  10000,
  true
FROM
  public.accounts a
ON CONFLICT ON CONSTRAINT plans_account_kind_unique DO NOTHING;

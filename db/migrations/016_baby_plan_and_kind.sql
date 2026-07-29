-- =====================================================
-- Migração 016: enums Baby (plan_kind + student_kind)
-- =====================================================
-- Postgres exige COMMIT antes de usar valores novos de enum (55P04).
-- O INSERT do plano Baby está em 017_baby_plan_seed.sql (próxima transação).

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

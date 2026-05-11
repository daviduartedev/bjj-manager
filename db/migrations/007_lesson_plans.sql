-- =====================================================
-- Migração 007: módulo pedagógico (PED-)
-- - lesson_plan_status enum
-- - lesson_plans (1 linha "lógica" por plano; estado e categoria)
-- - lesson_plan_revisions (snapshot do conteúdo a cada edição)
-- - lesson_plan_attachments (ficheiros anexos no bucket de planos)
-- Idempotente: enums via DO blocks; CREATE IF NOT EXISTS.
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.lesson_plan_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  plan_kind public.plan_kind NOT NULL,
  -- Mês de referência (sempre dia 1, alinhado com payments.reference_month).
  reference_month date NOT NULL,
  title text NOT NULL,
  status public.lesson_plan_status NOT NULL DEFAULT 'draft',
  -- Notas internas (não saem no PDF).
  internal_notes text NULL,
  current_revision_id uuid NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  archived_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_plans_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT lesson_plans_reference_month_first_day_ck CHECK (
    EXTRACT(DAY FROM reference_month) = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_account_kind_month
  ON public.lesson_plans (account_id, plan_kind, reference_month);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_account_status_updated
  ON public.lesson_plans (account_id, status, updated_at DESC);

-- Apenas um plano publicado por (account_id, plan_kind, reference_month).
CREATE UNIQUE INDEX IF NOT EXISTS uq_lesson_plans_one_published_per_kind_month
  ON public.lesson_plans (account_id, plan_kind, reference_month)
  WHERE status = 'published';

CREATE TABLE IF NOT EXISTS public.lesson_plan_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  lesson_plan_id uuid NOT NULL REFERENCES public.lesson_plans (id) ON DELETE CASCADE,
  revision_number integer NOT NULL,
  -- Conteúdo estruturado: { topics: [{ id, title, kind, items: [...] }], summary?: string }
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_summary text NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_plan_revisions_uq UNIQUE (lesson_plan_id, revision_number),
  CONSTRAINT lesson_plan_revisions_number_positive_ck CHECK (revision_number >= 1)
);

CREATE INDEX IF NOT EXISTS idx_lesson_plan_revisions_plan_created
  ON public.lesson_plan_revisions (lesson_plan_id, created_at DESC);

-- FK diferida: definimos depois para evitar ciclo na criação.
DO $$ BEGIN
  ALTER TABLE public.lesson_plans
    ADD CONSTRAINT lesson_plans_current_revision_fk
    FOREIGN KEY (current_revision_id)
    REFERENCES public.lesson_plan_revisions (id)
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.lesson_plan_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  lesson_plan_id uuid NOT NULL REFERENCES public.lesson_plans (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  filename text NOT NULL,
  mime_type text NOT NULL,
  byte_size integer NOT NULL,
  uploaded_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_plan_attachments_filename_not_blank CHECK (length(trim(filename)) > 0),
  CONSTRAINT lesson_plan_attachments_byte_size_non_negative CHECK (byte_size >= 0)
);

CREATE INDEX IF NOT EXISTS idx_lesson_plan_attachments_plan
  ON public.lesson_plan_attachments (lesson_plan_id);

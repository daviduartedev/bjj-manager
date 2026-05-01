-- =====================================================
-- BJJ Manager - Schema SQL (Supabase / Postgres)
-- =====================================================
-- Multi-tenant domain model. No RLS in this cycle.
-- Re-run safe: enums via DO blocks; CREATE IF NOT EXISTS for tables/indexes.
-- =====================================================

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE public.belt_kind AS ENUM ('adult', 'kids');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.student_kind AS ENUM ('adult', 'kids');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'trial', 'paused');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.plan_kind AS ENUM ('kids_1', 'kids_2', 'adult');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'unpaid', 'scholarship', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.belts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  kind public.belt_kind NOT NULL,
  slug text NOT NULL,
  ordinal smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT belts_kind_ordinal_unique UNIQUE (kind, ordinal),
  CONSTRAINT belts_slug_unique UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  kind public.student_kind NOT NULL,
  full_name text NOT NULL,
  current_belt_id uuid NOT NULL REFERENCES public.belts (id) ON DELETE RESTRICT,
  current_degree smallint NOT NULL,
  status public.student_status NOT NULL,
  birth_date date NULL,
  academy_start_date date NULL,
  document text NULL,
  phone text NULL,
  email text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT students_degree_bounds CHECK (
    current_degree >= 0
    AND current_degree <= 6
  )
);

CREATE TABLE IF NOT EXISTS public.student_graduations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  resulting_belt_id uuid NOT NULL REFERENCES public.belts (id) ON DELETE RESTRICT,
  resulting_degree smallint NOT NULL,
  graduated_at timestamptz NOT NULL,
  was_skip boolean NOT NULL DEFAULT false,
  skip_reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_graduations_skip_reason_ck CHECK (
    (
      NOT was_skip
      AND skip_reason IS NULL
    )
    OR (
      was_skip
      AND skip_reason IS NOT NULL
      AND length(trim(skip_reason)) > 0
    )
  ),
  CONSTRAINT student_graduations_degree_bounds CHECK (
    resulting_degree >= 0
    AND resulting_degree <= 6
  )
);

CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  kind public.plan_kind NOT NULL,
  name text NOT NULL,
  price_cents bigint NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plans_account_kind_unique UNIQUE (account_id, kind)
);

CREATE TABLE IF NOT EXISTS public.student_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans (id) ON DELETE RESTRICT,
  custom_price_cents bigint NULL,
  due_day smallint NOT NULL,
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  ended_at date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_plans_due_day_ck CHECK (
    due_day >= 1
    AND due_day <= 28
  )
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  amount_cents bigint NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_student_month_unique UNIQUE (student_id, reference_month),
  CONSTRAINT payments_reference_month_first_day_ck CHECK (
    EXTRACT(DAY FROM reference_month) = 1
  )
);

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS idx_students_account_id ON public.students (account_id);

CREATE INDEX IF NOT EXISTS idx_payments_student_reference ON public.payments (student_id, reference_month);

CREATE INDEX IF NOT EXISTS idx_student_graduations_student_graduated_at ON public.student_graduations (student_id, graduated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS student_plans_one_open_per_student ON public.student_plans (student_id)
WHERE
  ended_at IS NULL;

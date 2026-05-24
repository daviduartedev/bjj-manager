-- =====================================================
-- Casca - Gestão de Academias de BJJ - Schema SQL (Supabase / Postgres)
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

DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM (
    'payment_receipt',
    'enrollment_proof',
    'certificate',
    'liability_term',
    'manual_receipt'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.generated_document_status AS ENUM (
    'pending',
    'ready',
    'failed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_channel AS ENUM (
    'download',
    'whatsapp',
    'browser_open',
    'reissue'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM (
    'requested',
    'completed',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lesson_plan_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.profile_role AS ENUM ('professor', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.attendance_origin AS ENUM ('checkin_student', 'manual_instructor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text NOT NULL,
  legal_name text NULL,
  cnpj text NULL,
  signature_url text NULL,
  logo_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounts_cnpj_format_ck CHECK (
    cnpj IS NULL OR cnpj ~ '^[0-9]{14}$'
  ),
  CONSTRAINT accounts_legal_name_not_blank CHECK (
    legal_name IS NULL OR length(trim(legal_name)) > 0
  )
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  display_name text NOT NULL,
  phone text NULL,
  role public.profile_role NOT NULL DEFAULT 'professor',
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
  archived_at timestamptz NULL,
  removed_at timestamptz NULL,
  lifecycle_updated_at timestamptz NULL,
  lifecycle_updated_by uuid NULL REFERENCES public.profiles (id),
  user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  portal_terms_accepted_at timestamptz NULL,
  guardian_email text NULL,
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
  payment_method text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_student_month_unique UNIQUE (student_id, reference_month),
  CONSTRAINT payments_reference_month_first_day_ck CHECK (
    EXTRACT(DAY FROM reference_month) = 1
  )
);

-- Idempotente: bases já criadas antes desta coluna
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_method text NULL;

-- ---------- Products (controle interno por conta) ----------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  audience text NOT NULL DEFAULT 'unisex',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_account_code_unique UNIQUE (account_id, code),
  CONSTRAINT products_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT products_code_not_blank CHECK (length(trim(code)) > 0),
  CONSTRAINT products_audience_check CHECK (
    audience IN ('unisex', 'masculine', 'feminine')
  )
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  size_label text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  line text NOT NULL DEFAULT 'unisex',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_product_size_unique UNIQUE (product_id, size_label),
  CONSTRAINT product_variants_size_not_blank CHECK (length(trim(size_label)) > 0),
  CONSTRAINT product_variants_stock_non_negative CHECK (stock_quantity >= 0),
  CONSTRAINT product_variants_line_check CHECK (line IN ('unisex', 'feminine'))
);

-- ---------- Documents core (DOC- / REC-) ----------
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  version integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  storage_path text NULL,
  defaults_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_templates_account_type_version_uq UNIQUE (account_id, type, version),
  CONSTRAINT document_templates_version_positive_ck CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS public.generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  status public.generated_document_status NOT NULL DEFAULT 'pending',
  number text NULL,
  version integer NOT NULL DEFAULT 1,
  supersedes_id uuid NULL REFERENCES public.generated_documents (id) ON DELETE SET NULL,
  idempotency_key text NULL,
  student_id uuid NULL REFERENCES public.students (id) ON DELETE SET NULL,
  payment_id uuid NULL REFERENCES public.payments (id) ON DELETE SET NULL,
  template_id uuid NULL REFERENCES public.document_templates (id) ON DELETE SET NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_path text NULL,
  html_path text NULL,
  byte_size integer NULL,
  error_code text NULL,
  error_message text NULL,
  reissue_reason text NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generated_documents_version_positive_ck CHECK (version >= 1),
  CONSTRAINT generated_documents_status_consistency_ck CHECK (
    (status = 'failed' AND error_code IS NOT NULL)
    OR (status <> 'failed')
  )
);

CREATE TABLE IF NOT EXISTS public.generated_document_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  document_id uuid NOT NULL REFERENCES public.generated_documents (id) ON DELETE CASCADE,
  channel public.delivery_channel NOT NULL,
  status public.delivery_status NOT NULL DEFAULT 'completed',
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  performed_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_sequences (
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  year smallint NOT NULL,
  last_seq integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_sequences_pk PRIMARY KEY (account_id, type, year),
  CONSTRAINT document_sequences_seq_non_negative CHECK (last_seq >= 0),
  CONSTRAINT document_sequences_year_bounds CHECK (year BETWEEN 2000 AND 2999)
);

CREATE OR REPLACE FUNCTION public.reserve_document_number (
  p_account_id uuid,
  p_type public.document_type,
  p_year smallint
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next integer;
BEGIN
  INSERT INTO public.document_sequences (account_id, type, year, last_seq, updated_at)
  VALUES (p_account_id, p_type, p_year, 1, now())
  ON CONFLICT (account_id, type, year)
  DO UPDATE SET last_seq = public.document_sequences.last_seq + 1, updated_at = now()
  RETURNING last_seq INTO v_next;
  RETURN v_next;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_document_number (uuid, public.document_type, smallint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_document_number (uuid, public.document_type, smallint) TO authenticated;

-- ---------- Lesson plans (PED-) ----------
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  plan_kind public.plan_kind NOT NULL,
  reference_month date NOT NULL,
  title text NOT NULL,
  status public.lesson_plan_status NOT NULL DEFAULT 'draft',
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

CREATE TABLE IF NOT EXISTS public.lesson_plan_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  lesson_plan_id uuid NOT NULL REFERENCES public.lesson_plans (id) ON DELETE CASCADE,
  revision_number integer NOT NULL,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_summary text NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_plan_revisions_uq UNIQUE (lesson_plan_id, revision_number),
  CONSTRAINT lesson_plan_revisions_number_positive_ck CHECK (revision_number >= 1)
);

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

CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  name text NOT NULL,
  kind public.student_kind NOT NULL,
  instructor_profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE TABLE IF NOT EXISTS public.class_recurring_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_recurring_schedules_day_of_week_ck CHECK (day_of_week BETWEEN 1 AND 7),
  CONSTRAINT class_recurring_schedules_time_order_ck CHECK (end_time > start_time),
  CONSTRAINT class_recurring_schedules_class_day_start_unique UNIQUE (class_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS public.class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity integer NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_sessions_time_order_ck CHECK (end_time > start_time),
  CONSTRAINT class_sessions_capacity_positive_ck CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT class_sessions_class_date_start_unique UNIQUE (class_id, session_date, start_time)
);

CREATE TABLE IF NOT EXISTS public.student_class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_class_enrollments_student_class_unique UNIQUE (student_id, class_id)
);

CREATE TABLE IF NOT EXISTS public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  class_session_id uuid NOT NULL REFERENCES public.class_sessions (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_ins_session_student_unique UNIQUE (class_session_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  class_session_id uuid NOT NULL REFERENCES public.class_sessions (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  origin public.attendance_origin NOT NULL,
  CONSTRAINT attendances_session_student_unique UNIQUE (class_session_id, student_id)
);

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS idx_students_account_id ON public.students (account_id);

CREATE INDEX IF NOT EXISTS idx_payments_student_reference ON public.payments (student_id, reference_month);

CREATE INDEX IF NOT EXISTS idx_student_graduations_student_graduated_at ON public.student_graduations (student_id, graduated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS student_plans_one_open_per_student ON public.student_plans (student_id)
WHERE
  ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_account_id ON public.products (account_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);

CREATE INDEX IF NOT EXISTS idx_document_templates_type_active
  ON public.document_templates (type, is_active);

CREATE UNIQUE INDEX IF NOT EXISTS uq_generated_documents_account_idem_key
  ON public.generated_documents (account_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generated_documents_account_type_created
  ON public.generated_documents (account_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_documents_student_created
  ON public.generated_documents (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_documents_payment
  ON public.generated_documents (payment_id);

CREATE INDEX IF NOT EXISTS idx_generated_documents_supersedes
  ON public.generated_documents (supersedes_id);

CREATE INDEX IF NOT EXISTS idx_generated_document_deliveries_document_created
  ON public.generated_document_deliveries (document_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_account_kind_month
  ON public.lesson_plans (account_id, plan_kind, reference_month);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_account_status_updated
  ON public.lesson_plans (account_id, status, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lesson_plans_one_published_per_kind_month
  ON public.lesson_plans (account_id, plan_kind, reference_month)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_lesson_plan_revisions_plan_created
  ON public.lesson_plan_revisions (lesson_plan_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_plan_attachments_plan
  ON public.lesson_plan_attachments (lesson_plan_id);

CREATE INDEX IF NOT EXISTS idx_classes_account_id ON public.classes (account_id);

CREATE INDEX IF NOT EXISTS idx_classes_instructor_profile_id ON public.classes (instructor_profile_id);

CREATE INDEX IF NOT EXISTS idx_class_recurring_schedules_account_id ON public.class_recurring_schedules (account_id);

CREATE INDEX IF NOT EXISTS idx_class_recurring_schedules_class_id ON public.class_recurring_schedules (class_id);

CREATE INDEX IF NOT EXISTS idx_class_sessions_account_id ON public.class_sessions (account_id);

CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON public.class_sessions (class_id);

CREATE INDEX IF NOT EXISTS idx_class_sessions_session_date ON public.class_sessions (session_date);

CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_account_id ON public.student_class_enrollments (account_id);

CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_student_id ON public.student_class_enrollments (student_id);

CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_class_id ON public.student_class_enrollments (class_id);

CREATE INDEX IF NOT EXISTS idx_check_ins_account_id ON public.check_ins (account_id);

CREATE INDEX IF NOT EXISTS idx_check_ins_class_session_id ON public.check_ins (class_session_id);

CREATE INDEX IF NOT EXISTS idx_check_ins_student_id ON public.check_ins (student_id);

CREATE INDEX IF NOT EXISTS idx_attendances_account_id ON public.attendances (account_id);

CREATE INDEX IF NOT EXISTS idx_attendances_class_session_id ON public.attendances (class_session_id);

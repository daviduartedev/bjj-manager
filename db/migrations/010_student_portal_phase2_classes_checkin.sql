-- =====================================================
-- Migração 010: Portal do Aluno — Fase 2 (turmas, sessões, check-in)
-- - enum attendance_origin
-- - classes, class_recurring_schedules, class_sessions
-- - student_class_enrollments, check_ins, attendances
--
-- SEGURANÇA DE DADOS: este ficheiro contém **apenas DDL aditivo**.
-- Políticas RLS: db/policies.sql (re-aplicado por pnpm db:apply).
-- Idempotente: enums via DO blocks; CREATE TABLE IF NOT EXISTS; CREATE INDEX IF NOT EXISTS.
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.attendance_origin AS ENUM ('checkin_student', 'manual_instructor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

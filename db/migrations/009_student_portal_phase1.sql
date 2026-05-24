-- =====================================================
-- Migração 009: Portal do Aluno — Fase 1 (schema + preparação RLS)
-- - enum profile_role
-- - profiles.role (default professor)
-- - students.user_id, portal_terms_accepted_at, guardian_email
--
-- SEGURANÇA DE DADOS: este ficheiro contém **apenas DDL aditivo**.
-- Proibido: UPDATE, INSERT, DELETE, TRUNCATE ou backfill em linhas existentes.
-- Linhas actuais recebem defaults via ADD COLUMN (role=professor, user_id NULL).
-- Políticas RLS: db/policies.sql (re-aplicado por pnpm db:apply).
-- Idempotente: enums via DO blocks; ADD COLUMN IF NOT EXISTS; CREATE INDEX IF NOT EXISTS.
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.profile_role AS ENUM ('professor', 'student');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.profile_role NOT NULL DEFAULT 'professor';

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS portal_terms_accepted_at timestamptz NULL;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS guardian_email text NULL;

CREATE UNIQUE INDEX IF NOT EXISTS students_account_user_id_unique
  ON public.students (account_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_user_id
  ON public.students (user_id)
  WHERE user_id IS NOT NULL;

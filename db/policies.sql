-- =====================================================
-- Casca - Gestão de Academias de BJJ — Row Level Security (Supabase / Postgres)
-- =====================================================
-- Run after schema.sql + seed.sql (see pnpm db:apply).
-- Idempotent: DROP POLICY IF EXISTS before CREATE.
-- =====================================================

-- ---------- Helper: current tenant from auth session ----------
CREATE OR REPLACE FUNCTION public.current_account_id () RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.account_id
  FROM public.profiles p
  WHERE p.user_id = auth.uid ()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_account_id () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_account_id () TO authenticated;

COMMENT ON FUNCTION public.current_account_id () IS 'Returns profiles.account_id for auth.uid(); SEC-1 in spec/features/rls-security/readme.md';

-- ---------- Enable RLS ----------
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_graduations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.belts ENABLE ROW LEVEL SECURITY;

-- ---------- accounts (no INSERT for authenticated — bootstrap via postgres) ----------
DROP POLICY IF EXISTS accounts_select_own ON public.accounts;

DROP POLICY IF EXISTS accounts_update_own ON public.accounts;

DROP POLICY IF EXISTS accounts_delete_own ON public.accounts;

CREATE POLICY accounts_select_own ON public.accounts FOR SELECT TO authenticated USING (id = public.current_account_id ());

CREATE POLICY accounts_update_own ON public.accounts FOR UPDATE TO authenticated USING (id = public.current_account_id ())
WITH
  CHECK (id = public.current_account_id ());

CREATE POLICY accounts_delete_own ON public.accounts FOR DELETE TO authenticated USING (id = public.current_account_id ());

-- ---------- profiles ----------
DROP POLICY IF EXISTS profiles_select_same_account ON public.profiles;

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;

DROP POLICY IF EXISTS profiles_delete_self ON public.profiles;

CREATE POLICY profiles_select_same_account ON public.profiles FOR SELECT TO authenticated USING (account_id = public.current_account_id ());

CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    user_id = auth.uid ()
    AND account_id = public.current_account_id ()
  );

CREATE POLICY profiles_delete_self ON public.profiles FOR DELETE TO authenticated USING (
  user_id = auth.uid ()
  AND account_id = public.current_account_id ()
);

-- ---------- students ----------
DROP POLICY IF EXISTS students_tenant_all ON public.students;

CREATE POLICY students_tenant_all ON public.students FOR ALL TO authenticated USING (account_id = public.current_account_id ())
WITH
  CHECK (account_id = public.current_account_id ());

-- ---------- plans ----------
DROP POLICY IF EXISTS plans_tenant_all ON public.plans;

CREATE POLICY plans_tenant_all ON public.plans FOR ALL TO authenticated USING (account_id = public.current_account_id ())
WITH
  CHECK (account_id = public.current_account_id ());

-- ---------- student_graduations ----------
DROP POLICY IF EXISTS student_graduations_by_student_tenant ON public.student_graduations;

CREATE POLICY student_graduations_by_student_tenant ON public.student_graduations FOR ALL TO authenticated USING (
  EXISTS (
    SELECT
      1
    FROM
      public.students s
    WHERE
      s.id = student_graduations.student_id
      AND s.account_id = public.current_account_id ()
  )
)
WITH
  CHECK (
    EXISTS (
      SELECT
        1
      FROM
        public.students s
      WHERE
        s.id = student_graduations.student_id
        AND s.account_id = public.current_account_id ()
    )
  );

-- ---------- payments ----------
DROP POLICY IF EXISTS payments_by_student_tenant ON public.payments;

CREATE POLICY payments_by_student_tenant ON public.payments FOR ALL TO authenticated USING (
  EXISTS (
    SELECT
      1
    FROM
      public.students s
    WHERE
      s.id = payments.student_id
      AND s.account_id = public.current_account_id ()
  )
)
WITH
  CHECK (
    EXISTS (
      SELECT
        1
      FROM
        public.students s
      WHERE
        s.id = payments.student_id
        AND s.account_id = public.current_account_id ()
    )
  );

-- ---------- student_plans (student + plan same account) ----------
DROP POLICY IF EXISTS student_plans_tenant_consistent ON public.student_plans;

CREATE POLICY student_plans_tenant_consistent ON public.student_plans FOR ALL TO authenticated USING (
  EXISTS (
    SELECT
      1
    FROM
      public.students s
      INNER JOIN public.plans p ON p.id = student_plans.plan_id
    WHERE
      s.id = student_plans.student_id
      AND s.account_id = public.current_account_id ()
      AND p.account_id = s.account_id
  )
)
WITH
  CHECK (
    EXISTS (
      SELECT
        1
      FROM
        public.students s
        INNER JOIN public.plans p ON p.id = student_plans.plan_id
      WHERE
        s.id = student_plans.student_id
        AND s.account_id = public.current_account_id ()
        AND p.account_id = s.account_id
    )
  );

-- ---------- belts: catalog read-only for authenticated; anon has no policy ----------
DROP POLICY IF EXISTS belts_select_authenticated ON public.belts;

CREATE POLICY belts_select_authenticated ON public.belts FOR SELECT TO authenticated USING (TRUE);

-- =====================================================
-- Casca - Gestão de Academias de BJJ , Row Level Security (Supabase / Postgres)
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

-- ---------- Helper: current application role from auth session ----------
CREATE OR REPLACE FUNCTION public.current_profile_role () RETURNS public.profile_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.user_id = auth.uid ()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_profile_role () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_profile_role () TO authenticated;

COMMENT ON FUNCTION public.current_profile_role () IS 'Returns profiles.role for auth.uid(), or NULL when the profile is missing; SEC-1.4 in spec/features/rls-security/readme.md';

-- ---------- Named capabilities (fail closed: missing role is false, not professor) ----------
CREATE OR REPLACE FUNCTION public.can_manage_finance () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_finance () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_finance () TO authenticated;

COMMENT ON FUNCTION public.can_manage_finance () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_students () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_students () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_students () TO authenticated;

COMMENT ON FUNCTION public.can_manage_students () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_graduations () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_graduations () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_graduations () TO authenticated;

COMMENT ON FUNCTION public.can_manage_graduations () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_classes () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_classes () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_classes () TO authenticated;

COMMENT ON FUNCTION public.can_manage_classes () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_documents () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_documents () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_documents () TO authenticated;

COMMENT ON FUNCTION public.can_manage_documents () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_commercial_plans () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_commercial_plans () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_commercial_plans () TO authenticated;

COMMENT ON FUNCTION public.can_manage_commercial_plans () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_manage_lesson_plans () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_lesson_plans () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_lesson_plans () TO authenticated;

COMMENT ON FUNCTION public.can_manage_lesson_plans () IS 'True only for professor; false when the role is missing. Plano de aula is its own capability';

CREATE OR REPLACE FUNCTION public.can_manage_account_settings () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_manage_account_settings () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_manage_account_settings () TO authenticated;

COMMENT ON FUNCTION public.can_manage_account_settings () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_delete_account () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'professor'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_delete_account () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_delete_account () TO authenticated;

COMMENT ON FUNCTION public.can_delete_account () IS 'True only for professor; false when the role is missing';

CREATE OR REPLACE FUNCTION public.can_use_portal_self () RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role () = 'student'::public.profile_role, false);
$$;

REVOKE ALL ON FUNCTION public.can_use_portal_self () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_use_portal_self () TO authenticated;

COMMENT ON FUNCTION public.can_use_portal_self () IS 'True only for student; false when the role is missing';

-- ---------- Helper: current student row from auth session (portal) ----------
CREATE OR REPLACE FUNCTION public.current_student_id () RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id
  FROM public.students s
  WHERE s.user_id = auth.uid ()
    AND s.account_id = public.current_account_id ()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_student_id () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_student_id () TO authenticated;

COMMENT ON FUNCTION public.current_student_id () IS 'Returns students.id for auth.uid() in current account; SEC-3.7 portal Fase 2';

-- ---------- Shop (portal Fase 3 — SPT-8) ----------
CREATE OR REPLACE FUNCTION public.expire_stale_reservations (p_account_id uuid) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  rec record;
BEGIN
  IF p_account_id IS NULL THEN
    RETURN 0;
  END IF;

  FOR rec IN
    SELECT r.id, r.product_variant_id
    FROM public.reservations r
    WHERE r.account_id = p_account_id
      AND r.status = 'pending_payment'::public.reservation_status
      AND r.expires_at < now()
    FOR UPDATE OF r
  LOOP
    UPDATE public.reservations
    SET status = 'expired'::public.reservation_status, updated_at = now()
    WHERE id = rec.id;

    UPDATE public.product_variants
    SET stock_quantity = stock_quantity + 1, updated_at = now()
    WHERE id = rec.product_variant_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_reservations (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.expire_stale_reservations (uuid) TO authenticated;

COMMENT ON FUNCTION public.expire_stale_reservations (uuid) IS 'Marks expired pending reservations and restores variant stock; SPT-8.4 lazy expiration';

CREATE OR REPLACE FUNCTION public.reserve_product_variant (p_variant_id uuid) RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
  v_account_id uuid;
  v_variant public.product_variants;
  v_product public.products;
  v_reservation public.reservations;
BEGIN
  IF public.current_profile_role () <> 'student'::public.profile_role THEN
    RAISE EXCEPTION 'Apenas alunos podem reservar produtos.';
  END IF;

  v_student_id := public.current_student_id ();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Aluno não encontrado para este utilizador.';
  END IF;

  v_account_id := public.current_account_id ();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Conta não encontrada.';
  END IF;

  PERFORM public.expire_stale_reservations (v_account_id);

  SELECT pv.* INTO v_variant
  FROM public.product_variants pv
  INNER JOIN public.products p ON p.id = pv.product_id
  WHERE pv.id = p_variant_id AND p.account_id = v_account_id
  FOR UPDATE OF pv;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variante não encontrada.';
  END IF;

  SELECT * INTO v_product FROM public.products WHERE id = v_variant.product_id;

  IF NOT v_product.active OR NOT v_product.portal_visible THEN
    RAISE EXCEPTION 'Produto não disponível para reserva.';
  END IF;

  IF v_variant.price_cents IS NULL OR v_variant.price_cents < 0 THEN
    RAISE EXCEPTION 'Variante sem preço configurado.';
  END IF;

  IF v_variant.stock_quantity <= 0 THEN
    RAISE EXCEPTION 'Sem estoque disponível.';
  END IF;

  UPDATE public.product_variants
  SET stock_quantity = stock_quantity - 1, updated_at = now()
  WHERE id = p_variant_id AND stock_quantity > 0
  RETURNING * INTO v_variant;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sem estoque disponível.';
  END IF;

  INSERT INTO public.reservations (
    account_id, student_id, product_variant_id, status, price_cents, expires_at
  ) VALUES (
    v_account_id, v_student_id, p_variant_id,
    'pending_payment'::public.reservation_status,
    v_variant.price_cents, now() + interval '72 hours'
  )
  RETURNING * INTO v_reservation;

  RETURN v_reservation;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_product_variant (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.reserve_product_variant (uuid) TO authenticated;

COMMENT ON FUNCTION public.reserve_product_variant (uuid) IS 'Atomic shop reservation: decrement variant stock, insert pending_payment reservation; SPT-8.3';

-- ---------- Enable RLS ----------
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_graduations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.belts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.generated_document_deliveries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_plan_revisions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_plan_attachments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.class_recurring_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_class_enrollments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- ---------- accounts (no INSERT for authenticated , bootstrap via postgres) ----------
DROP POLICY IF EXISTS accounts_select_own ON public.accounts;

DROP POLICY IF EXISTS accounts_update_own ON public.accounts;

DROP POLICY IF EXISTS accounts_delete_own ON public.accounts;

CREATE POLICY accounts_select_own ON public.accounts FOR SELECT TO authenticated USING (id = public.current_account_id ());

DROP POLICY IF EXISTS accounts_update_own ON public.accounts;

DROP POLICY IF EXISTS accounts_update_professor ON public.accounts;

CREATE POLICY accounts_update_professor ON public.accounts FOR UPDATE TO authenticated USING (
  id = public.current_account_id ()
  AND public.can_manage_account_settings ()
)
WITH
  CHECK (
    id = public.current_account_id ()
    AND public.can_manage_account_settings ()
  );

CREATE POLICY accounts_delete_own ON public.accounts FOR DELETE TO authenticated USING (
  id = public.current_account_id ()
  AND public.can_delete_account ()
);

-- ---------- profiles ----------
DROP POLICY IF EXISTS profiles_select_same_account ON public.profiles;

DROP POLICY IF EXISTS profiles_select_operational ON public.profiles;

DROP POLICY IF EXISTS profiles_select_student_self ON public.profiles;

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;

DROP POLICY IF EXISTS profiles_delete_self ON public.profiles;

CREATE POLICY profiles_select_operational ON public.profiles FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'professor'::public.profile_role
  AND account_id = public.current_account_id ()
);

CREATE POLICY profiles_select_student_self ON public.profiles FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND user_id = auth.uid ()
);

CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    user_id = auth.uid ()
    AND account_id = public.current_account_id ()
    AND role = (
      SELECT p.role
      FROM public.profiles p
      WHERE p.id = profiles.id
    )
  );

CREATE POLICY profiles_delete_self ON public.profiles FOR DELETE TO authenticated USING (
  user_id = auth.uid ()
  AND account_id = public.current_account_id ()
);

-- ---------- students ----------
DROP POLICY IF EXISTS students_tenant_all ON public.students;

DROP POLICY IF EXISTS students_operational_all ON public.students;

DROP POLICY IF EXISTS students_student_select ON public.students;

DROP POLICY IF EXISTS students_student_update ON public.students;

CREATE POLICY students_operational_all ON public.students FOR ALL TO authenticated USING (
  public.current_profile_role () = 'professor'::public.profile_role
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    public.current_profile_role () = 'professor'::public.profile_role
    AND account_id = public.current_account_id ()
  );

CREATE POLICY students_student_select ON public.students FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND user_id = auth.uid ()
);

CREATE POLICY students_student_update ON public.students FOR UPDATE TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND user_id = auth.uid ()
)
WITH
  CHECK (
    public.current_profile_role () = 'student'::public.profile_role
    AND user_id = auth.uid ()
    AND account_id = public.current_account_id ()
  );

-- Aluno só altera o aceite do portal e o e-mail do responsável na própria ficha.
-- O gatilho corre em todo UPDATE, mas só recusa quando o ator é aluno.
-- Professor passa sem alteração. updated_at pode mudar com os dois campos.
-- Sem policy de INSERT ou DELETE para o aluno.
CREATE OR REPLACE FUNCTION public.guard_student_self_ficha_columns () RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  old_rest jsonb;
  new_rest jsonb;
BEGIN
  IF NOT public.can_use_portal_self () THEN
    RETURN NEW;
  END IF;

  old_rest := to_jsonb (OLD) - ARRAY[
    'portal_terms_accepted_at',
    'guardian_email',
    'updated_at'
  ];
  new_rest := to_jsonb (NEW) - ARRAY[
    'portal_terms_accepted_at',
    'guardian_email',
    'updated_at'
  ];

  IF old_rest IS DISTINCT FROM new_rest THEN
    RAISE EXCEPTION 'Aluno só pode alterar o aceite do portal e o e-mail do responsável.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_student_self_ficha_columns () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.guard_student_self_ficha_columns () TO authenticated;

COMMENT ON FUNCTION public.guard_student_self_ficha_columns () IS 'On a student self-update of students, allows only portal_terms_accepted_at, guardian_email, and updated_at; other roles are unchanged';

DROP TRIGGER IF EXISTS students_guard_self_ficha_columns ON public.students;

CREATE TRIGGER students_guard_self_ficha_columns
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.guard_student_self_ficha_columns ();

-- ---------- plans ----------
DROP POLICY IF EXISTS plans_tenant_all ON public.plans;

CREATE POLICY plans_tenant_all ON public.plans FOR ALL TO authenticated USING (
  public.can_manage_commercial_plans ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    public.can_manage_commercial_plans ()
    AND account_id = public.current_account_id ()
  );

-- ---------- student_graduations ----------
DROP POLICY IF EXISTS student_graduations_by_student_tenant ON public.student_graduations;

CREATE POLICY student_graduations_by_student_tenant ON public.student_graduations FOR ALL TO authenticated USING (
  public.can_manage_graduations ()
  AND EXISTS (
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
    public.can_manage_graduations ()
    AND EXISTS (
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
  public.can_manage_finance ()
  AND EXISTS (
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
    public.can_manage_finance ()
    AND EXISTS (
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
  public.can_manage_commercial_plans ()
  AND EXISTS (
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
    public.can_manage_commercial_plans ()
    AND EXISTS (
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

-- ---------- products ----------
DROP POLICY IF EXISTS products_tenant_all ON public.products;

DROP POLICY IF EXISTS products_operational_all ON public.products;

DROP POLICY IF EXISTS products_student_select ON public.products;

CREATE POLICY products_operational_all ON public.products FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    public.can_manage_students ()
    AND account_id = public.current_account_id ()
  );

CREATE POLICY products_student_select ON public.products FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND account_id = public.current_account_id ()
  AND active = true
  AND portal_visible = true
);

-- ---------- product_variants ----------
DROP POLICY IF EXISTS product_variants_by_product_tenant ON public.product_variants;

DROP POLICY IF EXISTS product_variants_operational_all ON public.product_variants;

DROP POLICY IF EXISTS product_variants_student_select ON public.product_variants;

CREATE POLICY product_variants_operational_all ON public.product_variants FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND EXISTS (
    SELECT
      1
    FROM
      public.products p
    WHERE
      p.id = product_variants.product_id
      AND p.account_id = public.current_account_id ()
  )
)
WITH
  CHECK (
    public.can_manage_students ()
    AND EXISTS (
      SELECT
        1
      FROM
        public.products p
      WHERE
        p.id = product_variants.product_id
        AND p.account_id = public.current_account_id ()
    )
  );

CREATE POLICY product_variants_student_select ON public.product_variants FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND EXISTS (
    SELECT
      1
    FROM
      public.products p
    WHERE
      p.id = product_variants.product_id
      AND p.account_id = public.current_account_id ()
      AND p.active = true
      AND p.portal_visible = true
  )
  AND stock_quantity > 0
  AND price_cents IS NOT NULL
);

-- ---------- reservations (portal Fase 3) ----------
DROP POLICY IF EXISTS reservations_operational_all ON public.reservations;

DROP POLICY IF EXISTS reservations_student_select ON public.reservations;

CREATE POLICY reservations_operational_all ON public.reservations FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    public.can_manage_students ()
    AND account_id = public.current_account_id ()
  );

CREATE POLICY reservations_student_select ON public.reservations FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
);

-- ---------- document_templates: professor lê globais (account_id IS NULL) e da academia; escrita só da academia ----------
DROP POLICY IF EXISTS document_templates_select ON public.document_templates;

DROP POLICY IF EXISTS document_templates_modify_tenant ON public.document_templates;

CREATE POLICY document_templates_select ON public.document_templates FOR SELECT TO authenticated USING (
  public.can_manage_documents ()
  AND (
    account_id IS NULL
    OR account_id = public.current_account_id ()
  )
);

CREATE POLICY document_templates_modify_tenant ON public.document_templates FOR ALL TO authenticated USING (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
);

-- ---------- generated_documents ----------
DROP POLICY IF EXISTS generated_documents_tenant_all ON public.generated_documents;

CREATE POLICY generated_documents_tenant_all ON public.generated_documents FOR ALL TO authenticated USING (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
);

-- ---------- generated_document_deliveries (via parent) ----------
DROP POLICY IF EXISTS generated_document_deliveries_by_doc_tenant ON public.generated_document_deliveries;

CREATE POLICY generated_document_deliveries_by_doc_tenant ON public.generated_document_deliveries FOR ALL TO authenticated USING (
  public.can_manage_documents ()
  AND EXISTS (
    SELECT 1
    FROM public.generated_documents d
    WHERE d.id = generated_document_deliveries.document_id
      AND d.account_id = public.current_account_id ()
  )
)
WITH CHECK (
  public.can_manage_documents ()
  AND EXISTS (
    SELECT 1
    FROM public.generated_documents d
    WHERE d.id = generated_document_deliveries.document_id
      AND d.account_id = public.current_account_id ()
  )
);

-- ---------- document_sequences ----------
DROP POLICY IF EXISTS document_sequences_tenant_all ON public.document_sequences;

CREATE POLICY document_sequences_tenant_all ON public.document_sequences FOR ALL TO authenticated USING (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
);

-- ---------- lesson_plans ----------
DROP POLICY IF EXISTS lesson_plans_tenant_all ON public.lesson_plans;

CREATE POLICY lesson_plans_tenant_all ON public.lesson_plans FOR ALL TO authenticated USING (
  public.can_manage_lesson_plans ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_lesson_plans ()
  AND account_id = public.current_account_id ()
);

-- ---------- lesson_plan_revisions (via parent) ----------
DROP POLICY IF EXISTS lesson_plan_revisions_by_plan_tenant ON public.lesson_plan_revisions;

CREATE POLICY lesson_plan_revisions_by_plan_tenant ON public.lesson_plan_revisions FOR ALL TO authenticated USING (
  public.can_manage_lesson_plans ()
  AND EXISTS (
    SELECT 1
    FROM public.lesson_plans lp
    WHERE lp.id = lesson_plan_revisions.lesson_plan_id
      AND lp.account_id = public.current_account_id ()
  )
)
WITH CHECK (
  public.can_manage_lesson_plans ()
  AND EXISTS (
    SELECT 1
    FROM public.lesson_plans lp
    WHERE lp.id = lesson_plan_revisions.lesson_plan_id
      AND lp.account_id = public.current_account_id ()
  )
);

-- ---------- lesson_plan_attachments (via parent) ----------
DROP POLICY IF EXISTS lesson_plan_attachments_by_plan_tenant ON public.lesson_plan_attachments;

CREATE POLICY lesson_plan_attachments_by_plan_tenant ON public.lesson_plan_attachments FOR ALL TO authenticated USING (
  public.can_manage_lesson_plans ()
  AND EXISTS (
    SELECT 1
    FROM public.lesson_plans lp
    WHERE lp.id = lesson_plan_attachments.lesson_plan_id
      AND lp.account_id = public.current_account_id ()
  )
)
WITH CHECK (
  public.can_manage_lesson_plans ()
  AND EXISTS (
    SELECT 1
    FROM public.lesson_plans lp
    WHERE lp.id = lesson_plan_attachments.lesson_plan_id
      AND lp.account_id = public.current_account_id ()
  )
);

-- ---------- classes (portal Fase 2) ----------
DROP POLICY IF EXISTS classes_operational_all ON public.classes;

DROP POLICY IF EXISTS classes_student_select ON public.classes;

CREATE POLICY classes_operational_all ON public.classes FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

CREATE POLICY classes_student_select ON public.classes FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND EXISTS (
    SELECT 1
    FROM public.student_class_enrollments e
    WHERE e.class_id = classes.id
      AND e.student_id = public.current_student_id ()
  )
);

-- ---------- class_recurring_schedules ----------
DROP POLICY IF EXISTS class_recurring_schedules_operational_all ON public.class_recurring_schedules;

DROP POLICY IF EXISTS class_recurring_schedules_student_select ON public.class_recurring_schedules;

CREATE POLICY class_recurring_schedules_operational_all ON public.class_recurring_schedules FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

CREATE POLICY class_recurring_schedules_student_select ON public.class_recurring_schedules FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND EXISTS (
    SELECT 1
    FROM public.student_class_enrollments e
    WHERE e.class_id = class_recurring_schedules.class_id
      AND e.student_id = public.current_student_id ()
  )
);

-- ---------- class_sessions ----------
DROP POLICY IF EXISTS class_sessions_operational_all ON public.class_sessions;

DROP POLICY IF EXISTS class_sessions_student_select ON public.class_sessions;

CREATE POLICY class_sessions_operational_all ON public.class_sessions FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

CREATE POLICY class_sessions_student_select ON public.class_sessions FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND EXISTS (
    SELECT 1
    FROM public.student_class_enrollments e
    WHERE e.class_id = class_sessions.class_id
      AND e.student_id = public.current_student_id ()
  )
);

-- ---------- student_class_enrollments ----------
DROP POLICY IF EXISTS student_class_enrollments_operational_all ON public.student_class_enrollments;

DROP POLICY IF EXISTS student_class_enrollments_student_select ON public.student_class_enrollments;

CREATE POLICY student_class_enrollments_operational_all ON public.student_class_enrollments FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

CREATE POLICY student_class_enrollments_student_select ON public.student_class_enrollments FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
);

-- ---------- check_ins ----------
DROP POLICY IF EXISTS check_ins_operational_all ON public.check_ins;

DROP POLICY IF EXISTS check_ins_student_select ON public.check_ins;

DROP POLICY IF EXISTS check_ins_student_insert ON public.check_ins;

DROP POLICY IF EXISTS check_ins_student_delete ON public.check_ins;

CREATE POLICY check_ins_operational_all ON public.check_ins FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

CREATE POLICY check_ins_student_select ON public.check_ins FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
);

CREATE POLICY check_ins_student_insert ON public.check_ins FOR INSERT TO authenticated
WITH CHECK (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
  AND account_id = public.current_account_id ()
  AND EXISTS (
    SELECT 1
    FROM public.class_sessions cs
    INNER JOIN public.student_class_enrollments e
      ON e.class_id = cs.class_id
      AND e.student_id = public.current_student_id ()
    WHERE cs.id = check_ins.class_session_id
      AND cs.account_id = public.current_account_id ()
  )
);

CREATE POLICY check_ins_student_delete ON public.check_ins FOR DELETE TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
);

-- ---------- attendances (professor CRUD; aluno SELECT próprio) ----------
DROP POLICY IF EXISTS attendances_operational_all ON public.attendances;

DROP POLICY IF EXISTS attendances_student_select ON public.attendances;

CREATE POLICY attendances_operational_all ON public.attendances FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

CREATE POLICY attendances_student_select ON public.attendances FOR SELECT TO authenticated USING (
  public.current_profile_role () = 'student'::public.profile_role
  AND student_id = public.current_student_id ()
);

-- ---------- product ledger (caderno de vendas — só professor) ----------
ALTER TABLE public.product_ledger_notes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_ledger_installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_ledger_notes_operational_all ON public.product_ledger_notes;

CREATE POLICY product_ledger_notes_operational_all ON public.product_ledger_notes FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
);

DROP POLICY IF EXISTS product_ledger_installments_operational_all ON public.product_ledger_installments;

CREATE POLICY product_ledger_installments_operational_all ON public.product_ledger_installments FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
);

-- ---------- academy registration (cadastro público) ----------
-- Mesma definição que db/migrations/030_academy_public_registration.sql.
-- Sem políticas para anon ou authenticated. Sem GRANT da tabela a esses papéis.
-- Não há INSERT de accounts/profiles para authenticated: a provisão é SECURITY DEFINER.
ALTER TABLE public.academy_registration_intents ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.academy_registration_intents FROM PUBLIC;
REVOKE ALL ON TABLE public.academy_registration_intents FROM anon;
REVOKE ALL ON TABLE public.academy_registration_intents FROM authenticated;

CREATE OR REPLACE FUNCTION public.prevent_clearing_academy_registration_consumption () RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.consumed_at IS NOT NULL AND NEW.consumed_at IS DISTINCT FROM OLD.consumed_at THEN
    RAISE EXCEPTION 'academy registration consumption is permanent'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_clearing_academy_registration_consumption () FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_clearing_academy_registration_consumption () FROM anon;
REVOKE ALL ON FUNCTION public.prevent_clearing_academy_registration_consumption () FROM authenticated;

DROP TRIGGER IF EXISTS academy_registration_intents_consumption_permanent ON public.academy_registration_intents;

CREATE TRIGGER academy_registration_intents_consumption_permanent
BEFORE UPDATE ON public.academy_registration_intents
FOR EACH ROW
EXECUTE FUNCTION public.prevent_clearing_academy_registration_consumption ();

-- A troca só poderá ocorrer por operação privilegiada que valide a elegibilidade.
-- SECURITY INVOKER preserva current_user do chamador, inclusive dentro da futura RPC.
CREATE OR REPLACE FUNCTION public.protect_account_modality () RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.modality IS DISTINCT FROM OLD.modality
     AND current_user IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'academy modality requires a controlled operation' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_account_modality () FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS accounts_protect_modality ON public.accounts;
CREATE TRIGGER accounts_protect_modality
BEFORE UPDATE OF modality ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.protect_account_modality ();

CREATE OR REPLACE FUNCTION public.record_academy_registration (user_id uuid, academy_name text, display_name text, modality text) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_academy_name text;
  v_display_name text;
  v_modality text;
BEGIN
  v_modality := modality;
  IF v_modality IS NULL OR v_modality NOT IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo') THEN
    RAISE EXCEPTION 'invalid academy modality' USING ERRCODE = '22023';
  END IF;

  v_academy_name := pg_catalog.btrim(academy_name);
  v_display_name := pg_catalog.btrim(display_name);

  IF v_academy_name IS NULL
     OR pg_catalog.char_length(v_academy_name) < 2
     OR pg_catalog.char_length(v_academy_name) > 80
     OR v_display_name IS NULL
     OR pg_catalog.char_length(v_display_name) < 2
     OR pg_catalog.char_length(v_display_name) > 80 THEN
    RAISE EXCEPTION 'invalid academy registration names'
      USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.users AS auth_user
    WHERE auth_user.id = record_academy_registration.user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.user_id = record_academy_registration.user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.students AS student
    WHERE student.user_id = record_academy_registration.user_id
  ) OR EXISTS (
    SELECT 1
    FROM auth.users AS auth_user
    WHERE auth_user.id = record_academy_registration.user_id
      AND (
        auth_user.email_confirmed_at IS NOT NULL
        OR auth_user.invited_at IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'academy registration refused'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.academy_registration_intents (user_id, academy_name, display_name, modality)
  VALUES (record_academy_registration.user_id, v_academy_name, v_display_name, v_modality)
  ON CONFLICT ON CONSTRAINT academy_registration_intents_pkey DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.record_academy_registration (uuid, text, text, text) TO service_role;

COMMENT ON FUNCTION public.record_academy_registration (uuid, text, text, text) IS
  'Grava a intenção de cadastro só para utilizador novo, sem perfil, sem aluno e sem convite. Não atualiza nomes.';

-- Compatibilidade: o cadastro anterior continua criando somente Jiu-Jitsu.
CREATE OR REPLACE FUNCTION public.record_academy_registration (user_id uuid, academy_name text, display_name text) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.record_academy_registration(user_id, academy_name, display_name, 'jiu_jitsu'::text);
END;
$$;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_academy_registration (uuid, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.allocate_academy_slug (name text) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_base text;
  v_candidate text;
  v_head text;
  v_suffix text;
  v_n integer := 1;
  v_reserved text[] := ARRAY[
    'loja', 'painel', 'portal', 'login', 'admin', 'api',
    'produtos', 'termos', 'privacidade', 'configuracoes'
  ];
BEGIN
  v_base := pg_catalog.lower(
    pg_catalog.translate(
      coalesce(name, ''),
      'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
      'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn'
    )
  );
  v_base := pg_catalog.regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := pg_catalog.regexp_replace(v_base, '^-+|-+$', '', 'g');
  v_base := pg_catalog.regexp_replace(pg_catalog.left(v_base, 40), '-+$', '');

  IF pg_catalog.char_length(v_base) < 3 THEN
    v_base := 'academia';
  END IF;

  v_candidate := v_base;
  WHILE v_candidate = ANY (v_reserved)
     OR pg_catalog.char_length(v_candidate) < 3
     OR pg_catalog.char_length(v_candidate) > 40
     OR v_candidate !~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
     OR EXISTS (
       SELECT 1
       FROM public.accounts AS account
       WHERE pg_catalog.lower(account.slug) = v_candidate
     )
  LOOP
    v_n := v_n + 1;
    v_suffix := '-' || v_n::text;
    v_head := pg_catalog.regexp_replace(
      pg_catalog.left(v_base, 40 - pg_catalog.char_length(v_suffix)),
      '-+$',
      ''
    );
    v_candidate := v_head || v_suffix;
    IF v_n > 1000 THEN
      RAISE EXCEPTION 'could not allocate academy slug' USING ERRCODE = '23505';
    END IF;
  END LOOP;

  RETURN v_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.allocate_academy_slug (text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_academy_slug (text) TO service_role;

COMMENT ON FUNCTION public.allocate_academy_slug (text) IS
  'Slug da academia: minúsculas, hífens, 3–40, sufixo -2/-3 se reservado ou ocupado.';

CREATE OR REPLACE FUNCTION public.assign_account_slug () RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.slug IS NULL OR pg_catalog.btrim(NEW.slug) = '' THEN
    NEW.slug := public.allocate_academy_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_account_slug () FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS accounts_assign_slug ON public.accounts;
CREATE TRIGGER accounts_assign_slug
BEFORE INSERT ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.assign_account_slug ();

CREATE OR REPLACE FUNCTION public.provision_academy_for_current_user () RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid;
  v_role text;
  v_email_confirmed_at timestamptz;
  v_invited_at timestamptz;
  v_academy_name text;
  v_display_name text;
  v_consumed_at timestamptz;
  v_account_id uuid;
  v_modality text;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  -- Serializa duas confirmações do mesmo utilizador para não criar duas academias.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text, 0::bigint));

  v_role := NULL;
  SELECT profile.role::text
  INTO v_role
  FROM public.profiles AS profile
  WHERE profile.user_id = v_uid
  LIMIT 1;

  IF v_role IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'existing', 'role', v_role);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.students AS student
    WHERE student.user_id = v_uid
  ) THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  SELECT auth_user.email_confirmed_at, auth_user.invited_at
  INTO v_email_confirmed_at, v_invited_at
  FROM auth.users AS auth_user
  WHERE auth_user.id = v_uid;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  IF v_email_confirmed_at IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'email_not_confirmed', 'role', NULL);
  END IF;

  IF v_invited_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  v_academy_name := NULL;
  v_display_name := NULL;
  v_consumed_at := NULL;
  SELECT intent.academy_name, intent.display_name, intent.consumed_at, intent.modality
  INTO v_academy_name, v_display_name, v_consumed_at, v_modality
  FROM public.academy_registration_intents AS intent
  WHERE intent.user_id = v_uid;

  IF v_academy_name IS NULL OR v_consumed_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  INSERT INTO public.accounts (name, modality, slug)
  VALUES (v_academy_name, v_modality, public.allocate_academy_slug(v_academy_name))
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, account_id, display_name, role)
  VALUES (
    v_uid,
    v_account_id,
    v_display_name,
    'professor'::public.profile_role
  );

  INSERT INTO public.plans (account_id, kind, name, price_cents, active)
  VALUES
    (v_account_id, 'kids_1'::public.plan_kind, 'Kids 1', 10000, true),
    (v_account_id, 'kids_2'::public.plan_kind, 'Kids 2', 10000, true),
    (v_account_id, 'adult'::public.plan_kind, 'Adulto', 12000, true),
    (v_account_id, 'baby'::public.plan_kind, 'Baby', 10000, true)
  ON CONFLICT (account_id, kind) DO NOTHING;

  UPDATE public.academy_registration_intents
  SET
    consumed_at = pg_catalog.now(),
    account_id = v_account_id
  WHERE user_id = v_uid
    AND consumed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'academy registration intent was not consumed'
      USING ERRCODE = '40001';
  END IF;

  RETURN pg_catalog.jsonb_build_object('outcome', 'created', 'role', 'professor');
END;
$$;

REVOKE ALL ON FUNCTION public.provision_academy_for_current_user () FROM PUBLIC;
REVOKE ALL ON FUNCTION public.provision_academy_for_current_user () FROM anon;
REVOKE ALL ON FUNCTION public.provision_academy_for_current_user () FROM service_role;

GRANT EXECUTE ON FUNCTION public.provision_academy_for_current_user () TO authenticated;

COMMENT ON FUNCTION public.provision_academy_for_current_user () IS
  'Cria a academia do auth.uid() a partir da intenção ainda não consumida. Não altera conta, perfil nem preço de plano já existentes.';

-- #30: catálogos somente leitura e invariantes de modalidade (033).
ALTER TABLE public.graduation_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduation_ranks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.graduation_references, public.graduation_ranks FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.graduation_references, public.graduation_ranks TO authenticated;
DROP POLICY IF EXISTS graduation_references_read ON public.graduation_references;
CREATE POLICY graduation_references_read ON public.graduation_references FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS graduation_ranks_read ON public.graduation_ranks;
CREATE POLICY graduation_ranks_read ON public.graduation_ranks FOR SELECT TO authenticated USING (true);


CREATE OR REPLACE FUNCTION public.guard_student_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_today date;
BEGIN
  -- Compartilha o lock da troca controlada de modalidade (#37).
  SELECT a.modality INTO v_modality FROM public.accounts a WHERE a.id = NEW.account_id FOR SHARE;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501'; END IF;
  v_today := (pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date;
  IF v_modality <> 'jiu_jitsu' AND (NEW.kind <> 'adult'::public.student_kind OR NEW.birth_date IS NULL
     OR NEW.birth_date > (v_today - interval '18 years')::date) THEN
    RAISE EXCEPTION 'modality requires adult aged eighteen' USING ERRCODE = '23514';
  END IF;
  IF v_modality IN ('judo', 'muay_thai') THEN
    IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL
       OR NEW.graduation_reference_id IS DISTINCT FROM (CASE v_modality WHEN 'judo' THEN 'cbj-2023' ELSE 'cbmtt-19-khan' END)
       OR NEW.current_rank_code IS NULL
       OR NOT EXISTS (SELECT 1 FROM public.graduation_ranks r JOIN public.graduation_references ref ON ref.id=r.reference_id
                      WHERE r.reference_id=NEW.graduation_reference_id AND r.code=NEW.current_rank_code AND ref.modality=v_modality)
       OR NEW.current_rank_date > v_today THEN
      RAISE EXCEPTION 'invalid referenced graduation' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.graduation_reference_id IS NOT NULL OR NEW.current_rank_code IS NOT NULL OR NEW.current_rank_date IS NOT NULL THEN
      RAISE EXCEPTION 'foreign referenced graduation' USING ERRCODE = '23514';
    END IF;
    IF v_modality = 'boxing' THEN
      IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL THEN
        RAISE EXCEPTION 'boxing has no graduation' USING ERRCODE = '23514';
      END IF;
    ELSIF NEW.current_belt_id IS NULL OR NEW.current_degree IS NULL THEN
      RAISE EXCEPTION 'graduation required for graded sport' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_modality () FROM PUBLIC, anon, authenticated;

-- Histórico legado recebe apenas eventos de JJ. Judô terá eventos próprios em #32.
CREATE OR REPLACE FUNCTION public.guard_graduation_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  SELECT a.modality INTO v_modality FROM public.students s JOIN public.accounts a ON a.id = s.account_id WHERE s.id = NEW.student_id;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501'; END IF;
  IF v_modality <> 'jiu_jitsu' THEN RAISE EXCEPTION 'legacy graduation requires jiu jitsu' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_graduation_modality () FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_student_plan_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_plan_kind public.plan_kind;
BEGIN
  SELECT a.modality, p.kind INTO v_modality, v_plan_kind
  FROM public.students s JOIN public.accounts a ON a.id = s.account_id
  JOIN public.plans p ON p.id = NEW.plan_id AND p.account_id = s.account_id WHERE s.id = NEW.student_id;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student or plan unavailable' USING ERRCODE = '42501'; END IF;
  IF v_modality <> 'jiu_jitsu' AND v_plan_kind <> 'adult'::public.plan_kind THEN
    RAISE EXCEPTION 'modality requires adult plan' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_plan_modality () FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS students_guard_modality ON public.students;
CREATE TRIGGER students_guard_modality BEFORE INSERT OR UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.guard_student_modality ();
DROP TRIGGER IF EXISTS student_graduations_guard_modality ON public.student_graduations;
CREATE TRIGGER student_graduations_guard_modality BEFORE INSERT OR UPDATE ON public.student_graduations
FOR EACH ROW EXECUTE FUNCTION public.guard_graduation_modality ();
DROP TRIGGER IF EXISTS student_plans_guard_modality ON public.student_plans;
CREATE TRIGGER student_plans_guard_modality BEFORE INSERT OR UPDATE ON public.student_plans
FOR EACH ROW EXECUTE FUNCTION public.guard_student_plan_modality ();

-- #32: eventos e RPC referenciada
ALTER TABLE public.student_rank_promotions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_rank_promotions FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.student_rank_promotions TO authenticated;
DROP POLICY IF EXISTS student_rank_promotions_read ON public.student_rank_promotions;
CREATE POLICY student_rank_promotions_read ON public.student_rank_promotions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.students s WHERE s.id=student_id AND s.account_id=public.current_account_id()
    AND (public.can_manage_graduations() OR (public.can_use_portal_self() AND s.user_id=auth.uid())))
);

CREATE OR REPLACE FUNCTION public.promote_referenced_student(
  p_student_id uuid, p_reference_id text, p_rank_code text, p_granted_on date, p_reason text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  s public.students%ROWTYPE;
  v_from smallint; v_to smallint; v_modality text;
  v_skip boolean;
  v_reason text := nullif(regexp_replace(p_reason,
    '^[[:space:]' || chr(160) || chr(8199) || chr(8239) || chr(65279) || ']+|[[:space:]' || chr(160) || chr(8199) || chr(8239) || chr(65279) || ']+$', '', 'g'),'');
  v_age integer; v_year_age integer; v_dan integer; v_min_age integer; v_months integer := 0;
  v_exceptions text[] := '{}'; v_basis text; v_id uuid;
BEGIN
  IF NOT public.can_manage_graduations() OR auth.uid() IS NULL THEN
    RAISE EXCEPTION 'promotion unavailable' USING ERRCODE='42501';
  END IF;
  SELECT * INTO s FROM public.students WHERE id=p_student_id AND account_id=public.current_account_id() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'promotion unavailable' USING ERRCODE='42501'; END IF;
  SELECT modality INTO v_modality FROM public.accounts WHERE id=s.account_id FOR SHARE;
  IF v_modality NOT IN ('judo','muay_thai')
    OR p_reference_id IS DISTINCT FROM (CASE v_modality WHEN 'judo' THEN 'cbj-2023' ELSE 'cbmtt-19-khan' END)
    OR s.graduation_reference_id IS DISTINCT FROM p_reference_id THEN
    RAISE EXCEPTION 'invalid promotion rank' USING ERRCODE='23514';
  END IF;
  SELECT ordinal INTO v_from FROM public.graduation_ranks WHERE reference_id=p_reference_id AND code=s.current_rank_code;
  SELECT ordinal INTO v_to FROM public.graduation_ranks WHERE reference_id=p_reference_id AND code=p_rank_code;
  IF v_from IS NULL OR v_to IS NULL OR v_to <= v_from THEN
    RAISE EXCEPTION 'promotion must advance' USING ERRCODE='23514';
  END IF;
  IF p_granted_on IS NULL OR p_granted_on > (now() AT TIME ZONE 'America/Sao_Paulo')::date
    OR p_granted_on < s.current_rank_date OR p_granted_on < s.birth_date THEN
    RAISE EXCEPTION 'invalid promotion date' USING ERRCODE='23514';
  END IF;
  v_skip := v_to-v_from>1;
  IF v_modality = 'muay_thai' THEN
    v_basis := 'CBMTT — Tabela de graduação de 19 khan; https://www.cbmtt.org.br/images/graduacoes-cbmtt.jpg; consulta 22/10/2026. A tabela não informa edição, idades ou carências. Sem equivalência declarada com IFMA 15 khan; o Casca não atribui créditos. Registro de graduação concedida, sem exame, SNG, homologação ou certificação CBMTT/IFMA. Títulos esportivos não concedem permissões de acesso.';
  ELSE
  v_age := extract(year FROM age(p_granted_on,s.birth_date));
  v_year_age := extract(year FROM p_granted_on)-extract(year FROM s.birth_date);
  -- CBJ 2023 p7 §5/tabela1: dispensa adulta nas básicas; tabela2 intermediárias permanece explícita.
  v_basis := 'CBJ 2023, p.7, tabela 1 e §5: básicas acima de 16 anos dispensam sequência/carência; salto justificado é rastreabilidade Casca.';
  IF v_to BETWEEN 1 AND 7 AND v_age<=16 THEN
    v_months := (ARRAY[3,3,6,6,6,6,12])[v_to];
    v_min_age := (ARRAY[4,5,6,7,8,9,10])[v_to];
    v_basis := 'CBJ 2023, p.7, tabela 1, linha ' || p_rank_code || ': idade mínima ' || v_min_age
      || ' anos por ano de nascimento (§2), interstício ' || v_months || ' meses na graduação anterior; §5 dispensa apenas acima de 16 anos.';
    IF v_year_age < v_min_age THEN v_exceptions:=array_append(v_exceptions,'age'); END IF;
  ELSIF v_to BETWEEN 8 AND 11 THEN
    v_months := 12;
    v_min_age := v_to+3;
    v_basis := 'CBJ 2023, p.7, tabela 2, linha ' || p_rank_code || ': idade mínima ' || v_min_age || ' anos por ano de nascimento (§2), interstício 12 meses na graduação anterior.';
    IF v_year_age < v_min_age THEN v_exceptions:=array_append(v_exceptions,'age'); END IF;
  ELSIF v_to >= 12 THEN
    v_dan := v_to-11;
    v_min_age := (ARRAY[16,20,25,30,36,44,52,59,66,74])[v_dan];
    v_months := (ARRAY[CASE WHEN v_age>20 THEN 12 ELSE 24 END,48,60,60,72,72,84,84,96,96])[v_dan];
    v_basis := 'CBJ 2023, p.8, tabela ' || CASE WHEN v_dan<=5 THEN '3' WHEN v_dan<=7 THEN '4' ELSE '5' END
      || ', linha ' || v_dan || 'º dan: idade mínima ' || v_min_age || ' anos; interstício ' || v_months
      || ' meses; p.7 §2: idade por ano de nascimento, salvo 1º dan aos 16 completos; no 1º dan acima de 20 completos reduz a 1 ano.';
    IF (CASE WHEN v_dan=1 THEN v_age ELSE v_year_age END) < v_min_age THEN v_exceptions:=array_append(v_exceptions,'age'); END IF;
  END IF;
  IF v_months>0 THEN
    IF s.current_rank_date IS NULL THEN
      v_basis:=v_basis || ' Carência indeterminável: data anterior desconhecida, sem usar matrícula.';
    ELSIF p_granted_on < (s.current_rank_date + make_interval(months=>v_months))::date THEN
      v_exceptions:=array_append(v_exceptions,'waiting');
    END IF;
    IF v_skip THEN v_basis:=v_basis || ' Salto não comprova permanência na graduação imediatamente anterior ao destino.'; END IF;
  END IF;
  v_basis:=v_basis || ' p.9 §§7–9: categorias/regimes especiais não aferidos pelo Casca. Orientação padrão, sem homologação, exame ou certificação.';
  END IF;
  IF (v_skip OR cardinality(v_exceptions)>0) AND v_reason IS NULL THEN
    RAISE EXCEPTION 'promotion reason required' USING ERRCODE='23514';
  END IF;
  IF length(v_reason)>2000 THEN RAISE EXCEPTION 'promotion reason too long' USING ERRCODE='23514'; END IF;
  UPDATE public.students SET current_rank_code=p_rank_code,current_rank_date=p_granted_on WHERE id=s.id;
  INSERT INTO public.student_rank_promotions(student_id,reference_id,from_rank_code,from_rank_date,to_rank_code,granted_on,was_skip,reason,guidance_exceptions,guidance_basis,recorded_by)
  VALUES(s.id,p_reference_id,s.current_rank_code,s.current_rank_date,p_rank_code,p_granted_on,v_skip,v_reason,v_exceptions,v_basis,auth.uid()) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.promote_referenced_student(uuid,text,text,date,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.promote_referenced_student(uuid,text,text,date,text) TO authenticated;


-- #34: esporte da turma independente do público etário.
CREATE OR REPLACE FUNCTION public.guard_class_modality() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  -- Compartilha o lock usado pela troca controlada de modalidade (#37).
  SELECT a.modality INTO v_modality FROM public.accounts a WHERE a.id = NEW.account_id FOR SHARE;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'class account unavailable' USING ERRCODE = '23514'; END IF;
  -- Clientes anteriores enviam apenas kind; o esporte sempre vem da academia.
  IF TG_OP = 'INSERT' AND NEW.modality IS NULL THEN NEW.modality := v_modality; END IF;
  IF NEW.modality IS DISTINCT FROM v_modality OR
     (v_modality <> 'jiu_jitsu' AND NEW.kind <> 'adult'::public.student_kind) THEN
    RAISE EXCEPTION 'incompatible class modality or audience' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.instructor_profile_id
    AND p.account_id = NEW.account_id AND p.role = 'professor'::public.profile_role) THEN
    RAISE EXCEPTION 'instructor unavailable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_class_modality() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS classes_guard_modality ON public.classes;
CREATE TRIGGER classes_guard_modality BEFORE INSERT OR UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.guard_class_modality();

-- RLS limita o ator; estes guards validam também as FKs reais dentro do tenant.
CREATE OR REPLACE FUNCTION public.guard_class_relation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  SELECT a.modality INTO v_modality FROM public.classes c
  JOIN public.accounts a ON a.id = c.account_id
  WHERE c.id = NEW.class_id AND c.account_id = NEW.account_id
    AND c.modality = a.modality
    AND (a.modality = 'jiu_jitsu' OR c.kind = 'adult'::public.student_kind)
  FOR SHARE OF a, c;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'class unavailable' USING ERRCODE = '23514'; END IF;
  IF TG_TABLE_NAME = 'student_class_enrollments' THEN
    IF NOT EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = NEW.student_id AND s.account_id = NEW.account_id
      AND s.archived_at IS NULL AND s.removed_at IS NULL
      AND (v_modality = 'jiu_jitsu' OR (s.kind = 'adult'::public.student_kind AND s.birth_date IS NOT NULL
        AND s.birth_date <= ((pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years')::date))
    ) THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '23514'; END IF;
  END IF;
  -- Não impor igualdade literal entre kind da turma e da ficha JJ:
  -- o público Baby legado pode ter ficha kids.
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_class_relation() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS schedules_guard_class_relation ON public.class_recurring_schedules;
CREATE TRIGGER schedules_guard_class_relation BEFORE INSERT OR UPDATE ON public.class_recurring_schedules
FOR EACH ROW EXECUTE FUNCTION public.guard_class_relation();
DROP TRIGGER IF EXISTS sessions_guard_class_relation ON public.class_sessions;
CREATE TRIGGER sessions_guard_class_relation BEFORE INSERT OR UPDATE ON public.class_sessions
FOR EACH ROW EXECUTE FUNCTION public.guard_class_relation();
DROP TRIGGER IF EXISTS enrollments_guard_class_relation ON public.student_class_enrollments;
CREATE TRIGGER enrollments_guard_class_relation BEFORE INSERT OR UPDATE ON public.student_class_enrollments
FOR EACH ROW EXECUTE FUNCTION public.guard_class_relation();

CREATE OR REPLACE FUNCTION public.guard_session_participant() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_class_id uuid; v_modality text;
BEGIN
  SELECT c.id, a.modality INTO v_class_id, v_modality FROM public.class_sessions cs
  JOIN public.classes c ON c.id = cs.class_id AND c.account_id = cs.account_id
  JOIN public.accounts a ON a.id = c.account_id
  WHERE cs.id = NEW.class_session_id AND cs.account_id = NEW.account_id AND c.modality = a.modality
    AND (a.modality = 'jiu_jitsu' OR c.kind = 'adult'::public.student_kind)
  FOR SHARE OF a, c, cs;
  IF v_class_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.student_class_enrollments e
    JOIN public.students s ON s.id = e.student_id AND s.account_id = e.account_id
    WHERE e.class_id = v_class_id AND e.student_id = NEW.student_id AND e.account_id = NEW.account_id
      AND s.archived_at IS NULL AND s.removed_at IS NULL
      AND (v_modality = 'jiu_jitsu' OR (s.kind = 'adult'::public.student_kind AND s.birth_date IS NOT NULL
        AND s.birth_date <= ((pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years')::date))
  ) THEN RAISE EXCEPTION 'session or enrolled student unavailable' USING ERRCODE = '23514'; END IF;
  IF TG_TABLE_NAME = 'attendances' THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.recorded_by
      AND p.account_id = NEW.account_id AND p.role = 'professor'::public.profile_role) THEN
      RAISE EXCEPTION 'attendance recorder unavailable' USING ERRCODE = '23514';
    END IF;
    IF NEW.origin = 'checkin_student'::public.attendance_origin AND NOT EXISTS (
      SELECT 1 FROM public.check_ins ci WHERE ci.class_session_id = NEW.class_session_id
        AND ci.student_id = NEW.student_id AND ci.account_id = NEW.account_id
    ) THEN RAISE EXCEPTION 'check-in unavailable' USING ERRCODE = '23514'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_session_participant() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS check_ins_guard_session_participant ON public.check_ins;
CREATE TRIGGER check_ins_guard_session_participant BEFORE INSERT OR UPDATE ON public.check_ins
FOR EACH ROW EXECUTE FUNCTION public.guard_session_participant();
DROP TRIGGER IF EXISTS attendances_guard_session_participant ON public.attendances;
CREATE TRIGGER attendances_guard_session_participant BEFORE INSERT OR UPDATE ON public.attendances
FOR EACH ROW EXECUTE FUNCTION public.guard_session_participant();

-- #37: pagamento e documento esperam o mesmo lock da troca de modalidade.
CREATE OR REPLACE FUNCTION public.lock_account_for_modality_switch() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_account uuid;
BEGIN
  IF TG_TABLE_NAME = 'payments' THEN
    SELECT s.account_id INTO v_account FROM public.students s WHERE s.id = NEW.student_id;
  ELSE
    v_account := NEW.account_id;
  END IF;
  PERFORM 1 FROM public.accounts a WHERE a.id = v_account FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'account unavailable' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.lock_account_for_modality_switch() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payments_lock_account_for_modality_switch ON public.payments;
CREATE TRIGGER payments_lock_account_for_modality_switch
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.lock_account_for_modality_switch();
DROP TRIGGER IF EXISTS generated_documents_lock_account_for_modality_switch ON public.generated_documents;
CREATE TRIGGER generated_documents_lock_account_for_modality_switch
BEFORE INSERT OR UPDATE ON public.generated_documents
FOR EACH ROW EXECUTE FUNCTION public.lock_account_for_modality_switch();

CREATE OR REPLACE FUNCTION public.switch_academy_modality(p_target text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_account uuid;
  v_role text;
  v_current text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'modality switch requires professor' USING ERRCODE = '42501';
  END IF;
  SELECT p.account_id, p.role::text INTO v_account, v_role
  FROM public.profiles p WHERE p.user_id = auth.uid();
  IF v_account IS NULL OR v_role IS DISTINCT FROM 'professor' THEN
    RAISE EXCEPTION 'modality switch requires professor' USING ERRCODE = '42501';
  END IF;
  IF p_target IS NULL OR p_target NOT IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo') THEN
    RAISE EXCEPTION 'invalid academy modality' USING ERRCODE = '22023';
  END IF;

  SELECT a.modality INTO v_current FROM public.accounts a WHERE a.id = v_account FOR UPDATE;
  IF v_current IS NULL THEN
    RAISE EXCEPTION 'modality switch requires professor' USING ERRCODE = '42501';
  END IF;
  IF v_current = p_target THEN
    RAISE EXCEPTION 'modality already selected' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM public.students s WHERE s.account_id = v_account)
     OR EXISTS (SELECT 1 FROM public.classes c WHERE c.account_id = v_account)
     OR EXISTS (SELECT 1 FROM public.class_sessions cs WHERE cs.account_id = v_account)
     OR EXISTS (
       SELECT 1 FROM public.payments pay
       JOIN public.students s ON s.id = pay.student_id
       WHERE s.account_id = v_account
     )
     OR EXISTS (SELECT 1 FROM public.generated_documents d WHERE d.account_id = v_account)
  THEN
    RAISE EXCEPTION 'academy is not empty' USING ERRCODE = '23514';
  END IF;

  UPDATE public.accounts
  SET modality = p_target, updated_at = pg_catalog.now()
  WHERE id = v_account;
END;
$$;
REVOKE ALL ON FUNCTION public.switch_academy_modality(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.switch_academy_modality(text) TO authenticated;
COMMENT ON FUNCTION public.switch_academy_modality(text) IS
  'Troca a modalidade só sem aluno, turma, aula, pagamento ou documento. Planos comerciais não entram na trava e não são apagados.';

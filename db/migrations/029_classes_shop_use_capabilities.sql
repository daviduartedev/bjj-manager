-- Turmas, presença, loja e livro de produtos usam as capabilities do professor.
-- Turmas, horários, sessões, inscrições, check-ins e presenças exigem can_manage_classes()
-- no USING e no WITH CHECK, e mantêm o âmbito da academia.
-- Produtos, variantes, reservas e livro de produtos exigem can_manage_students()
-- no USING e no WITH CHECK, e mantêm o âmbito da academia (variante via produto pai).
-- Não há capability de loja: can_manage_students() já é verdade só para professor
-- e falsa quando o papel falta.
-- Policies de aluno inalteradas. Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

DROP POLICY IF EXISTS products_operational_all ON public.products;

CREATE POLICY products_operational_all ON public.products FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    public.can_manage_students ()
    AND account_id = public.current_account_id ()
  );

DROP POLICY IF EXISTS product_variants_operational_all ON public.product_variants;

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

DROP POLICY IF EXISTS reservations_operational_all ON public.reservations;

CREATE POLICY reservations_operational_all ON public.reservations FOR ALL TO authenticated USING (
  public.can_manage_students ()
  AND account_id = public.current_account_id ()
)
WITH
  CHECK (
    public.can_manage_students ()
    AND account_id = public.current_account_id ()
  );

DROP POLICY IF EXISTS classes_operational_all ON public.classes;

CREATE POLICY classes_operational_all ON public.classes FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

DROP POLICY IF EXISTS class_recurring_schedules_operational_all ON public.class_recurring_schedules;

CREATE POLICY class_recurring_schedules_operational_all ON public.class_recurring_schedules FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

DROP POLICY IF EXISTS class_sessions_operational_all ON public.class_sessions;

CREATE POLICY class_sessions_operational_all ON public.class_sessions FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

DROP POLICY IF EXISTS student_class_enrollments_operational_all ON public.student_class_enrollments;

CREATE POLICY student_class_enrollments_operational_all ON public.student_class_enrollments FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

DROP POLICY IF EXISTS check_ins_operational_all ON public.check_ins;

CREATE POLICY check_ins_operational_all ON public.check_ins FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

DROP POLICY IF EXISTS attendances_operational_all ON public.attendances;

CREATE POLICY attendances_operational_all ON public.attendances FOR ALL TO authenticated USING (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_classes ()
  AND account_id = public.current_account_id ()
);

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

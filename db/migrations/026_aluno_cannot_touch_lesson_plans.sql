-- Aluno não lê nem grava plano de aula, revisão nem anexo.
-- As três policies exigem can_manage_lesson_plans() em cada USING e WITH CHECK
-- e mantêm o âmbito da academia corrente (revisão e anexo via plano pai).
-- Sem policy de SELECT para aluno. Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

DROP POLICY IF EXISTS lesson_plans_tenant_all ON public.lesson_plans;

CREATE POLICY lesson_plans_tenant_all ON public.lesson_plans FOR ALL TO authenticated USING (
  public.can_manage_lesson_plans ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_lesson_plans ()
  AND account_id = public.current_account_id ()
);

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

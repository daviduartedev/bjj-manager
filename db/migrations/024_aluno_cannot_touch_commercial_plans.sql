-- Aluno não lê nem grava plano comercial nem o vínculo.
-- plans_tenant_all exige can_manage_commercial_plans() na leitura e na escrita,
-- e mantém o âmbito da academia (account_id = current_account_id()).
-- student_plans_tenant_consistent exige a mesma capacidade, e mantém a consistência
-- de aluno e plano na academia corrente.
-- Sem policy de SELECT para aluno. Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

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

-- Aluno não lê nem grava mensalidade.
-- payments_by_student_tenant exige can_manage_finance() na leitura e na escrita,
-- e mantém o âmbito da academia (o aluno da linha pertence a current_account_id()).
-- Sem policy de SELECT para aluno. Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

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

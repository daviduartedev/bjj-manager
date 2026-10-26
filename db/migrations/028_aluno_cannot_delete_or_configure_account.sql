-- Aluno não apaga a academia nem altera a configuração.
-- accounts_delete_own exige can_delete_account() e o âmbito da própria academia.
-- accounts_update_professor exige can_manage_account_settings() no USING e no WITH CHECK,
-- e mantém id = current_account_id(). As duas funções são verdade só para professor
-- e falsas quando o papel falta.
-- Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

DROP POLICY IF EXISTS accounts_delete_own ON public.accounts;

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

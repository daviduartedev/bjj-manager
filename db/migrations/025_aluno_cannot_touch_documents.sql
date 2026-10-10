-- Aluno não lê nem grava documento gerado, entrega, sequência nem template.
-- As cinco policies exigem can_manage_documents() em cada USING e WITH CHECK
-- e mantêm o âmbito: academia corrente, ou template global (account_id IS NULL) na leitura.
-- Sem policy de SELECT para aluno. Sem alteração de dados, enum ou tabela.
-- Mesma definição que db/policies.sql.

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

DROP POLICY IF EXISTS generated_documents_tenant_all ON public.generated_documents;

CREATE POLICY generated_documents_tenant_all ON public.generated_documents FOR ALL TO authenticated USING (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
);

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

DROP POLICY IF EXISTS document_sequences_tenant_all ON public.document_sequences;

CREATE POLICY document_sequences_tenant_all ON public.document_sequences FOR ALL TO authenticated USING (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
)
WITH CHECK (
  public.can_manage_documents ()
  AND account_id = public.current_account_id ()
);

-- =====================================================
-- BR-4.5 — Pendente → Não pago após vencimento (futuro)
-- =====================================================
-- Não executar em produção até o ciclo dedicado validar fuso (BR-2.4),
-- cálculo do “último dia válido” do vencimento e interação com linhas
-- ausentes em payments (BR-4.4).
--
-- Agendamento sugerido: Supabase Dashboard → Database → Cron (pg_cron)
-- ou Edge Function + scheduler.
-- =====================================================

CREATE OR REPLACE FUNCTION public.br45_mark_overdue_unpaid () RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Stub: implementar SELECT que identifique (student_id, reference_month)
  -- em Pendente implícito ou explícito, com data corrente > due_date do mês,
  -- e faça INSERT ... ON CONFLICT UPDATE ou UPDATE payments SET status = 'unpaid'.
  NULL;
END;
$$;

COMMENT ON FUNCTION public.br45_mark_overdue_unpaid () IS 'BR-4.5: marcar Não pago após vencimento quando ainda Pendente; não alterar paid/scholarship/other.';

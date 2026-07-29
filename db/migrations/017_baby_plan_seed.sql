-- =====================================================
-- Migração 017: plano Baby por conta (após 016 — enums já commitados)
-- =====================================================

INSERT INTO
  public.plans (account_id, kind, name, price_cents, active)
SELECT
  a.id,
  'baby'::public.plan_kind,
  'Baby',
  10000,
  true
FROM
  public.accounts a
ON CONFLICT ON CONSTRAINT plans_account_kind_unique DO NOTHING;

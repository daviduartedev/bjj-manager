-- Critério de prontidão da academia (issue #12).
-- SEGURANÇA DE DADOS: apenas DDL aditivo. Sem UPDATE, INSERT, DELETE, TRUNCATE
-- ou backfill em linhas existentes. Contas actuais ficam com ambos NULL
-- (alerta de graduação usa fallback 4 meses no grau / 12 na faixa).
-- RLS: accounts_update_professor já permite actualizar a própria conta;
-- não se altera política.
-- Idempotente: ADD COLUMN IF NOT EXISTS.
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS readiness_kids_degree_months smallint NULL,
  ADD COLUMN IF NOT EXISTS readiness_confirmed_at timestamptz NULL;

DO $$ BEGIN
  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_readiness_kids_degree_months_ck
    CHECK (
      readiness_kids_degree_months IS NULL
      OR readiness_kids_degree_months IN (1, 3, 4)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.accounts.readiness_kids_degree_months IS
  'Meses por grau kids (1, 3 ou 4) do critério de prontidão; NULL até confirmar.';
COMMENT ON COLUMN public.accounts.readiness_confirmed_at IS
  'Instante do primeiro aceite do critério de prontidão; NULL = fallback 4/12.';

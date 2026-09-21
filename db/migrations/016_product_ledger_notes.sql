-- Caderno de vendas / saídas (professor). Sem venda no portal.
-- ADDITIVE ONLY / produção:
--   Não altera coluna, default, constraint, RLS nem dado de tabelas já existentes
--   (accounts, students, products, product_variants, payments, profiles, etc.).
--   Sem INSERT, UPDATE, DELETE, TRUNCATE ou seed.
--   Só cria tipo, tabelas e índices novos; FKs validam referência, não reescrevem linhas.
-- Idempotente.

DO $$ BEGIN
  CREATE TYPE public.product_ledger_kind AS ENUM ('sale', 'outlay');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.product_ledger_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  kind public.product_ledger_kind NOT NULL,
  student_id uuid NULL REFERENCES public.students (id) ON DELETE RESTRICT,
  product_id uuid NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  product_variant_id uuid NULL REFERENCES public.product_variants (id) ON DELETE RESTRICT,
  title text NOT NULL,
  product_name text NULL,
  size_label text NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_cents bigint NOT NULL,
  installment_count integer NOT NULL,
  payment_method text NOT NULL,
  note text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_ledger_notes_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT product_ledger_notes_quantity_positive CHECK (quantity >= 1),
  CONSTRAINT product_ledger_notes_total_positive CHECK (total_cents >= 1),
  CONSTRAINT product_ledger_notes_installments_range CHECK (
    installment_count >= 1
    AND installment_count <= 24
  ),
  CONSTRAINT product_ledger_notes_sale_has_student CHECK (
    kind <> 'sale'
    OR student_id IS NOT NULL
  ),
  CONSTRAINT product_ledger_notes_sale_has_product CHECK (
    kind <> 'sale'
    OR product_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.product_ledger_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  note_id uuid NOT NULL REFERENCES public.product_ledger_notes (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  amount_cents bigint NOT NULL,
  paid_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_ledger_installments_sequence_positive CHECK (sequence >= 1),
  CONSTRAINT product_ledger_installments_amount_positive CHECK (amount_cents >= 1),
  CONSTRAINT product_ledger_installments_note_sequence_unique UNIQUE (note_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_product_ledger_notes_account_created
  ON public.product_ledger_notes (account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_ledger_notes_student
  ON public.product_ledger_notes (student_id);

CREATE INDEX IF NOT EXISTS idx_product_ledger_installments_note
  ON public.product_ledger_installments (note_id, sequence);

CREATE INDEX IF NOT EXISTS idx_product_ledger_installments_account_unpaid
  ON public.product_ledger_installments (account_id, paid_at);

ALTER TABLE public.product_ledger_notes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_ledger_installments ENABLE ROW LEVEL SECURITY;

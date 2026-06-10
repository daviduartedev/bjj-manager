-- =====================================================
-- Migração 012: Portal Fase 3 — loja/reservas + PIX (schema)
-- - enums reservation_status, pix_key_type
-- - extensões products, product_variants, accounts
-- - tabela reservations
-- - funções expire_stale_reservations, reserve_product_variant
--
-- Políticas RLS: db/policies.sql (re-aplicado por pnpm db:apply).
-- Idempotente: DO blocks para enums; ADD COLUMN IF NOT EXISTS; CREATE IF NOT EXISTS.
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.reservation_status AS ENUM (
    'pending_payment',
    'paid',
    'expired',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pix_key_type AS ENUM ('cpf', 'cnpj', 'email', 'phone', 'random');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS pix_key_type public.pix_key_type NULL,
ADD COLUMN IF NOT EXISTS pix_key text NULL,
ADD COLUMN IF NOT EXISTS pix_holder_name text NULL;

ALTER TABLE public.accounts
DROP CONSTRAINT IF EXISTS accounts_pix_holder_name_not_blank;

ALTER TABLE public.accounts
ADD CONSTRAINT accounts_pix_holder_name_not_blank CHECK (
  pix_holder_name IS NULL OR length(trim(pix_holder_name)) > 0
);

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS description text NULL,
ADD COLUMN IF NOT EXISTS portal_visible boolean NOT NULL DEFAULT false;

ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS price_cents bigint NULL;

ALTER TABLE public.product_variants
DROP CONSTRAINT IF EXISTS product_variants_price_non_negative;

ALTER TABLE public.product_variants
ADD CONSTRAINT product_variants_price_non_negative CHECK (
  price_cents IS NULL OR price_cents >= 0
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  product_variant_id uuid NOT NULL REFERENCES public.product_variants (id) ON DELETE RESTRICT,
  status public.reservation_status NOT NULL DEFAULT 'pending_payment',
  price_cents bigint NOT NULL,
  expires_at timestamptz NOT NULL,
  paid_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservations_price_non_negative CHECK (price_cents >= 0),
  CONSTRAINT reservations_expires_after_created CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_reservations_account_id ON public.reservations (account_id);

CREATE INDEX IF NOT EXISTS idx_reservations_student_id ON public.reservations (student_id);

CREATE INDEX IF NOT EXISTS idx_reservations_product_variant_id ON public.reservations (product_variant_id);

CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON public.reservations (account_id, status, expires_at);

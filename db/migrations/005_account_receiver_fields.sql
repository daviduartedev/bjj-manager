-- =====================================================
-- Migração 005: campos do recebedor em accounts (CFG-6)
-- - legal_name (Razão Social)
-- - cnpj (apenas dígitos, 14 chars)
-- - signature_url (caminho relativo no bucket de branding)
-- - logo_url (uso futuro; idempotente)
-- =====================================================

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS legal_name text NULL,
  ADD COLUMN IF NOT EXISTS cnpj text NULL,
  ADD COLUMN IF NOT EXISTS signature_url text NULL,
  ADD COLUMN IF NOT EXISTS logo_url text NULL;

DO $$ BEGIN
  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_cnpj_format_ck CHECK (
      cnpj IS NULL OR cnpj ~ '^[0-9]{14}$'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_legal_name_not_blank CHECK (
      legal_name IS NULL OR length(trim(legal_name)) > 0
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

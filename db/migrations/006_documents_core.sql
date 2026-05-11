-- =====================================================
-- Migração 006: núcleo documental (DOC- / REC-)
-- - document_type / generated_document_status / delivery_channel / delivery_status
-- - document_templates
-- - generated_documents (versionado, com idempotência por (account_id, idempotency_key))
-- - generated_document_deliveries (audit trail de partilhas)
-- - document_sequences (numeração por (account_id, type, year))
-- Idempotente: enums via DO blocks; CREATE IF NOT EXISTS.
-- =====================================================

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM (
    'payment_receipt',
    'enrollment_proof',
    'certificate',
    'liability_term',
    'manual_receipt'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.generated_document_status AS ENUM (
    'pending',
    'ready',
    'failed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_channel AS ENUM (
    'download',
    'whatsapp',
    'browser_open',
    'reissue'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM (
    'requested',
    'completed',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- document_templates ----------
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  version integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  -- Path relativo no bucket de templates (futuro). Em MVP os templates v1 vivem em código.
  storage_path text NULL,
  -- Defaults (logo, assinatura, contactos) renderizados no template.
  defaults_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_templates_account_type_version_uq UNIQUE (account_id, type, version),
  CONSTRAINT document_templates_version_positive_ck CHECK (version >= 1)
);

CREATE INDEX IF NOT EXISTS idx_document_templates_type_active
  ON public.document_templates (type, is_active);

-- ---------- generated_documents ----------
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  status public.generated_document_status NOT NULL DEFAULT 'pending',
  -- Numeração canónica: PREFIX-YYYY-####, ex.: REC-2026-0001
  number text NULL,
  -- Versão da reemissão; aumenta a cada reemissão. Versão 1 é a original.
  version integer NOT NULL DEFAULT 1,
  -- Aponta para o documento original quando esta linha é uma reemissão.
  supersedes_id uuid NULL REFERENCES public.generated_documents (id) ON DELETE SET NULL,
  -- Idempotência: para recibos automáticos usamos o payment_id como chave.
  idempotency_key text NULL,
  -- Vínculos opcionais a domínios.
  student_id uuid NULL REFERENCES public.students (id) ON DELETE SET NULL,
  payment_id uuid NULL REFERENCES public.payments (id) ON DELETE SET NULL,
  template_id uuid NULL REFERENCES public.document_templates (id) ON DELETE SET NULL,
  -- Snapshot dos dados renderizados (LGPD: minimizar PII; ver lib/documents/audit.ts).
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Storage do PDF/HTML.
  pdf_path text NULL,
  html_path text NULL,
  byte_size integer NULL,
  -- Erro estruturado em caso de status='failed'.
  error_code text NULL,
  error_message text NULL,
  reissue_reason text NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generated_documents_version_positive_ck CHECK (version >= 1),
  CONSTRAINT generated_documents_status_consistency_ck CHECK (
    (status = 'failed' AND error_code IS NOT NULL)
    OR (status <> 'failed')
  )
);

-- Idempotência por conta + chave (ex.: payment_id) — apenas quando definida.
CREATE UNIQUE INDEX IF NOT EXISTS uq_generated_documents_account_idem_key
  ON public.generated_documents (account_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generated_documents_account_type_created
  ON public.generated_documents (account_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_documents_student_created
  ON public.generated_documents (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_documents_payment
  ON public.generated_documents (payment_id);

CREATE INDEX IF NOT EXISTS idx_generated_documents_supersedes
  ON public.generated_documents (supersedes_id);

-- ---------- generated_document_deliveries ----------
CREATE TABLE IF NOT EXISTS public.generated_document_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  document_id uuid NOT NULL REFERENCES public.generated_documents (id) ON DELETE CASCADE,
  channel public.delivery_channel NOT NULL,
  status public.delivery_status NOT NULL DEFAULT 'completed',
  -- Detalhes (ex.: URL gerada, telefone normalizado mascarado, motivo de falha).
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  performed_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_document_deliveries_document_created
  ON public.generated_document_deliveries (document_id, created_at DESC);

-- ---------- document_sequences ----------
-- Numeração crescente por (account_id, type, year) com upsert atómico.
CREATE TABLE IF NOT EXISTS public.document_sequences (
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  year smallint NOT NULL,
  last_seq integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_sequences_pk PRIMARY KEY (account_id, type, year),
  CONSTRAINT document_sequences_seq_non_negative CHECK (last_seq >= 0),
  CONSTRAINT document_sequences_year_bounds CHECK (year BETWEEN 2000 AND 2999)
);

-- ---------- RPC: reserva atómica do próximo número ----------
CREATE OR REPLACE FUNCTION public.reserve_document_number (
  p_account_id uuid,
  p_type public.document_type,
  p_year smallint
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next integer;
BEGIN
  INSERT INTO public.document_sequences (account_id, type, year, last_seq, updated_at)
  VALUES (p_account_id, p_type, p_year, 1, now())
  ON CONFLICT (account_id, type, year)
  DO UPDATE SET last_seq = public.document_sequences.last_seq + 1, updated_at = now()
  RETURNING last_seq INTO v_next;
  RETURN v_next;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_document_number (uuid, public.document_type, smallint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_document_number (uuid, public.document_type, smallint) TO authenticated;

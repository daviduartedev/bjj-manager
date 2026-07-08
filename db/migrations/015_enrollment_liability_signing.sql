-- =====================================================
-- Migração 015: Matrícula/Termo ASLAM + assinatura digital
-- - document_type: enrollment_liability_form
-- - students.guardian_phone
-- - generated_documents: colunas de assinatura
-- Idempotente.
-- =====================================================

DO $$ BEGIN
  ALTER TYPE public.document_type ADD VALUE 'enrollment_liability_form';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.document_signature_status AS ENUM (
    'awaiting_signature',
    'signed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS guardian_phone text NULL;

ALTER TABLE public.generated_documents
  ADD COLUMN IF NOT EXISTS signature_status public.document_signature_status NULL,
  ADD COLUMN IF NOT EXISTS signing_token_hash text NULL,
  ADD COLUMN IF NOT EXISTS signing_expires_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS signed_storage_key text NULL,
  ADD COLUMN IF NOT EXISTS signed_mime_type text NULL,
  ADD COLUMN IF NOT EXISTS signed_checksum_sha256 text NULL;

CREATE INDEX IF NOT EXISTS idx_generated_documents_signature_status
  ON public.generated_documents (account_id, signature_status)
  WHERE signature_status IS NOT NULL;

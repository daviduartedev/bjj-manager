-- One-shot for bases já criadas antes de `profiles.phone` existir em schema.sql.
-- Idempotente em Postgres ≥ 9.1 com IF NOT EXISTS.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text NULL;

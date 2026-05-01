-- =====================================================
-- Casca - Gestão de Academias de BJJ - Seed SQL (Supabase / Postgres)
-- =====================================================
-- Run after schema.sql. Idempotent where ON CONFLICT applies.
-- Dev account UUID fixed for repeatable local/dev seeds (BR-1.4).
-- =====================================================

-- ---------- Dev academy + default plans (Kid 1 / Juvenil / Adulto) ----------
INSERT INTO
  public.accounts (id, name)
VALUES
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'Academia (seed dev)'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO
  public.plans (account_id, kind, name, price_cents, active)
VALUES
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'kids_1',
    'Kid 1',
    10000,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'kids_2',
    'Juvenil',
    12000,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'adult',
    'Adulto',
    12000,
    true
  )
ON CONFLICT ON CONSTRAINT plans_account_kind_unique DO NOTHING;

-- ---------- Official belts (GR-1 adult + GR-2 kids) ----------
INSERT INTO
  public.belts (kind, slug, ordinal)
VALUES
  ('adult', 'white', 1),
  ('adult', 'blue', 2),
  ('adult', 'purple', 3),
  ('adult', 'brown', 4),
  ('adult', 'black', 5),
  ('kids', 'white', 1),
  ('kids', 'gray_white', 2),
  ('kids', 'gray', 3),
  ('kids', 'gray_black', 4),
  ('kids', 'yellow_white', 5),
  ('kids', 'yellow', 6),
  ('kids', 'yellow_black', 7),
  ('kids', 'orange_white', 8),
  ('kids', 'orange', 9),
  ('kids', 'orange_black', 10),
  ('kids', 'green_white', 11),
  ('kids', 'green', 12),
  ('kids', 'green_black', 13)
ON CONFLICT (slug) DO NOTHING;

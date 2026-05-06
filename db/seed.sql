-- =====================================================
-- Casca - Gestão de Academias de BJJ - Seed SQL (Supabase / Postgres)
-- =====================================================
-- Run after schema.sql. Idempotent where ON CONFLICT applies.
-- Dev account UUID fixed for repeatable local/dev seeds (BR-1.4).
-- =====================================================

-- ---------- Dev academy + default plans (Kids 1 / Kids 2 / Adulto) ----------
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
    'Kids 1',
    10000,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'kids_2',
    'Kids 2',
    10000,
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

-- ---------- Produtos iniciais (conta seed dev) ----------
INSERT INTO
  public.products (account_id, code, name, active, sort_order)
VALUES
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'academy-shirts',
    'Camisetas da academia',
    true,
    10
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'rash-guards-femininas',
    'Rash Guards femininas',
    true,
    20
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'rash-guards-masculinas',
    'Rash Guards masculinas',
    true,
    30
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'quimonos-kmno',
    'Quimonos KMNO',
    true,
    40
  ),
  (
    '00000000-0000-4000-8000-000000000001'::uuid,
    'quimonos-zenshins',
    'Quimonos Zanshin',
    true,
    50
  )
ON CONFLICT ON CONSTRAINT products_account_code_unique DO NOTHING;

INSERT INTO
  public.product_variants (product_id, size_label, stock_quantity, sort_order)
SELECT
  p.id,
  v.size_label,
  0,
  v.sort_order
FROM
  public.products p
  INNER JOIN (
    VALUES
      ('academy-shirts', 'P', 10),
      ('academy-shirts', 'M', 20),
      ('academy-shirts', 'G', 30),
      ('academy-shirts', 'GG', 40)
  ) AS v(product_code, size_label, sort_order) ON p.code = v.product_code
  AND p.account_id = '00000000-0000-4000-8000-000000000001'::uuid
ON CONFLICT ON CONSTRAINT product_variants_product_size_unique DO NOTHING;

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

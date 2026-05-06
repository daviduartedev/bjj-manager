-- Ciclo 24-0430: produtos e variantes por conta (controle interno, sem venda).
-- Idempotente para ambientes existentes.

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  account_id uuid NOT NULL REFERENCES public.accounts (id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_account_code_unique UNIQUE (account_id, code),
  CONSTRAINT products_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT products_code_not_blank CHECK (length(trim(code)) > 0)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  size_label text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_product_size_unique UNIQUE (product_id, size_label),
  CONSTRAINT product_variants_size_not_blank CHECK (length(trim(size_label)) > 0),
  CONSTRAINT product_variants_stock_non_negative CHECK (stock_quantity >= 0)
);

CREATE INDEX IF NOT EXISTS idx_products_account_id ON public.products (account_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);

INSERT INTO
  public.products (account_id, code, name, active, sort_order)
SELECT
  a.id,
  seed.code,
  seed.name,
  true,
  seed.sort_order
FROM
  public.accounts a
  CROSS JOIN (
    VALUES
      ('academy-shirts', 'Camisetas da academia', 10),
      ('rash-guards-femininas', 'Rash Guards femininas', 20),
      ('rash-guards-masculinas', 'Rash Guards masculinas', 30),
      ('quimonos-kmno', 'Quimonos KMNO', 40),
      ('quimonos-zenshins', 'Quimonos Zanshin', 50)
  ) AS seed(code, name, sort_order)
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
ON CONFLICT ON CONSTRAINT product_variants_product_size_unique DO NOTHING;

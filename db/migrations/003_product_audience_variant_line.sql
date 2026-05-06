-- Público-alvo do produto e linha da variante (ex.: corte feminino).
-- Idempotente: seguro correr mais de uma vez em ambientes já migrados.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'unisex';

ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS line text NOT NULL DEFAULT 'unisex';

DO $$
BEGIN
  ALTER TABLE public.products
  ADD CONSTRAINT products_audience_check CHECK (
    audience IN ('unisex', 'masculine', 'feminine')
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.product_variants
  ADD CONSTRAINT product_variants_line_check CHECK (line IN ('unisex', 'feminine'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.products
SET
  audience = 'feminine'
WHERE
  audience = 'unisex'
  AND (
    code ILIKE '%femininas%'
    OR name ILIKE '%femininas%'
    OR name ILIKE '%feminina%'
  );

UPDATE public.product_variants pv
SET
  line = 'feminine'
FROM
  public.products p
WHERE
  pv.product_id = p.id
  AND p.audience = 'feminine'
  AND pv.line = 'unisex';

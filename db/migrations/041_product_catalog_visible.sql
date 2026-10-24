-- #43: marcar produto na vitrine pública. Não altera portal_visible.
-- Aditivo: coluna nova com default desligado. Reaplicável.

BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS catalog_visible boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.catalog_visible IS
  'Quando verdadeiro, o produto pode entrar na loja pública se estiver ativo e tiver tamanho com preço acima de zero.';

CREATE OR REPLACE FUNCTION public.storefront_products (p_slug text)
RETURNS TABLE (
  name text,
  description text,
  audience text,
  active boolean,
  catalog_visible boolean,
  variants jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    product.name,
    product.description,
    product.audience,
    product.active,
    product.catalog_visible,
    jsonb_agg(
      jsonb_build_object(
        'size_label', variant.size_label,
        'price_cents', variant.price_cents,
        'stock_quantity', variant.stock_quantity,
        'sort_order', variant.sort_order,
        'line', variant.line
      )
      ORDER BY variant.sort_order, variant.size_label
    ) AS variants
  FROM public.accounts AS account
  INNER JOIN public.products AS product
    ON product.account_id = account.id
  INNER JOIN public.product_variants AS variant
    ON variant.product_id = product.id
  WHERE pg_catalog.lower(account.slug) = pg_catalog.lower(pg_catalog.btrim(p_slug))
    AND product.active = true
    AND product.catalog_visible = true
    AND EXISTS (
      SELECT 1
      FROM public.product_variants AS priced
      WHERE priced.product_id = product.id
        AND priced.price_cents > 0
    )
    AND (
      account.storefront_published = true
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS profile
        WHERE profile.user_id = auth.uid()
          AND profile.account_id = account.id
      )
    )
  GROUP BY
    product.id,
    product.name,
    product.description,
    product.audience,
    product.active,
    product.catalog_visible;
$$;

REVOKE ALL ON FUNCTION public.storefront_products (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_products (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_products (text) IS
  'Produtos da loja daquele slug, sem código interno. A página projeta elegibilidade, preço inicial e não mostra estoque.';

COMMIT;

-- O catálogo do endereço é público. Visitante sem login vê os produtos marcados.

BEGIN;

DROP FUNCTION IF EXISTS public.storefront_account (text);

CREATE FUNCTION public.storefront_account (p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  logo_url text,
  slug text,
  storefront_published boolean,
  storefront_whatsapp text,
  storefront_theme jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    account.id,
    account.name,
    account.logo_url,
    account.slug,
    account.storefront_published,
    account.storefront_whatsapp,
    account.storefront_theme
  FROM public.accounts AS account
  WHERE pg_catalog.lower(account.slug) = pg_catalog.lower(pg_catalog.btrim(p_slug))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.storefront_account (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_account (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_account (text) IS
  'Catálogo público daquele endereço, inclusive as cores.';

DROP FUNCTION IF EXISTS public.storefront_products (text);

CREATE FUNCTION public.storefront_products (p_slug text)
RETURNS TABLE (
  name text,
  description text,
  audience text,
  active boolean,
  catalog_visible boolean,
  variants jsonb,
  photo_paths jsonb
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
    (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'size_label', variant.size_label,
            'price_cents', variant.price_cents,
            'in_stock', variant.stock_quantity > 0,
            'sort_order', variant.sort_order,
            'line', variant.line
          )
          ORDER BY variant.sort_order, variant.size_label
        ),
        '[]'::jsonb
      )
      FROM public.product_variants AS variant
      WHERE variant.product_id = product.id
    ) AS variants,
    COALESCE(
      (
        SELECT jsonb_agg(photo.storage_path ORDER BY photo.sort_order)
        FROM public.product_photos AS photo
        WHERE photo.product_id = product.id
      ),
      '[]'::jsonb
    ) AS photo_paths
  FROM public.accounts AS account
  INNER JOIN public.products AS product
    ON product.account_id = account.id
  WHERE pg_catalog.lower(account.slug) = pg_catalog.lower(pg_catalog.btrim(p_slug))
    AND product.active = true
    AND product.catalog_visible = true
    AND EXISTS (
      SELECT 1
      FROM public.product_variants AS sized
      WHERE sized.product_id = product.id
    );
$$;

REVOKE ALL ON FUNCTION public.storefront_products (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_products (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_products (text) IS
  'Produtos públicos do catálogo daquele endereço, sem código interno e sem quantidade em estoque.';

CREATE OR REPLACE FUNCTION public.storefront_logo_public (object_name text) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.accounts AS account
    WHERE account.logo_url IS NOT NULL
      AND account.logo_url = object_name
  );
$$;

CREATE OR REPLACE FUNCTION public.storefront_product_photo_public (object_name text) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.product_photos AS photo
    INNER JOIN public.products AS product
      ON product.id = photo.product_id
    INNER JOIN public.accounts AS account
      ON account.id = product.account_id
    WHERE photo.storage_path = object_name
      AND product.active = true
      AND product.catalog_visible = true
      AND EXISTS (
        SELECT 1
        FROM public.product_variants AS sized
        WHERE sized.product_id = product.id
      )
  );
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;

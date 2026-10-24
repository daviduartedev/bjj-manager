-- Prévia só do professor. Anônimo não lê loja desligada nem estoque numérico.

BEGIN;

CREATE OR REPLACE FUNCTION public.storefront_account (p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  logo_url text,
  slug text,
  storefront_published boolean,
  storefront_whatsapp text
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
    account.storefront_whatsapp
  FROM public.accounts AS account
  WHERE pg_catalog.lower(account.slug) = pg_catalog.lower(pg_catalog.btrim(p_slug))
    AND (
      (
        account.storefront_published = true
        AND account.storefront_whatsapp ~ '^[0-9]{10,15}$'
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS profile
        WHERE profile.user_id = auth.uid()
          AND profile.account_id = account.id
          AND profile.role = 'professor'::public.profile_role
      )
    )
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.storefront_account (text) IS
  'Loja publicada com WhatsApp válido, ou a prévia do professor daquela academia.';

CREATE OR REPLACE FUNCTION public.storefront_products (p_slug text)
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
        AND variant.price_cents > 0
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
      FROM public.product_variants AS priced
      WHERE priced.product_id = product.id
        AND priced.price_cents > 0
    )
    AND (
      (
        account.storefront_published = true
        AND account.storefront_whatsapp ~ '^[0-9]{10,15}$'
      )
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS profile
        WHERE profile.user_id = auth.uid()
          AND profile.account_id = account.id
          AND profile.role = 'professor'::public.profile_role
      )
    );
$$;

COMMENT ON FUNCTION public.storefront_products (text) IS
  'Produtos da loja daquele slug, sem código interno e sem quantidade em estoque. Foto só desses produtos.';

COMMIT;

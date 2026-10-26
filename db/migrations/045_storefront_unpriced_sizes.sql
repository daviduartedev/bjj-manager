-- Tamanho sem preço continua no catálogo de produtos. Preço vazio aparece como "A combinar".

BEGIN;

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
  'Produtos do catálogo daquele slug, inclusive tamanhos sem preço. Sem código interno e sem quantidade em estoque.';

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
      AND account.storefront_published = true
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

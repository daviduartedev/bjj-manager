-- #46: fotos do produto na loja. Bucket existente branding; path {account_id}/products/{product_id}/{photo_id}.ext
-- Aditivo. Reaplicável. Não cria bucket.

BEGIN;

CREATE TABLE IF NOT EXISTS public.product_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order integer NOT NULL,
  CONSTRAINT product_photos_product_sort_unique UNIQUE (product_id, sort_order),
  CONSTRAINT product_photos_storage_path_not_blank CHECK (length(btrim(storage_path)) > 0),
  CONSTRAINT product_photos_sort_order_non_negative CHECK (sort_order >= 0)
);

COMMENT ON TABLE public.product_photos IS
  'Fotos do produto, compartilhadas por todos os tamanhos. A menor sort_order é a capa.';

CREATE INDEX IF NOT EXISTS idx_product_photos_product_id
  ON public.product_photos (product_id);

ALTER TABLE public.product_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_photos_professor_all ON public.product_photos;

CREATE POLICY product_photos_professor_all ON public.product_photos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.user_id = auth.uid()
      AND profile.role::text = 'professor'
      AND profile.account_id = public.current_account_id()
  )
  AND EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = product_photos.product_id
      AND product.account_id = public.current_account_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.user_id = auth.uid()
      AND profile.role::text = 'professor'
      AND profile.account_id = public.current_account_id()
  )
  AND EXISTS (
    SELECT 1
    FROM public.products AS product
    WHERE product.id = product_photos.product_id
      AND product.account_id = public.current_account_id()
  )
);

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
    jsonb_agg(
      jsonb_build_object(
        'size_label', variant.size_label,
        'price_cents', variant.price_cents,
        'stock_quantity', variant.stock_quantity,
        'sort_order', variant.sort_order,
        'line', variant.line
      )
      ORDER BY variant.sort_order, variant.size_label
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
  'Produtos da loja daquele slug, sem código interno. Inclui caminhos de foto só desses produtos. A página assina os caminhos depois de projetar o catálogo.';

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
        FROM public.product_variants AS priced
        WHERE priced.product_id = product.id
          AND priced.price_cents > 0
      )
  );
$$;

REVOKE ALL ON FUNCTION public.storefront_product_photo_public (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_product_photo_public (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_product_photo_public (text) IS
  'Verdadeiro só quando o objeto é foto de um produto que já entra na loja publicada.';

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "branding read published storefront product photo" ON storage.objects';
  EXECUTE $policy$
    CREATE POLICY "branding read published storefront product photo" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (
      bucket_id = 'branding-dev'
      AND public.storefront_product_photo_public(name)
    )
  $policy$;
END $$;

COMMIT;

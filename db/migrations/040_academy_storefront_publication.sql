-- #42: WhatsApp e publicação da loja em /loja/{slug}.
-- Aditivo: não remove colunas nem renomeia slug. Reaplicável.

BEGIN;

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS storefront_whatsapp text;

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS storefront_published boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.accounts.storefront_whatsapp IS
  'WhatsApp da loja em dígitos E.164, sem +. Nulo enquanto a loja não tem contato.';

COMMENT ON COLUMN public.accounts.storefront_published IS
  'Visitante anônimo vê a loja só quando verdadeiro e o WhatsApp normaliza.';

ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_storefront_whatsapp_digits_ck;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_storefront_whatsapp_digits_ck CHECK (
    storefront_whatsapp IS NULL OR storefront_whatsapp ~ '^[0-9]{10,}$'
  );

ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_storefront_published_whatsapp_ck;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_storefront_published_whatsapp_ck CHECK (
    storefront_published = false OR storefront_whatsapp IS NOT NULL
  );

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
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.storefront_account (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_account (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_account (text) IS
  'Leitura pública da loja: só id, nome, logo, slug, publicação e WhatsApp do endereço pedido.';

CREATE OR REPLACE FUNCTION public.storefront_logo_public (object_name text) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.accounts AS account
    WHERE account.storefront_published = true
      AND account.logo_url IS NOT NULL
      AND account.logo_url = object_name
  );
$$;

REVOKE ALL ON FUNCTION public.storefront_logo_public (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_logo_public (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_logo_public (text) IS
  'Verdadeiro só quando o objeto é a logo de uma loja já publicada.';

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "branding read published storefront logo" ON storage.objects';
  EXECUTE $policy$
    CREATE POLICY "branding read published storefront logo" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (
      bucket_id = 'branding-dev'
      AND public.storefront_logo_public(name)
    )
  $policy$;
END $$;

COMMIT;

-- Cores da loja pública. Aditivo. Reaplicável.
-- Troca o retorno de storefront_account, então a função é recriada.

BEGIN;

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS storefront_theme jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.accounts.storefront_theme IS
  'Cores da loja pública. Chaves ausentes usam o padrão da aplicação.';

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

REVOKE ALL ON FUNCTION public.storefront_account (text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storefront_account (text) TO anon, authenticated;

COMMENT ON FUNCTION public.storefront_account (text) IS
  'Loja publicada com WhatsApp válido, ou a prévia do professor daquela academia, incluindo as cores.';

NOTIFY pgrst, 'reload schema';

COMMIT;

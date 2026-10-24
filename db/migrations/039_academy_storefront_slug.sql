-- #41: endereço público da academia em /loja/{slug}.
-- O insert que cria a conta está em provision_academy_for_current_user.
-- Aditivo: não remove colunas. Reaplicável.

BEGIN;

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS slug text;

COMMENT ON COLUMN public.accounts.slug IS
  'Endereço público da loja em /loja/{slug}. Renomear a academia não altera o slug.';

CREATE OR REPLACE FUNCTION public.allocate_academy_slug (name text) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_base text;
  v_candidate text;
  v_head text;
  v_suffix text;
  v_n integer := 1;
  v_reserved text[] := ARRAY[
    'loja', 'painel', 'portal', 'login', 'admin', 'api',
    'produtos', 'termos', 'privacidade', 'configuracoes'
  ];
BEGIN
  v_base := pg_catalog.lower(
    pg_catalog.translate(
      coalesce(name, ''),
      'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
      'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn'
    )
  );
  v_base := pg_catalog.regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := pg_catalog.regexp_replace(v_base, '^-+|-+$', '', 'g');
  v_base := pg_catalog.regexp_replace(pg_catalog.left(v_base, 40), '-+$', '');

  IF pg_catalog.char_length(v_base) < 3 THEN
    v_base := 'academia';
  END IF;

  v_candidate := v_base;
  WHILE v_candidate = ANY (v_reserved)
     OR pg_catalog.char_length(v_candidate) < 3
     OR pg_catalog.char_length(v_candidate) > 40
     OR v_candidate !~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
     OR EXISTS (
       SELECT 1
       FROM public.accounts AS account
       WHERE pg_catalog.lower(account.slug) = v_candidate
     )
  LOOP
    v_n := v_n + 1;
    v_suffix := '-' || v_n::text;
    v_head := pg_catalog.regexp_replace(
      pg_catalog.left(v_base, 40 - pg_catalog.char_length(v_suffix)),
      '-+$',
      ''
    );
    v_candidate := v_head || v_suffix;
    IF v_n > 1000 THEN
      RAISE EXCEPTION 'could not allocate academy slug' USING ERRCODE = '23505';
    END IF;
  END LOOP;

  RETURN v_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.allocate_academy_slug (text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_academy_slug (text) TO service_role;

COMMENT ON FUNCTION public.allocate_academy_slug (text) IS
  'Slug da academia: minúsculas, hífens, 3–40, sufixo -2/-3 se reservado ou ocupado.';

DO $$
DECLARE
  academy record;
BEGIN
  FOR academy IN
    SELECT id, name
    FROM public.accounts
    WHERE slug IS NULL
    ORDER BY created_at, id
  LOOP
    UPDATE public.accounts
    SET slug = public.allocate_academy_slug(academy.name)
    WHERE id = academy.id
      AND slug IS NULL;
  END LOOP;
END $$;

ALTER TABLE public.accounts ALTER COLUMN slug SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_slug_format_ck CHECK (
      char_length(slug) BETWEEN 3 AND 40
      AND slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'
      AND slug NOT IN (
        'loja', 'painel', 'portal', 'login', 'admin', 'api',
        'produtos', 'termos', 'privacidade', 'configuracoes'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS accounts_slug_lower_uidx ON public.accounts (lower(slug));

CREATE OR REPLACE FUNCTION public.assign_account_slug () RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.slug IS NULL OR pg_catalog.btrim(NEW.slug) = '' THEN
    NEW.slug := public.allocate_academy_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_account_slug () FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS accounts_assign_slug ON public.accounts;
CREATE TRIGGER accounts_assign_slug
BEFORE INSERT ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.assign_account_slug ();

CREATE OR REPLACE FUNCTION public.provision_academy_for_current_user () RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid;
  v_role text;
  v_email_confirmed_at timestamptz;
  v_invited_at timestamptz;
  v_academy_name text;
  v_display_name text;
  v_consumed_at timestamptz;
  v_account_id uuid;
  v_modality text;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  -- Serializa duas confirmações do mesmo utilizador para não criar duas academias.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text, 0::bigint));

  v_role := NULL;
  SELECT profile.role::text
  INTO v_role
  FROM public.profiles AS profile
  WHERE profile.user_id = v_uid
  LIMIT 1;

  IF v_role IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'existing', 'role', v_role);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.students AS student
    WHERE student.user_id = v_uid
  ) THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  SELECT auth_user.email_confirmed_at, auth_user.invited_at
  INTO v_email_confirmed_at, v_invited_at
  FROM auth.users AS auth_user
  WHERE auth_user.id = v_uid;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  IF v_email_confirmed_at IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'email_not_confirmed', 'role', NULL);
  END IF;

  IF v_invited_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  v_academy_name := NULL;
  v_display_name := NULL;
  v_consumed_at := NULL;
  SELECT intent.academy_name, intent.display_name, intent.consumed_at, intent.modality
  INTO v_academy_name, v_display_name, v_consumed_at, v_modality
  FROM public.academy_registration_intents AS intent
  WHERE intent.user_id = v_uid;

  IF v_academy_name IS NULL OR v_consumed_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  INSERT INTO public.accounts (name, modality, slug)
  VALUES (v_academy_name, v_modality, public.allocate_academy_slug(v_academy_name))
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, account_id, display_name, role)
  VALUES (
    v_uid,
    v_account_id,
    v_display_name,
    'professor'::public.profile_role
  );

  INSERT INTO public.plans (account_id, kind, name, price_cents, active)
  VALUES
    (v_account_id, 'kids_1'::public.plan_kind, 'Kids 1', 10000, true),
    (v_account_id, 'kids_2'::public.plan_kind, 'Kids 2', 10000, true),
    (v_account_id, 'adult'::public.plan_kind, 'Adulto', 12000, true),
    (v_account_id, 'baby'::public.plan_kind, 'Baby', 10000, true)
  ON CONFLICT (account_id, kind) DO NOTHING;

  UPDATE public.academy_registration_intents
  SET
    consumed_at = pg_catalog.now(),
    account_id = v_account_id
  WHERE user_id = v_uid
    AND consumed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'academy registration intent was not consumed'
      USING ERRCODE = '40001';
  END IF;

  RETURN pg_catalog.jsonb_build_object('outcome', 'created', 'role', 'professor');
END;
$$;

REVOKE ALL ON FUNCTION public.provision_academy_for_current_user () FROM PUBLIC;
REVOKE ALL ON FUNCTION public.provision_academy_for_current_user () FROM anon;
REVOKE ALL ON FUNCTION public.provision_academy_for_current_user () FROM service_role;

GRANT EXECUTE ON FUNCTION public.provision_academy_for_current_user () TO authenticated;

COMMENT ON FUNCTION public.provision_academy_for_current_user () IS
  'Cria a academia do auth.uid() a partir da intenção ainda não consumida. Não altera conta, perfil nem preço de plano já existentes.';

COMMIT;

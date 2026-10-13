-- Cadastro público da academia.
-- A elegibilidade é a linha em academy_registration_intents, não raw_user_meta_data.
-- Idempotente. Não altera as migrations 021–029 nem cria INSERT em accounts ou profiles.

CREATE TABLE IF NOT EXISTS public.academy_registration_intents (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  academy_name text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz NULL,
  account_id uuid NULL REFERENCES public.accounts (id) ON DELETE SET NULL,
  CONSTRAINT academy_registration_intents_academy_name_ck CHECK (
    academy_name = trim(academy_name)
    AND length(academy_name) BETWEEN 2 AND 80
  ),
  CONSTRAINT academy_registration_intents_display_name_ck CHECK (
    display_name = trim(display_name)
    AND length(display_name) BETWEEN 2 AND 80
  )
);

COMMENT ON TABLE public.academy_registration_intents IS
  'Intenção de cadastro público. Criar academia exige esta linha, não o metadata do Auth.';

COMMENT ON COLUMN public.academy_registration_intents.consumed_at IS
  'Preenchido uma vez na provisão e nunca limpo.';

ALTER TABLE public.academy_registration_intents ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.academy_registration_intents FROM PUBLIC;
REVOKE ALL ON TABLE public.academy_registration_intents FROM anon;
REVOKE ALL ON TABLE public.academy_registration_intents FROM authenticated;

CREATE OR REPLACE FUNCTION public.prevent_clearing_academy_registration_consumption () RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.consumed_at IS NOT NULL AND NEW.consumed_at IS DISTINCT FROM OLD.consumed_at THEN
    RAISE EXCEPTION 'academy registration consumption is permanent'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_clearing_academy_registration_consumption () FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_clearing_academy_registration_consumption () FROM anon;
REVOKE ALL ON FUNCTION public.prevent_clearing_academy_registration_consumption () FROM authenticated;

DROP TRIGGER IF EXISTS academy_registration_intents_consumption_permanent ON public.academy_registration_intents;

CREATE TRIGGER academy_registration_intents_consumption_permanent
BEFORE UPDATE ON public.academy_registration_intents
FOR EACH ROW
EXECUTE FUNCTION public.prevent_clearing_academy_registration_consumption ();

CREATE OR REPLACE FUNCTION public.record_academy_registration (user_id uuid, academy_name text, display_name text) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_academy_name text;
  v_display_name text;
BEGIN
  v_academy_name := pg_catalog.btrim(academy_name);
  v_display_name := pg_catalog.btrim(display_name);

  IF v_academy_name IS NULL
     OR pg_catalog.char_length(v_academy_name) < 2
     OR pg_catalog.char_length(v_academy_name) > 80
     OR v_display_name IS NULL
     OR pg_catalog.char_length(v_display_name) < 2
     OR pg_catalog.char_length(v_display_name) > 80 THEN
    RAISE EXCEPTION 'invalid academy registration names'
      USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.users AS auth_user
    WHERE auth_user.id = record_academy_registration.user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.user_id = record_academy_registration.user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.students AS student
    WHERE student.user_id = record_academy_registration.user_id
  ) OR EXISTS (
    SELECT 1
    FROM auth.users AS auth_user
    WHERE auth_user.id = record_academy_registration.user_id
      AND (
        auth_user.email_confirmed_at IS NOT NULL
        OR auth_user.invited_at IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'academy registration refused'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.academy_registration_intents (user_id, academy_name, display_name)
  VALUES (record_academy_registration.user_id, v_academy_name, v_display_name)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.record_academy_registration (uuid, text, text) TO service_role;

COMMENT ON FUNCTION public.record_academy_registration (uuid, text, text) IS
  'Grava a intenção de cadastro só para utilizador novo, sem perfil, sem aluno e sem convite. Não atualiza nomes.';

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
  SELECT intent.academy_name, intent.display_name, intent.consumed_at
  INTO v_academy_name, v_display_name, v_consumed_at
  FROM public.academy_registration_intents AS intent
  WHERE intent.user_id = v_uid;

  IF v_academy_name IS NULL OR v_consumed_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  INSERT INTO public.accounts (name)
  VALUES (v_academy_name)
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

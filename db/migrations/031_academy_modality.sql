-- MVP 0.2 / #28: expansão aditiva. Não altera alunos, faixas, planos ou documentos.
BEGIN;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'jiu_jitsu';
ALTER TABLE public.academy_registration_intents ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'jiu_jitsu';
DO $$ BEGIN
  ALTER TABLE public.accounts ADD CONSTRAINT accounts_modality_check CHECK (modality IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.academy_registration_intents ADD CONSTRAINT academy_registration_intents_modality_check CHECK (modality IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON COLUMN public.accounts.modality IS 'Uma modalidade por academia; independente de público, graduação, plano e turma.';
COMMENT ON COLUMN public.academy_registration_intents.modality IS 'Escolha validada pelo servidor, preservada na confirmação; metadata não concede autorização.';

-- A troca só poderá ocorrer por operação privilegiada que valide a elegibilidade.
-- SECURITY INVOKER preserva current_user do chamador, inclusive dentro da futura RPC.
CREATE OR REPLACE FUNCTION public.protect_account_modality () RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.modality IS DISTINCT FROM OLD.modality
     AND current_user IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'academy modality requires a controlled operation' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_account_modality () FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS accounts_protect_modality ON public.accounts;
CREATE TRIGGER accounts_protect_modality
BEFORE UPDATE OF modality ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.protect_account_modality ();

CREATE OR REPLACE FUNCTION public.record_academy_registration (user_id uuid, academy_name text, display_name text, modality text) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_academy_name text;
  v_display_name text;
  v_modality text;
BEGIN
  v_modality := modality;
  IF v_modality IS NULL OR v_modality NOT IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo') THEN
    RAISE EXCEPTION 'invalid academy modality' USING ERRCODE = '22023';
  END IF;

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

  INSERT INTO public.academy_registration_intents (user_id, academy_name, display_name, modality)
  VALUES (record_academy_registration.user_id, v_academy_name, v_display_name, v_modality)
  ON CONFLICT ON CONSTRAINT academy_registration_intents_pkey DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.record_academy_registration (uuid, text, text, text) TO service_role;

COMMENT ON FUNCTION public.record_academy_registration (uuid, text, text, text) IS
  'Grava a intenção de cadastro só para utilizador novo, sem perfil, sem aluno e sem convite. Não atualiza nomes.';

-- Compatibilidade: o cadastro anterior continua criando somente Jiu-Jitsu.
CREATE OR REPLACE FUNCTION public.record_academy_registration (user_id uuid, academy_name text, display_name text) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.record_academy_registration(user_id, academy_name, display_name, 'jiu_jitsu'::text);
END;
$$;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_academy_registration (uuid, text, text) TO service_role;

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

  INSERT INTO public.accounts (name, modality)
  VALUES (v_academy_name, v_modality)
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

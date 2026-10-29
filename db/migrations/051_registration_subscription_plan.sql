-- Escolha do plano SaaS preservada entre cadastro e confirmacao de e-mail.
-- Depende da migration de assinaturas Casca. Nao altera contas/alunos existentes.
BEGIN;

ALTER TABLE public.academy_registration_intents
  ADD COLUMN IF NOT EXISTS subscription_plan_id text NOT NULL DEFAULT 'essencial'
  CHECK (subscription_plan_id IN ('essencial', 'academia', 'evolucao'));

CREATE OR REPLACE FUNCTION public.record_academy_registration (
  user_id uuid, academy_name text, display_name text, modality text, subscription_plan_id text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF subscription_plan_id IS NULL OR subscription_plan_id NOT IN ('essencial', 'academia', 'evolucao') THEN
    RAISE EXCEPTION 'invalid subscription plan' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(user_id::text, 0::bigint));
  IF EXISTS (SELECT 1 FROM public.academy_registration_intents AS intent WHERE intent.user_id = record_academy_registration.user_id) THEN
    RETURN;
  END IF;

  -- Reaproveita as recusas para usuario confirmado, convidado, aluno ou com perfil.
  PERFORM public.record_academy_registration(user_id, academy_name, display_name, modality);
  UPDATE public.academy_registration_intents AS intent
  SET subscription_plan_id = record_academy_registration.subscription_plan_id
  WHERE intent.user_id = record_academy_registration.user_id
    AND intent.consumed_at IS NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.record_academy_registration (uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_academy_registration (uuid, text, text, text, text) TO service_role;

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
  v_subscription_plan_id text;
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
  SELECT intent.academy_name, intent.display_name, intent.consumed_at, intent.modality, intent.subscription_plan_id
  INTO v_academy_name, v_display_name, v_consumed_at, v_modality, v_subscription_plan_id
  FROM public.academy_registration_intents AS intent
  WHERE intent.user_id = v_uid;

  IF v_academy_name IS NULL OR v_consumed_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object('outcome', 'ineligible', 'role', NULL);
  END IF;

  INSERT INTO public.accounts (name, modality, slug)
  VALUES (v_academy_name, v_modality, public.allocate_academy_slug(v_academy_name))
  RETURNING id INTO v_account_id;

  -- O trigger de accounts cria a assinatura comercial pendente, sem liberar acesso.
  -- A escolha vem da intencao confiavel, nunca de metadata ou do callback.
  UPDATE public.casca_subscriptions
  SET plan_id = v_subscription_plan_id
  WHERE account_id = v_account_id
    AND kind = 'commercial'
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription provisioning unavailable' USING ERRCODE = '40001';
  END IF;

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

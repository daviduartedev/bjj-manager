-- Planos novos do Casca: inicial (50), academia_100 (100) e ilimitado (sem teto).
-- Os planos essencial, academia e evolucao viram legados: continuam validos para quem ja assina,
-- com o mesmo limite, mas nao podem ser contratados nem escolhidos numa troca.
-- Aditiva: nenhuma linha existente e alterada. So muda constraints, defaults e funcoes.
BEGIN;

-- Fonte unica de limite por plano no banco. NULL = plano desconhecido.
-- Funcoes puras usadas em CHECK: ficam executaveis por qualquer papel, senao uma escrita
-- direta autorizada por RLS falharia ao avaliar a constraint.
CREATE OR REPLACE FUNCTION public.casca_plan_student_limit(p_plan_id text) RETURNS integer
LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE p_plan_id
    WHEN 'inicial' THEN 50
    WHEN 'academia_100' THEN 100
    WHEN 'ilimitado' THEN 2147483647
    WHEN 'essencial' THEN 50
    WHEN 'academia' THEN 150
    WHEN 'evolucao' THEN 300
  END;
$$;
GRANT EXECUTE ON FUNCTION public.casca_plan_student_limit(text) TO PUBLIC;

CREATE OR REPLACE FUNCTION public.casca_plan_is_offered(p_plan_id text) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT coalesce(p_plan_id IN ('inicial', 'academia_100', 'ilimitado'), false);
$$;
GRANT EXECUTE ON FUNCTION public.casca_plan_is_offered(text) TO PUBLIC;

-- Constraints aceitam os seis IDs. Defaults passam ao plano inicial (so afetam linhas novas).
ALTER TABLE public.casca_subscriptions DROP CONSTRAINT IF EXISTS casca_subscriptions_plan_id_check;
ALTER TABLE public.casca_subscriptions ADD CONSTRAINT casca_subscriptions_plan_id_check
  CHECK (public.casca_plan_student_limit(plan_id) IS NOT NULL);
ALTER TABLE public.casca_subscriptions DROP CONSTRAINT IF EXISTS casca_subscriptions_pending_plan_id_check;
ALTER TABLE public.casca_subscriptions ADD CONSTRAINT casca_subscriptions_pending_plan_id_check
  CHECK (pending_plan_id IS NULL OR public.casca_plan_student_limit(pending_plan_id) IS NOT NULL);
ALTER TABLE public.casca_subscriptions ALTER COLUMN plan_id SET DEFAULT 'inicial';

ALTER TABLE public.casca_subscription_operations DROP CONSTRAINT IF EXISTS casca_subscription_operations_plan_id_check;
ALTER TABLE public.casca_subscription_operations ADD CONSTRAINT casca_subscription_operations_plan_id_check
  CHECK (public.casca_plan_student_limit(plan_id) IS NOT NULL);

ALTER TABLE public.casca_internal_academy_requests DROP CONSTRAINT IF EXISTS casca_internal_academy_requests_plan_id_check;
ALTER TABLE public.casca_internal_academy_requests ADD CONSTRAINT casca_internal_academy_requests_plan_id_check
  CHECK (public.casca_plan_student_limit(plan_id) IS NOT NULL);

ALTER TABLE public.academy_registration_intents DROP CONSTRAINT IF EXISTS academy_registration_intents_subscription_plan_id_check;
ALTER TABLE public.academy_registration_intents ADD CONSTRAINT academy_registration_intents_subscription_plan_id_check
  CHECK (public.casca_plan_student_limit(subscription_plan_id) IS NOT NULL);
ALTER TABLE public.academy_registration_intents ALTER COLUMN subscription_plan_id SET DEFAULT 'inicial';

-- Limite efetivo: o menor entre o plano atual e o pendente, como antes.
CREATE OR REPLACE FUNCTION public.casca_active_student_limit(p_account uuid) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE WHEN NOT public.casca_billing_enforced() THEN NULL ELSE (
    SELECT LEAST(
      coalesce(public.casca_plan_student_limit(s.plan_id), 0),
      coalesce(public.casca_plan_student_limit(s.pending_plan_id), 2147483647)
    ) FROM public.casca_subscriptions s WHERE s.account_id = p_account
  ) END;
$$;
REVOKE ALL ON FUNCTION public.casca_active_student_limit(uuid) FROM PUBLIC, anon, authenticated;

-- Sem plano pendente, o limite e o do plano atual (antes o teto implicito era 300, igual ao maior plano legado).
CREATE OR REPLACE FUNCTION public.casca_guard_plan_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_limit integer; v_old_limit integer; v_count bigint;
BEGIN
  IF NOT public.casca_billing_enforced() THEN RETURN NEW; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('casca-capacity:' || NEW.account_id::text, 0));
  v_old_limit := LEAST(
    coalesce(public.casca_plan_student_limit(OLD.plan_id), 0),
    coalesce(public.casca_plan_student_limit(OLD.pending_plan_id), 2147483647));
  v_limit := LEAST(
    coalesce(public.casca_plan_student_limit(NEW.plan_id), 0),
    coalesce(public.casca_plan_student_limit(NEW.pending_plan_id), 2147483647));
  IF v_limit < v_old_limit THEN
    SELECT pg_catalog.count(*) INTO v_count FROM public.students s
    WHERE s.account_id = NEW.account_id AND s.status::text = 'active' AND s.archived_at IS NULL AND s.removed_at IS NULL;
    IF v_count > v_limit THEN RAISE EXCEPTION 'casca_subscription_capacity' USING ERRCODE = '23514'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.casca_guard_plan_capacity() FROM PUBLIC, anon, authenticated;

-- Nova contratacao: so planos oferecidos.
CREATE OR REPLACE FUNCTION public.casca_reserve_checkout(p_account_id uuid,p_plan_id text,p_expected_version integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_operation public.casca_subscription_operations%ROWTYPE; current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF NOT public.casca_plan_is_offered(p_plan_id) THEN RAISE EXCEPTION 'invalid_plan'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription_missing'; END IF;
  IF current_subscription.kind<>'commercial' OR current_subscription.version<>p_expected_version
    OR current_subscription.status IN ('active','trialing') OR current_subscription.paid_until>now() THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  SELECT * INTO current_operation FROM public.casca_subscription_operations
    WHERE account_id=p_account_id AND status IN ('creating','ready','paid') ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN RETURN jsonb_build_object('operation',to_jsonb(current_operation),'reserved',false); END IF;
  INSERT INTO public.casca_subscription_operations(account_id,kind,plan_id,subscription_version)
    VALUES(p_account_id,'checkout',p_plan_id,current_subscription.version+1) RETURNING * INTO current_operation;
  UPDATE public.casca_subscriptions SET plan_id=p_plan_id,updated_at=now(),version=version+1 WHERE account_id=p_account_id;
  RETURN jsonb_build_object('operation',to_jsonb(current_operation),'reserved',true);
END;
$$;

-- Troca de plano: destino oferecido. Cancelamento envia o plano atual, que pode ser legado.
CREATE OR REPLACE FUNCTION public.casca_reserve_operation(p_account_id uuid,p_kind text,p_plan_id text,p_amount_cents integer,p_expected_version integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_operation public.casca_subscription_operations%ROWTYPE; current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_kind NOT IN ('upgrade','downgrade','cancel') OR public.casca_plan_student_limit(p_plan_id) IS NULL
    OR (p_kind<>'cancel' AND NOT public.casca_plan_is_offered(p_plan_id)) THEN RAISE EXCEPTION 'invalid_plan'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription_missing'; END IF;
  IF current_subscription.kind<>'commercial' OR current_subscription.version<>p_expected_version
    OR current_subscription.status NOT IN ('active','trialing') THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  SELECT * INTO current_operation FROM public.casca_subscription_operations
    WHERE account_id=p_account_id AND status IN ('creating','ready','paid') ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN RETURN jsonb_build_object('operation',to_jsonb(current_operation),'reserved',false); END IF;
  INSERT INTO public.casca_subscription_operations(account_id,kind,plan_id,amount_cents,subscription_version)
    VALUES(p_account_id,p_kind,p_plan_id,p_amount_cents,current_subscription.version+1) RETURNING * INTO current_operation;
  UPDATE public.casca_subscriptions SET updated_at=now(),version=version+1 WHERE account_id=p_account_id;
  RETURN jsonb_build_object('operation',to_jsonb(current_operation),'reserved',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.casca_schedule_plan_change(p_account_id uuid,p_plan_id text,p_at timestamptz,p_expected_version integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF NOT public.casca_plan_is_offered(p_plan_id) THEN RAISE EXCEPTION 'invalid_plan'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND OR current_subscription.kind<>'commercial' OR current_subscription.version<>p_expected_version THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  UPDATE public.casca_subscriptions SET pending_plan_id=p_plan_id,pending_plan_at=p_at,updated_at=now(),version=version+1 WHERE account_id=p_account_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.casca_apply_immediate_plan(p_account_id uuid,p_plan_id text,p_expected_version integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF NOT public.casca_plan_is_offered(p_plan_id) THEN RAISE EXCEPTION 'invalid_plan'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND OR current_subscription.kind<>'commercial' OR current_subscription.version<>p_expected_version THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  UPDATE public.casca_subscriptions SET plan_id=p_plan_id,pending_plan_id=NULL,pending_plan_at=NULL,updated_at=now(),version=version+1 WHERE account_id=p_account_id;
END;
$$;

-- Painel da plataforma: aceita qualquer plano conhecido (a interface oferece so os novos).
CREATE OR REPLACE FUNCTION public.casca_admin_change_kind(
  p_account_id uuid,p_actor_user_id uuid,p_kind text,p_plan_id text,p_reason text,p_expected_version integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_kind NOT IN ('commercial','internal_test','exempt') OR public.casca_plan_student_limit(p_plan_id) IS NULL
    OR char_length(btrim(p_reason)) NOT BETWEEN 5 AND 500 OR p_actor_user_id IS NULL THEN RAISE EXCEPTION 'invalid_admin_change'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription_missing'; END IF;
  IF current_subscription.version<>p_expected_version THEN RAISE EXCEPTION 'subscription_changed' USING ERRCODE='40001'; END IF;
  IF current_subscription.kind='commercial' AND p_kind='commercial' THEN RAISE EXCEPTION 'use_commercial_plan_change'; END IF;

  UPDATE public.casca_subscriptions SET kind=p_kind,plan_id=p_plan_id,
    status=CASE WHEN p_kind='commercial' THEN 'pending' ELSE 'active' END,
    trial_used=true,trial_ends_at=NULL,pending_plan_id=NULL,pending_plan_at=NULL,
    provider_subscription_id=NULL,provider_checkout_id=NULL,provider_checkout_url=NULL,
    provider_customer_id=NULL,
    current_period_start=CASE WHEN p_kind='commercial' THEN NULL ELSE current_period_start END,
    paid_until=CASE WHEN p_kind='commercial' THEN NULL ELSE paid_until END,
    updated_at=now(),version=version+1 WHERE account_id=p_account_id;
  UPDATE public.casca_subscription_operations SET status='failed',updated_at=now()
    WHERE account_id=p_account_id AND status IN ('creating','ready','paid');
  UPDATE public.casca_subscription_notifications SET status='cancelled'
    WHERE account_id=p_account_id AND status IN ('pending','failed');
  INSERT INTO public.casca_admin_audit(account_id,actor_user_id,action,reason,previous_kind,previous_plan_id,new_kind,new_plan_id)
    VALUES(p_account_id,p_actor_user_id,p_kind,btrim(p_reason),current_subscription.kind,current_subscription.plan_id,p_kind,p_plan_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.casca_admin_reserve_internal(
  p_id uuid,p_actor_user_id uuid,p_academy_name text,p_email text,p_modality text,p_plan_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE request public.casca_internal_academy_requests%ROWTYPE;
BEGIN
  IF p_id IS NULL OR p_actor_user_id IS NULL OR char_length(btrim(p_academy_name)) NOT BETWEEN 2 AND 80
    OR p_modality NOT IN ('jiu_jitsu','boxing','judo','muay_thai') OR public.casca_plan_student_limit(p_plan_id) IS NULL
    OR char_length(p_email)>254 OR p_email NOT LIKE '%@%' THEN RAISE EXCEPTION 'invalid_internal_request'; END IF;
  INSERT INTO public.casca_internal_academy_requests(id,actor_user_id,academy_name,email,modality,plan_id)
    VALUES(p_id,p_actor_user_id,btrim(p_academy_name),lower(btrim(p_email)),p_modality,p_plan_id)
    ON CONFLICT(email) DO NOTHING;
  SELECT * INTO request FROM public.casca_internal_academy_requests WHERE email=lower(btrim(p_email)) FOR UPDATE;
  IF request.actor_user_id<>p_actor_user_id OR request.academy_name<>btrim(p_academy_name) OR request.modality<>p_modality OR request.plan_id<>p_plan_id THEN
    RAISE EXCEPTION 'internal_request_conflict';
  END IF;
  RETURN to_jsonb(request);
END;
$$;

-- Cadastro: so planos oferecidos. Intencoes antigas com plano legado continuam provisionando.
CREATE OR REPLACE FUNCTION public.record_academy_registration (
  user_id uuid, academy_name text, display_name text, modality text, subscription_plan_id text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.casca_plan_is_offered(subscription_plan_id) THEN
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

COMMIT;

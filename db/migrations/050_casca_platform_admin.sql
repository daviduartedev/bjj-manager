-- Administracao comercial Casca. Preparada para aplicacao posterior; sem alterar alunos.
BEGIN;

CREATE TABLE public.casca_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('commercial','exempt','internal_test','create_internal')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 5 AND 500),
  previous_kind text,
  previous_plan_id text,
  new_kind text NOT NULL,
  new_plan_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_casca_admin_audit_account_created ON public.casca_admin_audit(account_id,created_at DESC);

CREATE TABLE public.casca_internal_academy_requests (
  id uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  academy_name text NOT NULL CHECK (char_length(academy_name) BETWEEN 2 AND 80),
  email text NOT NULL UNIQUE,
  modality text NOT NULL CHECK (modality IN ('jiu_jitsu','boxing','judo','muay_thai')),
  plan_id text NOT NULL CHECK (plan_id IN ('essencial','academia','evolucao')),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  account_id uuid UNIQUE REFERENCES public.accounts(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.casca_admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casca_internal_academy_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.casca_admin_audit,public.casca_internal_academy_requests FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.casca_admin_audit,public.casca_internal_academy_requests TO service_role;

CREATE FUNCTION public.casca_admin_overview(p_page integer DEFAULT 1) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE academies jsonb; history jsonb; counts jsonb; paid_counts jsonb; total bigint;
BEGIN
  IF p_page<1 OR p_page>10000 THEN RAISE EXCEPTION 'invalid_page'; END IF;
  SELECT count(*) INTO total FROM public.accounts;
  SELECT coalesce(jsonb_agg(row_data ORDER BY created_at DESC),'[]'::jsonb) INTO academies FROM (
    SELECT a.created_at,jsonb_build_object(
      'account_id',a.id,'academy_name',a.name,'kind',coalesce(s.kind,'commercial'),
      'status',coalesce(s.status,'pending'),'plan_id',coalesce(s.plan_id,'essencial'),
      'active_students',(SELECT count(*) FROM public.students st WHERE st.account_id=a.id AND st.status::text='active' AND st.archived_at IS NULL AND st.removed_at IS NULL),
      'trial_ends_at',s.trial_ends_at,'paid_until',s.paid_until
    ) AS row_data
    FROM public.accounts a LEFT JOIN public.casca_subscriptions s ON s.account_id=a.id
    ORDER BY a.created_at DESC LIMIT 50 OFFSET ((p_page-1)*50)
  ) rows;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id',h.id,'account_id',h.account_id,'academy_name',a.name,'action',h.action,'reason',h.reason,'created_at',h.created_at
  ) ORDER BY h.created_at DESC),'[]'::jsonb) INTO history FROM (
    SELECT * FROM public.casca_admin_audit ORDER BY created_at DESC LIMIT 20
  ) h JOIN public.accounts a ON a.id=h.account_id;
  SELECT jsonb_build_object(
    'commercial',count(*) FILTER (WHERE kind='commercial'),
    'trialing',count(*) FILTER (WHERE kind='commercial' AND status='trialing' AND trial_ends_at>now()),
    'internal_test',count(*) FILTER (WHERE kind='internal_test'),
    'exempt',count(*) FILTER (WHERE kind='exempt'),
    'cancelled',count(*) FILTER (WHERE kind='commercial' AND status='cancelled'),
    'new_paid',count(*) FILTER (WHERE kind='commercial' AND (
      SELECT min(p.paid_at) FROM public.casca_subscription_payments p WHERE p.account_id=casca_subscriptions.account_id
    ) >= (date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'))
  ) INTO counts FROM public.casca_subscriptions;
  SELECT coalesce(jsonb_agg(jsonb_build_object('plan_id',plan_id,'count',quantity)),'[]'::jsonb) INTO paid_counts FROM (
    SELECT plan_id,count(*) AS quantity FROM public.casca_subscriptions
    WHERE kind='commercial' AND status='active' AND paid_until>now() GROUP BY plan_id
  ) paid;
  RETURN jsonb_build_object('academies',academies,'history',history,'counts',counts,'paid_plan_counts',paid_counts,'total',total);
END;
$$;

CREATE FUNCTION public.casca_admin_change_kind(
  p_account_id uuid,p_actor_user_id uuid,p_kind text,p_plan_id text,p_reason text,p_expected_version integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_kind NOT IN ('commercial','internal_test','exempt') OR p_plan_id NOT IN ('essencial','academia','evolucao')
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

CREATE FUNCTION public.casca_admin_reserve_internal(
  p_id uuid,p_actor_user_id uuid,p_academy_name text,p_email text,p_modality text,p_plan_id text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE request public.casca_internal_academy_requests%ROWTYPE;
BEGIN
  IF p_id IS NULL OR p_actor_user_id IS NULL OR char_length(btrim(p_academy_name)) NOT BETWEEN 2 AND 80
    OR p_modality NOT IN ('jiu_jitsu','boxing','judo','muay_thai') OR p_plan_id NOT IN ('essencial','academia','evolucao')
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

CREATE FUNCTION public.casca_admin_find_internal_auth_user(p_email text,p_request_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT jsonb_build_object('id',u.id,'owned',u.raw_app_meta_data->>'casca_internal_request'=p_request_id::text)
  FROM auth.users u WHERE lower(u.email)=lower(btrim(p_email)) LIMIT 1;
$$;

CREATE FUNCTION public.casca_admin_link_internal_user(p_request_id uuid,p_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id=p_user_id AND u.raw_app_meta_data->>'casca_internal_request'=p_request_id::text) THEN
    RAISE EXCEPTION 'internal_auth_user_not_owned';
  END IF;
  UPDATE public.casca_internal_academy_requests SET user_id=p_user_id
    WHERE id=p_request_id AND (user_id IS NULL OR user_id=p_user_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'internal_request_conflict'; END IF;
END;
$$;

CREATE FUNCTION public.casca_admin_complete_internal(p_request_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE request public.casca_internal_academy_requests%ROWTYPE; created_account uuid;
BEGIN
  SELECT * INTO request FROM public.casca_internal_academy_requests WHERE id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'internal_request_missing'; END IF;
  IF request.account_id IS NOT NULL THEN RETURN request.account_id; END IF;
  IF request.user_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id=request.user_id AND u.raw_app_meta_data->>'casca_internal_request'=request.id::text
      AND u.email_confirmed_at IS NOT NULL
  ) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=request.user_id)
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.user_id=request.user_id) THEN RAISE EXCEPTION 'internal_user_ineligible'; END IF;
  INSERT INTO public.accounts(name,modality,slug)
    VALUES(request.academy_name,request.modality,public.allocate_academy_slug(request.academy_name)) RETURNING id INTO created_account;
  UPDATE public.casca_subscriptions SET kind='internal_test',status='active',plan_id=request.plan_id,trial_used=true,version=version+1,updated_at=now()
    WHERE account_id=created_account;
  INSERT INTO public.profiles(user_id,account_id,display_name,role)
    VALUES(request.user_id,created_account,'Responsável de teste','professor'::public.profile_role);
  INSERT INTO public.plans(account_id,kind,name,price_cents,active) VALUES
    (created_account,'kids_1'::public.plan_kind,'Kids 1',10000,true),
    (created_account,'kids_2'::public.plan_kind,'Kids 2',10000,true),
    (created_account,'adult'::public.plan_kind,'Adulto',12000,true),
    (created_account,'baby'::public.plan_kind,'Baby',10000,true);
  UPDATE public.casca_internal_academy_requests SET account_id=created_account WHERE id=request.id;
  INSERT INTO public.casca_admin_audit(account_id,actor_user_id,action,reason,new_kind,new_plan_id)
    VALUES(created_account,request.actor_user_id,'create_internal','Academia interna de teste','internal_test',request.plan_id);
  RETURN created_account;
END;
$$;

REVOKE ALL ON FUNCTION public.casca_admin_overview(integer),public.casca_admin_change_kind(uuid,uuid,text,text,text,integer),
  public.casca_admin_reserve_internal(uuid,uuid,text,text,text,text),public.casca_admin_find_internal_auth_user(text,uuid),
  public.casca_admin_link_internal_user(uuid,uuid),public.casca_admin_complete_internal(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.casca_admin_overview(integer),public.casca_admin_change_kind(uuid,uuid,text,text,text,integer),
  public.casca_admin_reserve_internal(uuid,uuid,text,text,text,text),public.casca_admin_find_internal_auth_user(text,uuid),
  public.casca_admin_link_internal_user(uuid,uuid),public.casca_admin_complete_internal(uuid) TO service_role;

COMMIT;

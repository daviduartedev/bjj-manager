-- Preparada para aplicação controlada. Não ativa cobrança nem isenta contas existentes.
BEGIN;

CREATE TABLE public.casca_billing_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  enforcement_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.casca_billing_settings (id) VALUES (true);

CREATE TABLE public.casca_subscriptions (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'commercial' CHECK (kind IN ('commercial','internal_test','exempt')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','trialing','active','past_due','cancelled')),
  plan_id text NOT NULL DEFAULT 'essencial' CHECK (plan_id IN ('essencial','academia','evolucao')),
  provider_customer_id text,
  provider_checkout_id text UNIQUE,
  provider_checkout_url text,
  provider_subscription_id text UNIQUE,
  trial_used boolean NOT NULL DEFAULT false,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  paid_until timestamptz,
  pending_plan_id text CHECK (pending_plan_id IN ('essencial','academia','evolucao')),
  pending_plan_at timestamptz,
  last_event_at timestamptz,
  version integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((pending_plan_id IS NULL) = (pending_plan_at IS NULL))
);

CREATE TABLE public.casca_subscription_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('checkout','upgrade','downgrade','cancel')),
  plan_id text NOT NULL CHECK (plan_id IN ('essencial','academia','evolucao')),
  status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating','ready','paid','completed','failed')),
  amount_cents integer CHECK (amount_cents >= 0),
  provider_checkout_id text UNIQUE,
  provider_checkout_url text,
  provider_update_id text,
  period_start timestamptz,
  period_end timestamptz,
  subscription_version integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_casca_subscription_operations_open ON public.casca_subscription_operations(account_id)
  WHERE status IN ('creating','ready','paid');

CREATE TABLE public.casca_subscription_events (
  event_id text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  occurred_at timestamptz NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('applied','stale')),
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.casca_subscription_payments (
  provider_payment_id text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  provider_checkout_id text NOT NULL,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','refunded','disputed','lost')),
  paid_at timestamptz NOT NULL,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_casca_subscription_payments_account_paid ON public.casca_subscription_payments(account_id,paid_at DESC);
CREATE INDEX idx_casca_subscription_payments_checkout ON public.casca_subscription_payments(provider_checkout_id);

CREATE TABLE public.casca_subscription_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','cancelled')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  provider_email_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_casca_subscription_notifications_pending ON public.casca_subscription_notifications(next_attempt_at)
  WHERE status IN ('pending','failed');

ALTER TABLE public.casca_billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casca_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casca_subscription_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casca_subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casca_subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casca_subscription_notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.casca_billing_settings, public.casca_subscriptions, public.casca_subscription_operations,
  public.casca_subscription_events, public.casca_subscription_payments, public.casca_subscription_notifications FROM anon, authenticated;
GRANT SELECT ON public.casca_billing_settings, public.casca_subscriptions TO authenticated;
GRANT ALL ON public.casca_billing_settings, public.casca_subscriptions, public.casca_subscription_operations,
  public.casca_subscription_events, public.casca_subscription_payments, public.casca_subscription_notifications TO service_role;

CREATE POLICY casca_billing_settings_read ON public.casca_billing_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY casca_subscription_account_read ON public.casca_subscriptions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.uid() AND p.account_id=casca_subscriptions.account_id)
);

CREATE FUNCTION public.casca_initialize_subscription() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.casca_subscriptions(account_id) VALUES(NEW.id) ON CONFLICT(account_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.casca_initialize_subscription() FROM PUBLIC;
CREATE TRIGGER casca_initialize_subscription AFTER INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.casca_initialize_subscription();

-- Registros comerciais pendentes preservam estado desconhecido; não concedem isenção.
INSERT INTO public.casca_subscriptions(account_id)
  SELECT id FROM public.accounts ON CONFLICT(account_id) DO NOTHING;

CREATE FUNCTION public.casca_reserve_checkout(p_account_id uuid,p_plan_id text,p_expected_version integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_operation public.casca_subscription_operations%ROWTYPE; current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_plan_id NOT IN ('essencial','academia','evolucao') THEN RAISE EXCEPTION 'invalid_plan'; END IF;
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

CREATE FUNCTION public.casca_complete_checkout(p_operation_id uuid,p_customer_id text,p_checkout_id text,p_checkout_url text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_operation public.casca_subscription_operations%ROWTYPE; current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO current_operation FROM public.casca_subscription_operations WHERE id=p_operation_id;
  IF NOT FOUND OR current_operation.kind<>'checkout' THEN RAISE EXCEPTION 'operation_missing'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=current_operation.account_id FOR UPDATE;
  IF current_subscription.kind<>'commercial' OR current_subscription.paid_until>now() THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  SELECT * INTO current_operation FROM public.casca_subscription_operations WHERE id=p_operation_id FOR UPDATE;
  IF current_operation.status<>'creating' THEN
    IF current_operation.provider_checkout_id=p_checkout_id THEN RETURN; END IF;
    RAISE EXCEPTION 'operation_changed';
  END IF;
  IF current_subscription.version<>current_operation.subscription_version THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  IF current_operation.provider_checkout_id IS NOT NULL AND current_operation.provider_checkout_id<>p_checkout_id THEN RAISE EXCEPTION 'checkout_conflict'; END IF;
  UPDATE public.casca_subscription_operations SET provider_checkout_id=p_checkout_id,provider_checkout_url=p_checkout_url,status='ready',updated_at=now() WHERE id=p_operation_id;
  UPDATE public.casca_subscriptions SET provider_customer_id=p_customer_id,provider_checkout_id=p_checkout_id,
    provider_subscription_id=NULL,status='pending',trial_ends_at=NULL,current_period_start=NULL,paid_until=NULL,pending_plan_id=NULL,pending_plan_at=NULL,
    provider_checkout_url=p_checkout_url,updated_at=now(),version=version+1 WHERE account_id=current_operation.account_id;
END;
$$;

CREATE FUNCTION public.casca_apply_subscription_event(p_change jsonb) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE; inserted_count integer; event_time timestamptz;
BEGIN
  event_time:=(p_change->>'occurredAt')::timestamptz;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=(p_change->>'accountId')::uuid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'subscription_missing'; END IF;
  INSERT INTO public.casca_subscription_events(event_id,account_id,event_name,occurred_at,outcome)
    VALUES(p_change->>'eventId',current_subscription.account_id,p_change->>'eventName',event_time,'applied') ON CONFLICT(event_id) DO NOTHING;
  GET DIAGNOSTICS inserted_count=ROW_COUNT;
  IF inserted_count=0 THEN RETURN 'duplicate'; END IF;
  IF p_change->>'paymentId' IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.casca_subscription_payments WHERE provider_payment_id=p_change->>'paymentId' AND status<>'paid'
  ) THEN
    UPDATE public.casca_subscription_events SET outcome='stale' WHERE event_id=p_change->>'eventId';
    RETURN 'stale';
  END IF;
  IF current_subscription.kind<>'commercial' OR (current_subscription.last_event_at>event_time AND NOT COALESCE((p_change->>'revokeAccess')::boolean,false)
    AND NOT (p_change->>'paymentId' IS NOT NULL AND (p_change->>'paidUntil')::timestamptz>COALESCE(current_subscription.paid_until,'-infinity'::timestamptz))) THEN
    UPDATE public.casca_subscription_events SET outcome='stale' WHERE event_id=p_change->>'eventId';
    RETURN 'stale';
  END IF;
  UPDATE public.casca_subscriptions SET
    status=CASE WHEN current_subscription.status='cancelled' AND current_subscription.last_event_at>event_time THEN 'cancelled' ELSE p_change->>'status' END,plan_id=p_change->>'planId',
    provider_subscription_id=p_change->>'providerSubscriptionId',
    provider_customer_id=p_change->>'providerCustomerId',
    trial_used=trial_used OR p_change->>'status' IN ('trialing','active'),
    trial_ends_at=(p_change->>'trialEndsAt')::timestamptz,
    current_period_start=GREATEST((p_change->>'currentPeriodStart')::timestamptz,current_period_start),
    paid_until=CASE WHEN COALESCE((p_change->>'revokeAccess')::boolean,false) THEN NULL ELSE GREATEST((p_change->>'paidUntil')::timestamptz,paid_until) END,
    pending_plan_id=CASE WHEN p_change->>'status'='active' AND pending_plan_id=p_change->>'planId' THEN NULL ELSE pending_plan_id END,
    pending_plan_at=CASE WHEN p_change->>'status'='active' AND pending_plan_id=p_change->>'planId' THEN NULL ELSE pending_plan_at END,
    last_event_at=GREATEST(event_time,last_event_at),version=version+1,updated_at=now()
    WHERE account_id=current_subscription.account_id;
  UPDATE public.casca_subscription_operations SET status='completed',updated_at=now()
    WHERE account_id=current_subscription.account_id AND kind='checkout' AND provider_checkout_id=current_subscription.provider_checkout_id AND status='ready';
  IF p_change->>'paymentId' IS NOT NULL AND (p_change->>'paymentAmount')::integer>0 THEN
    INSERT INTO public.casca_subscription_payments(provider_payment_id,account_id,amount_cents,provider_checkout_id,paid_at,receipt_url)
      VALUES(p_change->>'paymentId',current_subscription.account_id,(p_change->>'paymentAmount')::integer,p_change->>'providerCheckoutId',event_time,p_change->>'receiptUrl')
      ON CONFLICT(provider_payment_id) DO NOTHING;
  END IF;
  IF COALESCE((p_change->>'revokeAccess')::boolean,false) THEN
    UPDATE public.casca_subscription_payments SET status=split_part(p_change->>'eventName','.',2)
      WHERE account_id=current_subscription.account_id AND provider_checkout_id=p_change->>'providerCheckoutId';
  END IF;
  INSERT INTO public.casca_subscription_notifications(event_id,account_id,kind,payload)
    VALUES(p_change->>'eventId',current_subscription.account_id,p_change->>'eventName',jsonb_build_object(
      'planId',p_change->>'planId','trialEndsAt',p_change->>'trialEndsAt','paidUntil',p_change->>'paidUntil',
      'amountCents',(p_change->>'paymentAmount')::integer,'receiptUrl',p_change->>'receiptUrl'))
      ON CONFLICT(event_id) DO NOTHING;
  RETURN 'applied';
END;
$$;

CREATE FUNCTION public.casca_reserve_operation(p_account_id uuid,p_kind text,p_plan_id text,p_amount_cents integer,p_expected_version integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_operation public.casca_subscription_operations%ROWTYPE; current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_kind NOT IN ('upgrade','downgrade','cancel') OR p_plan_id NOT IN ('essencial','academia','evolucao') THEN RAISE EXCEPTION 'invalid_plan'; END IF;
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

CREATE FUNCTION public.casca_complete_operation(p_operation_id uuid,p_checkout_id text,p_checkout_url text,p_provider_update_id text,p_status text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_operation public.casca_subscription_operations%ROWTYPE;
BEGIN
  IF p_status NOT IN ('ready','paid','completed') THEN RAISE EXCEPTION 'operation_changed'; END IF;
  SELECT * INTO current_operation FROM public.casca_subscription_operations WHERE id=p_operation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'operation_missing'; END IF;
  IF current_operation.status='completed' AND coalesce(current_operation.provider_update_id,'')=coalesce(p_provider_update_id,'') THEN RETURN; END IF;
  IF current_operation.status='paid' AND p_status='paid' THEN RETURN; END IF;
  UPDATE public.casca_subscription_operations SET
    provider_checkout_id=coalesce(p_checkout_id,provider_checkout_id),
    provider_checkout_url=coalesce(p_checkout_url,provider_checkout_url),
    provider_update_id=coalesce(p_provider_update_id,provider_update_id),
    status=p_status,updated_at=now()
    WHERE id=p_operation_id;
END;
$$;

CREATE FUNCTION public.casca_apply_upgrade(p_change jsonb) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE; inserted_count integer;
BEGIN
  INSERT INTO public.casca_subscription_payments(provider_payment_id,account_id,amount_cents,provider_checkout_id,paid_at,receipt_url)
    VALUES(p_change->>'paymentId',(p_change->>'accountId')::uuid,(p_change->>'amountCents')::integer,p_change->>'checkoutId',(p_change->>'occurredAt')::timestamptz,p_change->>'receiptUrl')
    ON CONFLICT(provider_payment_id) DO NOTHING;
  GET DIAGNOSTICS inserted_count=ROW_COUNT;
  IF inserted_count=0 THEN RETURN 'duplicate'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=(p_change->>'accountId')::uuid FOR UPDATE;
  IF NOT FOUND OR current_subscription.kind<>'commercial' THEN RAISE EXCEPTION 'subscription_missing'; END IF;
  UPDATE public.casca_subscriptions SET plan_id=p_change->>'planId',pending_plan_id=NULL,pending_plan_at=NULL,
    updated_at=now(),version=version+1 WHERE account_id=current_subscription.account_id;
  UPDATE public.casca_subscription_operations SET status='paid',updated_at=now()
    WHERE account_id=current_subscription.account_id AND kind='upgrade' AND provider_checkout_id=p_change->>'checkoutId' AND status IN ('creating','ready');
  INSERT INTO public.casca_subscription_notifications(event_id,account_id,kind,payload)
    VALUES('upgrade:'||(p_change->>'paymentId'),current_subscription.account_id,'subscription.plan_changed',jsonb_build_object(
      'planId',p_change->>'planId','amountCents',(p_change->>'amountCents')::integer,'paidUntil',current_subscription.paid_until))
    ON CONFLICT(event_id) DO NOTHING;
  RETURN 'applied';
END;
$$;

CREATE FUNCTION public.casca_schedule_plan_change(p_account_id uuid,p_plan_id text,p_at timestamptz,p_expected_version integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_plan_id NOT IN ('essencial','academia','evolucao') THEN RAISE EXCEPTION 'invalid_plan'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND OR current_subscription.kind<>'commercial' OR current_subscription.version<>p_expected_version THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  UPDATE public.casca_subscriptions SET pending_plan_id=p_plan_id,pending_plan_at=p_at,updated_at=now(),version=version+1 WHERE account_id=p_account_id;
END;
$$;

CREATE FUNCTION public.casca_apply_immediate_plan(p_account_id uuid,p_plan_id text,p_expected_version integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  IF p_plan_id NOT IN ('essencial','academia','evolucao') THEN RAISE EXCEPTION 'invalid_plan'; END IF;
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND OR current_subscription.kind<>'commercial' OR current_subscription.version<>p_expected_version THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  UPDATE public.casca_subscriptions SET plan_id=p_plan_id,pending_plan_id=NULL,pending_plan_at=NULL,updated_at=now(),version=version+1 WHERE account_id=p_account_id;
END;
$$;

CREATE FUNCTION public.casca_cancel_renewal(p_account_id uuid,p_expected_version integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_subscription public.casca_subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO current_subscription FROM public.casca_subscriptions WHERE account_id=p_account_id FOR UPDATE;
  IF NOT FOUND OR current_subscription.kind<>'commercial' THEN RAISE EXCEPTION 'subscription_missing'; END IF;
  IF current_subscription.status='cancelled' THEN RETURN; END IF;
  IF current_subscription.status NOT IN ('active','trialing') THEN RAISE EXCEPTION 'subscription_changed'; END IF;
  UPDATE public.casca_subscriptions SET status='cancelled',pending_plan_id=NULL,pending_plan_at=NULL,updated_at=now(),version=version+1 WHERE account_id=p_account_id;
END;
$$;

REVOKE ALL ON FUNCTION public.casca_reserve_checkout(uuid,text,integer), public.casca_complete_checkout(uuid,text,text,text),
  public.casca_apply_subscription_event(jsonb), public.casca_reserve_operation(uuid,text,text,integer,integer),
  public.casca_complete_operation(uuid,text,text,text,text), public.casca_apply_upgrade(jsonb),
  public.casca_schedule_plan_change(uuid,text,timestamptz,integer), public.casca_apply_immediate_plan(uuid,text,integer),
  public.casca_cancel_renewal(uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.casca_reserve_checkout(uuid,text,integer), public.casca_complete_checkout(uuid,text,text,text),
  public.casca_apply_subscription_event(jsonb), public.casca_reserve_operation(uuid,text,text,integer,integer),
  public.casca_complete_operation(uuid,text,text,text,text), public.casca_apply_upgrade(jsonb),
  public.casca_schedule_plan_change(uuid,text,timestamptz,integer), public.casca_apply_immediate_plan(uuid,text,integer),
  public.casca_cancel_renewal(uuid,integer) TO service_role;

NOTIFY pgrst,'reload schema';
COMMIT;

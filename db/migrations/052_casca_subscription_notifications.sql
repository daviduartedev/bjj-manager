-- Caixa de saida comercial, lembrete de trial e reexecucao segura. Sem envio real nesta migration.
BEGIN;

ALTER TABLE public.casca_subscription_notifications
  ADD COLUMN IF NOT EXISTS first_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_json jsonb,
  ADD COLUMN IF NOT EXISTS claim_token uuid,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS manual_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE FUNCTION public.casca_enqueue_trial_reminder() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE trial_at timestamptz;
BEGIN
  IF NEW.kind <> 'subscription.trial_started' THEN RETURN NEW; END IF;
  trial_at := nullif(NEW.payload->>'trialEndsAt','')::timestamptz;
  IF trial_at IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.casca_subscription_notifications(event_id,account_id,kind,payload,next_attempt_at)
    VALUES(NEW.event_id || ':trial_reminder', NEW.account_id, 'trial_reminder', NEW.payload, GREATEST(now(), trial_at - interval '24 hours'))
    ON CONFLICT(event_id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS casca_enqueue_trial_reminder ON public.casca_subscription_notifications;
CREATE TRIGGER casca_enqueue_trial_reminder AFTER INSERT ON public.casca_subscription_notifications
  FOR EACH ROW EXECUTE FUNCTION public.casca_enqueue_trial_reminder();

CREATE FUNCTION public.casca_claim_notifications(p_limit integer, p_now timestamptz) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE claimed uuid[] := ARRAY[]::uuid[];
DECLARE token uuid := gen_random_uuid();
DECLARE result jsonb;
BEGIN
  IF p_limit < 1 OR p_limit > 25 THEN RAISE EXCEPTION 'invalid_limit'; END IF;
  WITH picked AS (
    SELECT id FROM public.casca_subscription_notifications
    WHERE status IN ('pending','failed') AND manual_review=false AND next_attempt_at<=p_now
    ORDER BY next_attempt_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  ), updated AS (
    UPDATE public.casca_subscription_notifications n SET
      attempts=n.attempts+1, claim_token=token, status='pending', updated_at=now()
    FROM picked WHERE n.id=picked.id
    RETURNING n.id
  )
  SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO claimed FROM updated;
  SELECT coalesce(jsonb_agg(to_jsonb(n) ORDER BY n.next_attempt_at), '[]'::jsonb) INTO result
    FROM public.casca_subscription_notifications n WHERE n.id=ANY(claimed);
  RETURN result;
END;
$$;

CREATE FUNCTION public.casca_prepare_notification(p_id uuid, p_token uuid, p_message jsonb, p_now timestamptz) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_row public.casca_subscription_notifications%ROWTYPE;
BEGIN
  SELECT * INTO current_row FROM public.casca_subscription_notifications WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR current_row.claim_token IS DISTINCT FROM p_token THEN RAISE EXCEPTION 'notification_changed'; END IF;
  UPDATE public.casca_subscription_notifications SET
    delivery_json=coalesce(delivery_json, p_message),
    first_attempt_at=coalesce(first_attempt_at, p_now),
    updated_at=p_now
    WHERE id=p_id
    RETURNING * INTO current_row;
  RETURN to_jsonb(current_row);
END;
$$;

CREATE FUNCTION public.casca_finish_notification(p_id uuid, p_token uuid, p_status text, p_provider_id text, p_error text, p_retry_at timestamptz, p_manual boolean, p_now timestamptz) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_row public.casca_subscription_notifications%ROWTYPE;
BEGIN
  IF p_status NOT IN ('sent','failed','cancelled') THEN RAISE EXCEPTION 'invalid_status'; END IF;
  SELECT * INTO current_row FROM public.casca_subscription_notifications WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'notification_missing'; END IF;
  IF p_status<>'cancelled' AND current_row.claim_token IS DISTINCT FROM p_token THEN RAISE EXCEPTION 'notification_changed'; END IF;
  UPDATE public.casca_subscription_notifications SET
    status=p_status,
    provider_email_id=coalesce(p_provider_id, provider_email_id),
    last_error=p_error,
    next_attempt_at=coalesce(p_retry_at, next_attempt_at),
    manual_review=p_manual,
    sent_at=CASE WHEN p_status='sent' THEN p_now ELSE sent_at END,
    updated_at=p_now
    WHERE id=p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.casca_enqueue_trial_reminder(), public.casca_claim_notifications(integer,timestamptz),
  public.casca_prepare_notification(uuid,uuid,jsonb,timestamptz), public.casca_finish_notification(uuid,uuid,text,text,text,timestamptz,boolean,timestamptz)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.casca_claim_notifications(integer,timestamptz),
  public.casca_prepare_notification(uuid,uuid,jsonb,timestamptz), public.casca_finish_notification(uuid,uuid,text,text,text,timestamptz,boolean,timestamptz)
  TO service_role;

NOTIFY pgrst,'reload schema';
COMMIT;

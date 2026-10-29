-- #82: acesso de escrita e capacidade da assinatura SaaS. Preparada; nao aplicar automaticamente.
-- SELECT/RLS existentes permanecem intactos. A ativacao usa o singleton criado pela 048.
BEGIN;

CREATE OR REPLACE FUNCTION public.casca_billing_enforced() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE((SELECT s.enforcement_enabled FROM public.casca_billing_settings s WHERE s.id), true);
$$;
REVOKE ALL ON FUNCTION public.casca_billing_enforced() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.casca_account_can_write(p_account uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT NOT public.casca_billing_enforced() OR EXISTS (
    SELECT 1 FROM public.casca_subscriptions s WHERE s.account_id = p_account AND (
      s.kind IN ('internal_test', 'exempt')
      OR (s.status = 'trialing' AND s.trial_ends_at > pg_catalog.statement_timestamp())
      OR (s.status IN ('active', 'past_due', 'cancelled') AND s.paid_until > pg_catalog.statement_timestamp())
    )
  );
$$;
REVOKE ALL ON FUNCTION public.casca_account_can_write(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.casca_active_student_limit(p_account uuid) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE WHEN NOT public.casca_billing_enforced() THEN NULL ELSE (
    SELECT LEAST(
      CASE s.plan_id WHEN 'essencial' THEN 50 WHEN 'academia' THEN 150 WHEN 'evolucao' THEN 300 ELSE 0 END,
      CASE s.pending_plan_id WHEN 'essencial' THEN 50 WHEN 'academia' THEN 150 WHEN 'evolucao' THEN 300 ELSE 2147483647 END
    ) FROM public.casca_subscriptions s WHERE s.account_id = p_account
  ) END;
$$;
REVOKE ALL ON FUNCTION public.casca_active_student_limit(uuid) FROM PUBLIC, anon, authenticated;

-- Resolve tambem tabelas cujo tenant vive no pai. Nao aceita tenant fornecido pela UI.
CREATE OR REPLACE FUNCTION public.casca_row_account(p_table text, p_row jsonb) RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_account uuid;
BEGIN
  IF p_table = 'accounts' THEN RETURN (p_row->>'id')::uuid; END IF;
  IF p_row ? 'account_id' THEN RETURN (p_row->>'account_id')::uuid; END IF;
  IF p_table IN ('student_graduations', 'student_plans', 'payments', 'student_rank_promotions') THEN
    SELECT s.account_id INTO v_account FROM public.students s WHERE s.id = (p_row->>'student_id')::uuid;
  ELSIF p_table IN ('product_variants', 'product_photos') THEN
    SELECT p.account_id INTO v_account FROM public.products p WHERE p.id = (p_row->>'product_id')::uuid;
  ELSIF p_table IN ('lesson_plan_revisions', 'lesson_plan_attachments') THEN
    SELECT p.account_id INTO v_account FROM public.lesson_plans p WHERE p.id = (p_row->>'lesson_plan_id')::uuid;
  ELSIF p_table = 'generated_document_deliveries' THEN
    SELECT d.account_id INTO v_account FROM public.generated_documents d WHERE d.id = (p_row->>'document_id')::uuid;
  END IF;
  RETURN v_account;
END;
$$;
REVOKE ALL ON FUNCTION public.casca_row_account(text, jsonb) FROM PUBLIC, anon, authenticated;

-- Somente bootstrap atomico: academia criada nesta transacao e intencao confiavel ainda nao consumida.
-- Isso permite o perfil e os quatro planos iniciais antes da contratacao; nao concede operacao comercial.
CREATE OR REPLACE FUNCTION public.casca_is_registration_bootstrap(p_table text, p_row jsonb, p_account uuid) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR p_table NOT IN ('profiles', 'plans') THEN RETURN false; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.academy_registration_intents i JOIN public.accounts a ON a.id = p_account
    WHERE i.user_id = auth.uid() AND i.consumed_at IS NULL AND i.account_id IS NULL
      AND a.created_at = pg_catalog.transaction_timestamp() AND a.name = i.academy_name AND a.modality = i.modality
  ) THEN RETURN false; END IF;
  IF p_table = 'profiles' THEN
    RETURN p_row->>'user_id' = auth.uid()::text AND p_row->>'role' = 'professor';
  END IF;
  RETURN p_row->>'kind' IN ('baby', 'kids_1', 'kids_2', 'adult')
    AND (p_row->>'price_cents')::bigint = CASE WHEN p_row->>'kind' = 'adult' THEN 12000 ELSE 10000 END
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.account_id = p_account AND p.role::text = 'professor');
END;
$$;
REVOKE ALL ON FUNCTION public.casca_is_registration_bootstrap(text, jsonb, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.casca_guard_operational_write() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_account uuid; v_old_account uuid; v_row jsonb;
BEGIN
  IF NOT public.casca_billing_enforced() THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  v_row := CASE WHEN TG_OP = 'DELETE' THEN pg_catalog.to_jsonb(OLD) ELSE pg_catalog.to_jsonb(NEW) END;
  v_account := public.casca_row_account(TG_TABLE_NAME, v_row);
  -- Modelos globais nao pertencem a uma academia; continuam protegidos pelos grants/RLS existentes.
  IF TG_TABLE_NAME = 'document_templates' AND v_account IS NULL THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  -- Em cascata, o pai ja foi autorizado e pode nao estar mais visivel nesta transacao.
  IF TG_OP = 'DELETE' AND v_account IS NULL AND pg_catalog.pg_trigger_depth() > 1 THEN RETURN OLD; END IF;
  IF TG_OP = 'INSERT' AND public.casca_is_registration_bootstrap(TG_TABLE_NAME, v_row, v_account) THEN RETURN NEW; END IF;
  IF v_account IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('casca-capacity:' || v_account::text, 0));
  END IF;
  IF v_account IS NULL OR NOT public.casca_account_can_write(v_account) THEN
    RAISE EXCEPTION 'casca_subscription_read_only' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    v_old_account := public.casca_row_account(TG_TABLE_NAME, pg_catalog.to_jsonb(OLD));
    IF v_old_account IS DISTINCT FROM v_account AND NOT public.casca_account_can_write(v_old_account) THEN
      RAISE EXCEPTION 'casca_subscription_read_only' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.casca_guard_operational_write() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'profiles', 'students', 'student_graduations', 'plans', 'student_plans', 'payments',
    'products', 'product_variants', 'product_photos', 'reservations', 'product_ledger_notes',
    'product_ledger_installments', 'document_templates', 'generated_documents',
    'generated_document_deliveries', 'document_sequences', 'lesson_plans',
    'lesson_plan_revisions', 'lesson_plan_attachments', 'classes', 'class_recurring_schedules',
    'class_sessions', 'student_class_enrollments', 'check_ins', 'attendances', 'student_rank_promotions'
  ] LOOP
    EXECUTE pg_catalog.format('DROP TRIGGER IF EXISTS casca_00_write_guard ON public.%I', v_table);
    EXECUTE pg_catalog.format('CREATE TRIGGER casca_00_write_guard BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.casca_guard_operational_write()', v_table);
  END LOOP;
END;
$$;
-- INSERT de accounts e reservado a provisao/admin existentes; uma assinatura pending nasce pelo trigger 048.
DROP TRIGGER IF EXISTS casca_00_write_guard ON public.accounts;
CREATE TRIGGER casca_00_write_guard BEFORE UPDATE OR DELETE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.casca_guard_operational_write();

CREATE OR REPLACE FUNCTION public.casca_guard_student_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_old_counted boolean := false; v_new_counted boolean := false; v_count bigint; v_limit integer;
BEGIN
  IF NOT public.casca_billing_enforced() THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  -- Compartilhada com trocas de plano: a contagem nao pode correr em paralelo com um downgrade.
  IF TG_OP = 'UPDATE' AND OLD.account_id IS DISTINCT FROM NEW.account_id THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('casca-capacity:' || LEAST(OLD.account_id::text, NEW.account_id::text), 0));
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('casca-capacity:' || GREATEST(OLD.account_id::text, NEW.account_id::text), 0));
  ELSE
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('casca-capacity:' || CASE WHEN TG_OP = 'DELETE' THEN OLD.account_id::text ELSE NEW.account_id::text END, 0));
  END IF;
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old_counted := OLD.status::text = 'active' AND OLD.archived_at IS NULL AND OLD.removed_at IS NULL;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_new_counted := NEW.status::text = 'active' AND NEW.archived_at IS NULL AND NEW.removed_at IS NULL;
  END IF;
  IF v_new_counted AND (NOT v_old_counted OR (TG_OP = 'UPDATE' AND OLD.account_id IS DISTINCT FROM NEW.account_id)) THEN
    v_limit := public.casca_active_student_limit(NEW.account_id);
    IF v_limit IS NULL THEN RAISE EXCEPTION 'casca_subscription_read_only' USING ERRCODE = '42501'; END IF;
    SELECT pg_catalog.count(*) INTO v_count FROM public.students s
    WHERE s.account_id = NEW.account_id AND s.status::text = 'active' AND s.archived_at IS NULL AND s.removed_at IS NULL;
    IF v_count >= v_limit THEN RAISE EXCEPTION 'casca_subscription_capacity' USING ERRCODE = '23514'; END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.casca_guard_student_capacity() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS casca_10_capacity_guard ON public.students;
CREATE TRIGGER casca_10_capacity_guard BEFORE INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.casca_guard_student_capacity();

CREATE OR REPLACE FUNCTION public.casca_guard_plan_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_limit integer; v_old_limit integer; v_count bigint;
BEGIN
  IF NOT public.casca_billing_enforced() THEN RETURN NEW; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('casca-capacity:' || NEW.account_id::text, 0));
  v_old_limit := LEAST(
    CASE OLD.plan_id WHEN 'essencial' THEN 50 WHEN 'academia' THEN 150 ELSE 300 END,
    CASE OLD.pending_plan_id WHEN 'essencial' THEN 50 WHEN 'academia' THEN 150 ELSE 300 END);
  v_limit := LEAST(
    CASE NEW.plan_id WHEN 'essencial' THEN 50 WHEN 'academia' THEN 150 ELSE 300 END,
    CASE NEW.pending_plan_id WHEN 'essencial' THEN 50 WHEN 'academia' THEN 150 ELSE 300 END);
  IF v_limit < v_old_limit THEN
    SELECT pg_catalog.count(*) INTO v_count FROM public.students s
    WHERE s.account_id = NEW.account_id AND s.status::text = 'active' AND s.archived_at IS NULL AND s.removed_at IS NULL;
    IF v_count > v_limit THEN RAISE EXCEPTION 'casca_subscription_capacity' USING ERRCODE = '23514'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.casca_guard_plan_capacity() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS casca_capacity_plan_change ON public.casca_subscriptions;
CREATE TRIGGER casca_capacity_plan_change BEFORE UPDATE ON public.casca_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.casca_guard_plan_capacity();

-- Storage mantem leitura e as policies de tenant existentes; o controle novo so restringe escrita.
CREATE OR REPLACE FUNCTION public.casca_storage_can_write(p_name text, p_bucket text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_part text; v_account uuid;
BEGIN
  IF NOT public.casca_billing_enforced() THEN RETURN true; END IF;
  -- Todos os buckets de escrita da aplicacao usam o tenant no path, inclusive fotos de produtos.
  -- Nao depender de nomes configuraveis de buckets para autorizar a operacao.
  v_part := pg_catalog.split_part(p_name, '/', CASE WHEN pg_catalog.split_part(p_name, '/', 1) = 'accounts' THEN 2 ELSE 1 END);
  IF v_part !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN RETURN false; END IF;
  v_account := v_part::uuid;
  RETURN v_account = public.current_account_id() AND public.casca_account_can_write(v_account);
END;
$$;
REVOKE ALL ON FUNCTION public.casca_storage_can_write(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.casca_storage_can_write(text, text) TO authenticated;

DO $$
BEGIN
  IF pg_catalog.to_regclass('storage.objects') IS NULL THEN RETURN; END IF;
  EXECUTE 'DROP POLICY IF EXISTS casca_subscription_insert ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS casca_subscription_update ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS casca_subscription_delete ON storage.objects';
  EXECUTE 'CREATE POLICY casca_subscription_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.casca_storage_can_write(name, bucket_id))';
  EXECUTE 'CREATE POLICY casca_subscription_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.casca_storage_can_write(name, bucket_id)) WITH CHECK (public.casca_storage_can_write(name, bucket_id))';
  EXECUTE 'CREATE POLICY casca_subscription_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING (public.casca_storage_can_write(name, bucket_id))';
END;
$$;

COMMIT;

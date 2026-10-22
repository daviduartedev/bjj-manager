-- #37: troca de modalidade só com a academia vazia, no mesmo lock das escritas operacionais.
BEGIN;

CREATE OR REPLACE FUNCTION public.guard_student_modality () RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_modality text; v_today date;
BEGIN
  -- Compartilha o lock da troca controlada de modalidade (#37).
  SELECT a.modality INTO v_modality FROM public.accounts a WHERE a.id = NEW.account_id FOR SHARE;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '42501'; END IF;
  v_today := (pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date;
  IF v_modality <> 'jiu_jitsu' AND (NEW.kind <> 'adult'::public.student_kind OR NEW.birth_date IS NULL
     OR NEW.birth_date > (v_today - interval '18 years')::date) THEN
    RAISE EXCEPTION 'modality requires adult aged eighteen' USING ERRCODE = '23514';
  END IF;
  IF v_modality IN ('judo', 'muay_thai') THEN
    IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL
       OR NEW.graduation_reference_id IS DISTINCT FROM (CASE v_modality WHEN 'judo' THEN 'cbj-2023' ELSE 'cbmtt-19-khan' END)
       OR NEW.current_rank_code IS NULL
       OR NOT EXISTS (SELECT 1 FROM public.graduation_ranks r JOIN public.graduation_references ref ON ref.id=r.reference_id
                      WHERE r.reference_id=NEW.graduation_reference_id AND r.code=NEW.current_rank_code AND ref.modality=v_modality)
       OR NEW.current_rank_date > v_today THEN
      RAISE EXCEPTION 'invalid referenced graduation' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.graduation_reference_id IS NOT NULL OR NEW.current_rank_code IS NOT NULL OR NEW.current_rank_date IS NOT NULL THEN
      RAISE EXCEPTION 'foreign referenced graduation' USING ERRCODE = '23514';
    END IF;
    IF v_modality = 'boxing' THEN
      IF NEW.current_belt_id IS NOT NULL OR NEW.current_degree IS NOT NULL THEN
        RAISE EXCEPTION 'boxing has no graduation' USING ERRCODE = '23514';
      END IF;
    ELSIF NEW.current_belt_id IS NULL OR NEW.current_degree IS NULL THEN
      RAISE EXCEPTION 'graduation required for graded sport' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_student_modality () FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.lock_account_for_modality_switch() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_account uuid;
BEGIN
  IF TG_TABLE_NAME = 'payments' THEN
    SELECT s.account_id INTO v_account FROM public.students s WHERE s.id = NEW.student_id;
  ELSE
    v_account := NEW.account_id;
  END IF;
  PERFORM 1 FROM public.accounts a WHERE a.id = v_account FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'account unavailable' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.lock_account_for_modality_switch() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payments_lock_account_for_modality_switch ON public.payments;
CREATE TRIGGER payments_lock_account_for_modality_switch
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.lock_account_for_modality_switch();
DROP TRIGGER IF EXISTS generated_documents_lock_account_for_modality_switch ON public.generated_documents;
CREATE TRIGGER generated_documents_lock_account_for_modality_switch
BEFORE INSERT OR UPDATE ON public.generated_documents
FOR EACH ROW EXECUTE FUNCTION public.lock_account_for_modality_switch();

CREATE OR REPLACE FUNCTION public.switch_academy_modality(p_target text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_account uuid;
  v_role text;
  v_current text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'modality switch requires professor' USING ERRCODE = '42501';
  END IF;
  SELECT p.account_id, p.role::text INTO v_account, v_role
  FROM public.profiles p WHERE p.user_id = auth.uid();
  IF v_account IS NULL OR v_role IS DISTINCT FROM 'professor' THEN
    RAISE EXCEPTION 'modality switch requires professor' USING ERRCODE = '42501';
  END IF;
  IF p_target IS NULL OR p_target NOT IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo') THEN
    RAISE EXCEPTION 'invalid academy modality' USING ERRCODE = '22023';
  END IF;

  SELECT a.modality INTO v_current FROM public.accounts a WHERE a.id = v_account FOR UPDATE;
  IF v_current IS NULL THEN
    RAISE EXCEPTION 'modality switch requires professor' USING ERRCODE = '42501';
  END IF;
  IF v_current = p_target THEN
    RAISE EXCEPTION 'modality already selected' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM public.students s WHERE s.account_id = v_account)
     OR EXISTS (SELECT 1 FROM public.classes c WHERE c.account_id = v_account)
     OR EXISTS (SELECT 1 FROM public.class_sessions cs WHERE cs.account_id = v_account)
     OR EXISTS (
       SELECT 1 FROM public.payments pay
       JOIN public.students s ON s.id = pay.student_id
       WHERE s.account_id = v_account
     )
     OR EXISTS (SELECT 1 FROM public.generated_documents d WHERE d.account_id = v_account)
  THEN
    RAISE EXCEPTION 'academy is not empty' USING ERRCODE = '23514';
  END IF;

  UPDATE public.accounts
  SET modality = p_target, updated_at = pg_catalog.now()
  WHERE id = v_account;
END;
$$;
REVOKE ALL ON FUNCTION public.switch_academy_modality(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.switch_academy_modality(text) TO authenticated;
COMMENT ON FUNCTION public.switch_academy_modality(text) IS
  'Troca a modalidade só sem aluno, turma, aula, pagamento ou documento. Planos comerciais não entram na trava e não são apagados.';

COMMIT;

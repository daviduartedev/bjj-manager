-- #34: esporte da turma independente do público etário legado.
BEGIN;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS modality text;
UPDATE public.classes c SET modality = a.modality FROM public.accounts a
WHERE a.id = c.account_id AND c.modality IS NULL;
ALTER TABLE public.classes ALTER COLUMN modality SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE public.classes ADD CONSTRAINT classes_modality_ck
    CHECK (modality IN ('jiu_jitsu', 'boxing', 'muay_thai', 'judo'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON COLUMN public.classes.modality IS 'Esporte da academia; kind conserva o público adult/kids/baby.';

CREATE OR REPLACE FUNCTION public.guard_class_modality() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  -- Compartilha o lock usado pela troca controlada de modalidade (#37).
  SELECT a.modality INTO v_modality FROM public.accounts a WHERE a.id = NEW.account_id FOR SHARE;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'class account unavailable' USING ERRCODE = '23514'; END IF;
  -- Clientes anteriores enviam apenas kind; o esporte sempre vem da academia.
  IF TG_OP = 'INSERT' AND NEW.modality IS NULL THEN NEW.modality := v_modality; END IF;
  IF NEW.modality IS DISTINCT FROM v_modality OR
     (v_modality <> 'jiu_jitsu' AND NEW.kind <> 'adult'::public.student_kind) THEN
    RAISE EXCEPTION 'incompatible class modality or audience' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.instructor_profile_id
    AND p.account_id = NEW.account_id AND p.role = 'professor'::public.profile_role) THEN
    RAISE EXCEPTION 'instructor unavailable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_class_modality() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS classes_guard_modality ON public.classes;
CREATE TRIGGER classes_guard_modality BEFORE INSERT OR UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.guard_class_modality();

-- RLS limita o ator; estes guards validam também as FKs reais dentro do tenant.
CREATE OR REPLACE FUNCTION public.guard_class_relation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_modality text;
BEGIN
  SELECT a.modality INTO v_modality FROM public.classes c
  JOIN public.accounts a ON a.id = c.account_id
  WHERE c.id = NEW.class_id AND c.account_id = NEW.account_id
    AND c.modality = a.modality
    AND (a.modality = 'jiu_jitsu' OR c.kind = 'adult'::public.student_kind)
  FOR SHARE OF a, c;
  IF v_modality IS NULL THEN RAISE EXCEPTION 'class unavailable' USING ERRCODE = '23514'; END IF;
  IF TG_TABLE_NAME = 'student_class_enrollments' THEN
    IF NOT EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = NEW.student_id AND s.account_id = NEW.account_id
      AND s.archived_at IS NULL AND s.removed_at IS NULL
      AND (v_modality = 'jiu_jitsu' OR (s.kind = 'adult'::public.student_kind AND s.birth_date IS NOT NULL
        AND s.birth_date <= ((pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years')::date))
    ) THEN RAISE EXCEPTION 'student unavailable' USING ERRCODE = '23514'; END IF;
  END IF;
  -- Não impor igualdade literal entre kind da turma e da ficha JJ:
  -- o público Baby legado pode ter ficha kids.
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_class_relation() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS schedules_guard_class_relation ON public.class_recurring_schedules;
CREATE TRIGGER schedules_guard_class_relation BEFORE INSERT OR UPDATE ON public.class_recurring_schedules
FOR EACH ROW EXECUTE FUNCTION public.guard_class_relation();
DROP TRIGGER IF EXISTS sessions_guard_class_relation ON public.class_sessions;
CREATE TRIGGER sessions_guard_class_relation BEFORE INSERT OR UPDATE ON public.class_sessions
FOR EACH ROW EXECUTE FUNCTION public.guard_class_relation();
DROP TRIGGER IF EXISTS enrollments_guard_class_relation ON public.student_class_enrollments;
CREATE TRIGGER enrollments_guard_class_relation BEFORE INSERT OR UPDATE ON public.student_class_enrollments
FOR EACH ROW EXECUTE FUNCTION public.guard_class_relation();

CREATE OR REPLACE FUNCTION public.guard_session_participant() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_class_id uuid; v_modality text;
BEGIN
  SELECT c.id, a.modality INTO v_class_id, v_modality FROM public.class_sessions cs
  JOIN public.classes c ON c.id = cs.class_id AND c.account_id = cs.account_id
  JOIN public.accounts a ON a.id = c.account_id
  WHERE cs.id = NEW.class_session_id AND cs.account_id = NEW.account_id AND c.modality = a.modality
    AND (a.modality = 'jiu_jitsu' OR c.kind = 'adult'::public.student_kind)
  FOR SHARE OF a, c, cs;
  IF v_class_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.student_class_enrollments e
    JOIN public.students s ON s.id = e.student_id AND s.account_id = e.account_id
    WHERE e.class_id = v_class_id AND e.student_id = NEW.student_id AND e.account_id = NEW.account_id
      AND s.archived_at IS NULL AND s.removed_at IS NULL
      AND (v_modality = 'jiu_jitsu' OR (s.kind = 'adult'::public.student_kind AND s.birth_date IS NOT NULL
        AND s.birth_date <= ((pg_catalog.now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years')::date))
  ) THEN RAISE EXCEPTION 'session or enrolled student unavailable' USING ERRCODE = '23514'; END IF;
  IF TG_TABLE_NAME = 'attendances' THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.recorded_by
      AND p.account_id = NEW.account_id AND p.role = 'professor'::public.profile_role) THEN
      RAISE EXCEPTION 'attendance recorder unavailable' USING ERRCODE = '23514';
    END IF;
    IF NEW.origin = 'checkin_student'::public.attendance_origin AND NOT EXISTS (
      SELECT 1 FROM public.check_ins ci WHERE ci.class_session_id = NEW.class_session_id
        AND ci.student_id = NEW.student_id AND ci.account_id = NEW.account_id
    ) THEN RAISE EXCEPTION 'check-in unavailable' USING ERRCODE = '23514'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_session_participant() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS check_ins_guard_session_participant ON public.check_ins;
CREATE TRIGGER check_ins_guard_session_participant BEFORE INSERT OR UPDATE ON public.check_ins
FOR EACH ROW EXECUTE FUNCTION public.guard_session_participant();
DROP TRIGGER IF EXISTS attendances_guard_session_participant ON public.attendances;
CREATE TRIGGER attendances_guard_session_participant BEFORE INSERT OR UPDATE ON public.attendances
FOR EACH ROW EXECUTE FUNCTION public.guard_session_participant();
COMMIT;
